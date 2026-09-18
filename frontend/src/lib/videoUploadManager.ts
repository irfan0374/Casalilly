import axios from "axios";
import { useSyncExternalStore } from "react";
import { getVideoUploadSignature, updateProduct, uploadVideoDirect } from "../api/products";
import { compressVideo, shouldCompress } from "./videoCompression";

export type VideoJobStatus =
  | "compressing"
  | "uploading"
  | "attaching"
  | "done"
  | "error";

export interface VideoJob {
  token: string;
  productId: string | number | null;
  status: VideoJobStatus;
  progress: number;
  error?: string;
}

type Listener = () => void;

const jobs = new Map<string, VideoJob>();
let snapshot: ReadonlyMap<string, VideoJob> = new Map();
const listeners = new Set<Listener>();
// Lets a still-running job find out (after the fact) that the product form
// already submitted without it, and which product id to attach itself to.
const submitHandlers = new Map<string, (productId: string | number) => void>();

function commit() {
  snapshot = new Map(jobs);
  listeners.forEach((listener) => listener());
}

function updateJob(token: string, patch: Partial<VideoJob>) {
  const existing = jobs.get(token);
  if (!existing) return;
  jobs.set(token, { ...existing, ...patch });
  commit();
}

export function subscribeVideoJobs(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getVideoJobsSnapshot(): ReadonlyMap<string, VideoJob> {
  return snapshot;
}

export function getVideoJobForProduct(
  productId: string | number
): VideoJob | undefined {
  for (const job of snapshot.values()) {
    if (job.productId !== null && String(job.productId) === String(productId)) {
      return job;
    }
  }
  return undefined;
}

interface StartJobOptions {
  file: File;
  authToken: string;
  /** Known upfront when editing an existing product; null for a new one
   * that hasn't been created yet. */
  productId: string | number | null;
  /** Fires with the final url/public_id only if the form hasn't submitted
   * yet — lets the normal create/update payload carry the video in the
   * common case where the upload finishes before Save is clicked. */
  onReadyForForm: (url: string, publicId: string) => void;
  onError?: (message: string) => void;
}

/**
 * Runs video compression + upload as a detached job that isn't tied to the
 * VideoUploader component's lifetime — so clicking Save before it finishes
 * doesn't abandon it. If the form has already submitted by the time the
 * upload completes, this attaches the video to the product itself via a
 * follow-up API call instead of handing it back to the (now-unmounted) form.
 */
export function startVideoJob({
  file,
  authToken,
  productId,
  onReadyForForm,
  onError,
}: StartJobOptions): string {
  const jobToken = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  jobs.set(jobToken, {
    token: jobToken,
    productId,
    status: "compressing",
    progress: 0,
  });
  commit();

  let submitted = false;
  let submittedProductId: string | number | null = null;
  submitHandlers.set(jobToken, (id) => {
    submitted = true;
    submittedProductId = id;
  });

  (async () => {
    try {
      let toUpload = file;
      if (shouldCompress(file)) {
        toUpload = await compressVideo(file, (percent) =>
          updateJob(jobToken, { status: "compressing", progress: percent })
        );
      }

      updateJob(jobToken, { status: "uploading", progress: 0 });
      const sig = await getVideoUploadSignature(authToken);
      const { url, public_id } = await uploadVideoDirect(
        toUpload,
        sig,
        (percent) => updateJob(jobToken, { status: "uploading", progress: percent })
      );

      if (submitted) {
        const targetId = submittedProductId;
        updateJob(jobToken, { status: "attaching", productId: targetId });
        if (targetId != null) {
          // video_public_id isn't tracked on the frontend at all (matching
          // the existing image_public_id precedent) — only the URL round-trips.
          await updateProduct(targetId, { video_url: url }, authToken);
        }
      } else {
        onReadyForForm(url, public_id);
      }
      updateJob(jobToken, { status: "done", progress: 100 });
    } catch (err) {
      // Without this the real cause (Cloudinary rejection, expired signed-in
      // session, network timeout, etc.) was discarded entirely, leaving
      // "upload failed" with no way to tell why.
      console.error("Video upload job failed:", err);
      let message = "Upload failed. Please try again.";
      if (axios.isAxiosError(err)) {
        message =
          err.response?.status === 401
            ? "Your session expired during upload — please log in again."
            : err.response?.data?.detail || err.message || message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      updateJob(jobToken, { status: "error", error: message });
      onError?.(message);
    } finally {
      submitHandlers.delete(jobToken);
      // Keep the finished/failed state visible briefly (so a list-page
      // badge can show "completed") before clearing it out.
      setTimeout(() => {
        jobs.delete(jobToken);
        commit();
      }, 5000);
    }
  })();

  return jobToken;
}

/** Called once the product form's create/update request has actually gone
 * out — tells the job it's now responsible for attaching itself. */
export function markVideoJobSubmitted(
  jobToken: string,
  productId: string | number
) {
  // Update the visible job right away — for a brand-new product this is the
  // first time it has an id at all, so the list page can't find/show this
  // job until this fires (otherwise it would only appear in the final
  // instant, right as the job finishes).
  updateJob(jobToken, { productId });
  submitHandlers.get(jobToken)?.(productId);
}

/** Live status for a specific job token — used by VideoUploader to drive
 * its own progress UI regardless of whether the form has submitted. */
export function useVideoJob(jobToken: string | null): VideoJob | undefined {
  return useSyncExternalStore(subscribeVideoJobs, () =>
    jobToken ? snapshot.get(jobToken) : undefined
  );
}

/** Live status for whichever job (if any) is currently attaching a video to
 * this product — used by the admin product list to show an
 * uploading/completed indicator even after the form that started it has
 * navigated away. */
export function useVideoJobForProduct(
  productId: string | number
): VideoJob | undefined {
  return useSyncExternalStore(subscribeVideoJobs, () =>
    getVideoJobForProduct(productId)
  );
}

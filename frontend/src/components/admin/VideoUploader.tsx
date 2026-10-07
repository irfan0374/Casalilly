import { useState } from "react";
import { Loader2, Play, Video, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { startVideoJob, useVideoJob } from "../../lib/videoUploadManager";

interface VideoUploaderProps {
  /** Known upfront when editing an existing product; null when creating a
   * new one that doesn't have an id yet. */
  productId: string | number | null;
  videoUrl: string | null;
  onUploaded: (url: string, publicId: string) => void;
  onRemove: () => void;
  /** Lets the parent form know which background job (if any) is currently
   * in flight, so it can hand the job the product id once Save creates or
   * updates the product — even if that happens before the upload finishes. */
  onJobTokenChange: (token: string | null) => void;
}

export default function VideoUploader({
  productId,
  videoUrl,
  onUploaded,
  onRemove,
  onJobTokenChange,
}: VideoUploaderProps) {
  const { token } = useAuth();
  // Local preview, shown immediately on file pick (ahead of the upload
  // finishing) so the tile doesn't sit in its empty state for the whole
  // upload — mirrors ImageUploader's local-preview-first pattern.
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [jobToken, setJobToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const job = useVideoJob(jobToken);

  const uploading = job !== undefined && job.status !== "done" && job.status !== "error";

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !token) return;

    setPreview(URL.createObjectURL(file));
    setFileName(file.name);
    setError(null);

    const newToken = startVideoJob({
      file,
      authToken: token,
      productId,
      onReadyForForm: (url, publicId) => {
        onUploaded(url, publicId);
        setJobToken(null);
        onJobTokenChange(null);
      },
      onError: (message) => {
        setError(message);
        setPreview(null);
        setJobToken(null);
        onJobTokenChange(null);
      },
    });
    setJobToken(newToken);
    onJobTokenChange(newToken);
  }

  const shown = preview ?? videoUrl;

  if (!shown) {
    return (
      <div className="flex flex-col gap-2">
        <label className="flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/40 p-4 transition hover:border-rose-400 hover:bg-rose-50">
          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white text-rose-600 shadow-sm">
            <Video className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-[15px] font-semibold text-stone-800">Add a video</span>
            <span className="block text-sm text-stone-500">Optional · short clips work best</span>
          </span>
          <input type="file" accept="video/*" onChange={handleFileChange} className="sr-only" />
        </label>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  const stage = job?.status === "compressing" ? "Compressing" : "Uploading";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4 rounded-2xl bg-stone-50 p-3">
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-stone-200">
          <video src={shown} muted playsInline preload="metadata" className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/25">
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-white" aria-hidden="true" />
            ) : (
              <Play className="h-5 w-5 text-white" fill="currentColor" aria-hidden="true" />
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          {uploading && job ? (
            <>
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm font-semibold text-stone-800">{fileName ?? "Video"}</p>
                <span className="text-sm font-semibold text-rose-700">{job.progress}%</span>
              </div>
              <p className="text-xs text-stone-500">{stage}…</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-rose-100">
                <div className="h-full rounded-full bg-rose-600 transition-all" style={{ width: `${job.progress}%` }} />
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-stone-800">Video added</p>
              <p className="text-xs text-stone-500">Plays on the product page</p>
            </>
          )}
        </div>

        {!uploading && (
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              setFileName(null);
              onRemove();
            }}
            aria-label="Remove video"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-200"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {uploading && (
        <p className="text-xs text-rose-700">
          You can save now — the video keeps uploading in the background and attaches itself when ready.
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

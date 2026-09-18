import { useState } from "react";
import { Loader2, Play } from "lucide-react";
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
  // finishing) so the tile doesn't sit in its empty dashed state for the
  // whole upload — mirrors ImageUploader's local-preview-first pattern.
  const [preview, setPreview] = useState<string | null>(null);
  const [jobToken, setJobToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const job = useVideoJob(jobToken);

  const uploading = job !== undefined && job.status !== "done" && job.status !== "error";

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !token) return;

    setPreview(URL.createObjectURL(file));
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
      onError: () => {
        setError("Upload failed. Please try again.");
        setPreview(null);
        setJobToken(null);
        onJobTokenChange(null);
      },
    });
    setJobToken(newToken);
    onJobTokenChange(newToken);
  }

  const shown = preview ?? videoUrl;

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-stone-700">
        Product Video (optional)
      </label>
      <div className="flex flex-wrap gap-3">
        {shown ? (
          <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-rose-100 bg-rose-50">
            <video
              src={shown}
              muted
              playsInline
              preload="metadata"
              className="h-full w-full object-cover"
            />
            {!uploading && (
              <>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full bg-black/40 p-2">
                    <Play className="h-5 w-5 text-white" fill="currentColor" aria-hidden="true" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPreview(null);
                    onRemove();
                  }}
                  aria-label="Remove video"
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  ×
                </button>
              </>
            )}
            {uploading && job && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-white/80">
                <Loader2 className="h-5 w-5 animate-spin text-rose-500" aria-hidden="true" />
                <span className="text-xs font-medium text-rose-600">
                  {job.status === "compressing" ? "Compressing" : "Uploading"} {job.progress}%
                </span>
              </div>
            )}
          </div>
        ) : (
          <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-rose-200 text-rose-400 transition hover:border-rose-400 hover:text-rose-500">
            <span className="text-2xl leading-none">+</span>
            <span className="text-xs">Add Video</span>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}
      </div>
      {uploading && (
        <p className="text-xs text-stone-400">
          You can save now — the video will keep uploading in the background
          and attach itself once ready (check the product list for status).
        </p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

import { useState } from "react";
import { Loader2, Play } from "lucide-react";
import { getVideoUploadSignature, uploadVideoDirect } from "../../api/products";
import { useAuth } from "../../context/AuthContext";
import { compressVideo, shouldCompress } from "../../lib/videoCompression";

interface VideoUploaderProps {
  videoUrl: string | null;
  onUploaded: (url: string, publicId: string) => void;
  onRemove: () => void;
}

type Phase = "compressing" | "uploading" | null;

export default function VideoUploader({
  videoUrl,
  onUploaded,
  onRemove,
}: VideoUploaderProps) {
  const { token } = useAuth();
  // Local preview, shown immediately on file pick (ahead of the upload
  // finishing) so the tile doesn't sit in its empty dashed state for the
  // whole upload — mirrors ImageUploader's local-preview-first pattern.
  const [preview, setPreview] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploading = phase !== null;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !token) return;

    setPreview(URL.createObjectURL(file));
    setError(null);

    let toUpload = file;
    if (shouldCompress(file)) {
      setPhase("compressing");
      setProgress(0);
      toUpload = await compressVideo(file, setProgress);
    }

    setPhase("uploading");
    setProgress(0);
    try {
      const sig = await getVideoUploadSignature(token);
      const { url, public_id } = await uploadVideoDirect(toUpload, sig, setProgress);
      onUploaded(url, public_id);
    } catch {
      setError("Upload failed. Please try again.");
      setPreview(null);
    } finally {
      setPhase(null);
    }
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
            {uploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-white/80">
                <Loader2 className="h-5 w-5 animate-spin text-rose-500" aria-hidden="true" />
                <span className="text-xs font-medium text-rose-600">
                  {phase === "compressing" ? "Compressing" : "Uploading"} {progress}%
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
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

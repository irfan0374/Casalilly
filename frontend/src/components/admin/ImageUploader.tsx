import { useState } from "react";
import { Camera, Loader2, RefreshCw, RotateCcw, RotateCw } from "lucide-react";
import { uploadImage } from "../../api/products";
import { useAuth } from "../../context/AuthContext";

interface ImageUploaderProps {
  imageUrl: string | null;
  onUploaded: (url: string, publicId: string) => void;
  /** "portrait" (4:5) for product cover photos, "wide" (16:9) for banners. */
  aspect?: "portrait" | "wide";
  emptyLabel?: string;
  emptyHint?: string;
  error?: string | null;
}

/** Rotates image bytes by ±90/180 degrees on a canvas and re-exports them.
 * `imageOrientation: "from-image"` normalizes any EXIF rotation tag first
 * (the usual reason a landscape phone photo looks sideways), so what you
 * see rotating here is what actually gets stored. PNG stays lossless;
 * everything else re-encodes at 0.98 quality — as close to the original as
 * a rotate (which requires re-encoding) can get. */
async function rotateImageBlob(source: Blob, degrees: number): Promise<Blob> {
  const bitmap = await createImageBitmap(source, { imageOrientation: "from-image" });
  const swap = ((degrees % 180) + 180) % 180 !== 0;
  const canvas = document.createElement("canvas");
  canvas.width = swap ? bitmap.height : bitmap.width;
  canvas.height = swap ? bitmap.width : bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((degrees * Math.PI) / 180);
  ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
  bitmap.close();

  const mimeType = source.type === "image/png" ? "image/png" : "image/jpeg";
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to export rotated image"))),
      mimeType,
      mimeType === "image/png" ? undefined : 0.98
    );
  });
}

export default function ImageUploader({
  imageUrl,
  onUploaded,
  aspect = "portrait",
  emptyLabel = "Tap to add a photo",
  emptyHint,
  error: fieldError,
}: ImageUploaderProps) {
  const { token } = useAuth();
  const [preview, setPreview] = useState<string | null>(imageUrl);
  // The raw bytes behind the current preview, when we already have them in
  // memory (just picked, or just rotated) — lets a second rotate skip
  // re-fetching. Reset to null for an existing (already-uploaded) image, in
  // which case a rotate fetches its bytes from `preview` first.
  const [currentBlob, setCurrentBlob] = useState<Blob | null>(null);
  const [uploading, setUploading] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !token) return;

    // Local preview immediately, ahead of the network round trip.
    setPreview(URL.createObjectURL(file));
    setCurrentBlob(file);
    setUploading(true);
    setError(null);

    try {
      const { url, public_id } = await uploadImage(file, token);
      onUploaded(url, public_id);
      setPreview(url);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleRotate(degrees: 90 | -90) {
    if (!preview || !token || uploading || rotating) return;
    setRotating(true);
    setError(null);
    try {
      const source = currentBlob ?? (await (await fetch(preview)).blob());
      const rotatedBlob = await rotateImageBlob(source, degrees);
      const rotatedFile = new File(
        [rotatedBlob],
        rotatedBlob.type === "image/png" ? "rotated.png" : "rotated.jpg",
        { type: rotatedBlob.type }
      );

      setPreview(URL.createObjectURL(rotatedBlob));
      setCurrentBlob(rotatedBlob);

      setUploading(true);
      const { url, public_id } = await uploadImage(rotatedFile, token);
      onUploaded(url, public_id);
      setPreview(url);
    } catch {
      setError("Couldn't rotate this image. Please try again.");
    } finally {
      setRotating(false);
      setUploading(false);
    }
  }

  const busy = uploading || rotating;
  const ratio = aspect === "wide" ? "aspect-video" : "aspect-[4/5]";
  // The empty drop zone doesn't need the full portrait height — on a phone
  // that would fill the whole screen before any photo is picked.
  const emptyRatio = aspect === "wide" ? "aspect-video" : "aspect-[4/3]";
  const shownError = error ?? fieldError;

  const fileInput = (
    <input type="file" accept="image/*" onChange={handleFileChange} disabled={busy} className="sr-only" />
  );

  return (
    <div className="flex flex-col gap-2">
      {preview ? (
        <div className={`relative ${ratio} w-full overflow-hidden rounded-2xl bg-stone-100`}>
          <img src={preview} alt="" className="h-full w-full object-cover" />

          <div className="absolute right-3 top-3 flex gap-2">
            <button
              type="button"
              onClick={() => handleRotate(-90)}
              disabled={busy}
              aria-label="Rotate left"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-stone-700 shadow-sm backdrop-blur transition hover:bg-white disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => handleRotate(90)}
              disabled={busy}
              aria-label="Rotate right"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-stone-700 shadow-sm backdrop-blur transition hover:bg-white disabled:opacity-50"
            >
              <RotateCw className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <label
            className={`absolute bottom-3 right-3 flex h-10 cursor-pointer items-center gap-1.5 rounded-full bg-rose-600 px-4 text-sm font-semibold text-white shadow-md transition hover:bg-rose-700 ${
              busy ? "pointer-events-none opacity-60" : ""
            }`}
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Change
            {fileInput}
          </label>

          {busy && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/70 backdrop-blur-[1px]">
              <Loader2 className="h-7 w-7 animate-spin text-rose-600" aria-hidden="true" />
              <span className="text-sm font-medium text-stone-700">
                {rotating ? "Rotating…" : "Uploading…"}
              </span>
            </div>
          )}
        </div>
      ) : (
        <label
          className={`flex ${emptyRatio} w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-rose-50/40 px-6 text-center transition hover:bg-rose-50 ${
            shownError ? "border-red-300" : "border-rose-200 hover:border-rose-400"
          }`}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-rose-600 shadow-sm">
            <Camera className="h-6 w-6" aria-hidden="true" />
          </span>
          <span className="text-[15px] font-semibold text-stone-800">{emptyLabel}</span>
          {emptyHint && <span className="text-sm text-stone-500">{emptyHint}</span>}
          {fileInput}
        </label>
      )}

      {shownError && (
        <p className="text-sm text-red-600" role="alert">
          {shownError}
        </p>
      )}
    </div>
  );
}

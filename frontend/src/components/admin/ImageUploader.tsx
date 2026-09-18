import { useState } from "react";
import { Loader2, RotateCcw, RotateCw } from "lucide-react";
import { uploadImage } from "../../api/products";
import { useAuth } from "../../context/AuthContext";

interface ImageUploaderProps {
  imageUrl: string | null;
  onUploaded: (url: string, publicId: string) => void;
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
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
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

  async function handleRotate(e: React.MouseEvent, degrees: 90 | -90) {
    e.preventDefault();
    e.stopPropagation();
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

      const localPreview = URL.createObjectURL(rotatedBlob);
      setPreview(localPreview);
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

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-stone-700">
        Image <span className="text-red-500">*</span>
      </label>

      {preview ? (
        <label className="relative h-40 w-40 cursor-pointer overflow-hidden rounded-xl border border-rose-100 bg-rose-50">
          <img
            src={preview}
            alt="Preview"
            className="h-full w-full object-cover"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={busy}
            className="hidden"
          />

          <button
            type="button"
            onClick={(e) => handleRotate(e, -90)}
            disabled={busy}
            aria-label="Rotate left"
            className="absolute bottom-1 left-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80 disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={(e) => handleRotate(e, 90)}
            disabled={busy}
            aria-label="Rotate right"
            className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80 disabled:opacity-50"
          >
            <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
          </button>

          {busy && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Loader2 className="h-6 w-6 animate-spin text-rose-500" aria-hidden="true" />
            </div>
          )}
        </label>
      ) : (
        <label className="flex h-40 w-40 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-rose-200 text-rose-400 transition hover:border-rose-400 hover:text-rose-500">
          <span className="text-2xl leading-none">+</span>
          <span className="text-xs">Add Image</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={busy}
            className="hidden"
          />
        </label>
      )}

      {rotating && <p className="text-sm text-stone-400">Rotating…</p>}
      {uploading && !rotating && <p className="text-sm text-stone-400">Uploading…</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

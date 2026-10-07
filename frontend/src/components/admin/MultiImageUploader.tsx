import { useState } from "react";
import { ChevronLeft, Loader2, Plus, X } from "lucide-react";
import { uploadImage } from "../../api/products";
import { useAuth } from "../../context/AuthContext";

const MAX_IMAGES = 3;

export interface UploadedImage {
  url: string;
  /** "" when unknown (an image saved before public ids were tracked). */
  publicId: string;
}

interface MultiImageUploaderProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
}

/** Up to three extra gallery photos in a row of square slots. */
export default function MultiImageUploader({ images, onChange }: MultiImageUploaderProps) {
  const { token } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !token || images.length >= MAX_IMAGES) return;

    setUploading(true);
    setError(null);
    try {
      const { url, public_id } = await uploadImage(file, token);
      onChange([...images, { url, publicId: public_id }]);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function removeAt(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  /** Swaps a photo with the one before it — the order is the shop gallery's order. */
  function moveEarlier(index: number) {
    if (index === 0) return;
    const next = [...images];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-3">
        {images.map(({ url }, index) => (
          <div key={url} className="relative aspect-square overflow-hidden rounded-2xl bg-stone-100">
            <img src={url} alt={`Extra photo ${index + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(index)}
              aria-label={`Remove photo ${index + 1}`}
              className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white transition hover:bg-black/75"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
            {index > 0 && (
              <button
                type="button"
                onClick={() => moveEarlier(index)}
                aria-label={`Move photo ${index + 1} earlier`}
                className="absolute bottom-1.5 left-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-stone-700 shadow-sm transition hover:bg-white"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        ))}

        {images.length < MAX_IMAGES && (
          <label
            className={`flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/40 text-rose-700 transition hover:border-rose-400 hover:bg-rose-50 ${
              uploading ? "pointer-events-none" : ""
            }`}
          >
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
            ) : (
              <>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm">
                  <Plus className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-xs font-semibold">Add photo</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="sr-only"
            />
          </label>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

import { useState } from "react";
import { uploadImage } from "../../api/products";
import { useAuth } from "../../context/AuthContext";

const MAX_IMAGES = 3;

interface MultiImageUploaderProps {
  imageUrls: string[];
  onChange: (urls: string[]) => void;
}

export default function MultiImageUploader({
  imageUrls,
  onChange,
}: MultiImageUploaderProps) {
  const { token } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !token || imageUrls.length >= MAX_IMAGES) return;

    setUploading(true);
    setError(null);
    try {
      const { url } = await uploadImage(file, token);
      onChange([...imageUrls, url]);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function removeAt(index: number) {
    onChange(imageUrls.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-stone-700">
        Additional Images ({imageUrls.length}/{MAX_IMAGES})
      </label>
      <div className="flex flex-wrap gap-3">
        {imageUrls.map((url, index) => (
          <div
            key={url + index}
            className="relative h-24 w-24 overflow-hidden rounded-xl border border-rose-100 bg-rose-50"
          >
            <img
              src={url}
              alt={`Extra ${index + 1}`}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeAt(index)}
              aria-label="Remove image"
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              ×
            </button>
          </div>
        ))}

        {imageUrls.length < MAX_IMAGES && (
          <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-rose-200 text-rose-400 transition hover:border-rose-400 hover:text-rose-500">
            <span className="text-2xl leading-none">+</span>
            <span className="text-xs">Add</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>
      {uploading && <p className="text-sm text-stone-400">Uploading…</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

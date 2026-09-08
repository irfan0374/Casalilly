import { useState } from "react";
import { uploadImage } from "../../api/products";
import { useAuth } from "../../context/AuthContext";

interface ImageUploaderProps {
  imageUrl: string | null;
  onUploaded: (url: string, publicId: string) => void;
}

export default function ImageUploader({
  imageUrl,
  onUploaded,
}: ImageUploaderProps) {
  const { token } = useAuth();
  const [preview, setPreview] = useState<string | null>(imageUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    // Local preview immediately, ahead of the network round trip.
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
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

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-stone-700">
        Image <span className="text-red-500">*</span>
      </label>
      {preview && (
        <div className="h-40 w-40 overflow-hidden rounded-xl border border-rose-100 bg-rose-50">
          <img
            src={preview}
            alt="Product preview"
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="text-sm text-stone-600 file:mr-3 file:rounded-full file:border-0 file:bg-rose-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-rose-700 hover:file:bg-rose-200"
      />
      {uploading && <p className="text-sm text-stone-400">Uploading…</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

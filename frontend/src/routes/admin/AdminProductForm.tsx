import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createProduct,
  getCategories,
  getProduct,
  updateProduct,
} from "../../api/products";
import ImageUploader from "../../components/admin/ImageUploader";
import MultiImageUploader from "../../components/admin/MultiImageUploader";
import VideoUploader from "../../components/admin/VideoUploader";
import { useAuth } from "../../context/AuthContext";
import { markVideoJobSubmitted } from "../../lib/videoUploadManager";
import type { ProductInput } from "../../types";

const EMPTY_FORM: ProductInput = {
  name: "",
  description: "",
  price: 0,
  category: "",
  image_url: null,
  extra_image_urls: [],
  video_url: null,
  is_active: true,
  is_featured: false,
};

export default function AdminProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { token } = useAuth();

  const [form, setForm] = useState<ProductInput>(EMPTY_FORM);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Not state — this only needs to be read once, inside handleSubmit, and
  // shouldn't trigger a re-render when it changes.
  const activeVideoJobTokenRef = useRef<string | null>(null);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!isEditing || !id) return;
    let cancelled = false;
    getProduct(id)
      .then((product) => {
        if (cancelled) return;
        setForm({
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          image_url: product.image_url,
          extra_image_urls: product.extra_image_urls ?? [],
          video_url: product.video_url,
          is_active: product.is_active,
          is_featured: product.is_featured,
        });
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load this product.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, isEditing]);

  function updateField<K extends keyof ProductInput>(
    key: K,
    value: ProductInput[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (!form.image_url) {
      setError("Please upload a product image before saving.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      let savedId: string | number;
      if (isEditing && id) {
        await updateProduct(id, form, token);
        savedId = id;
      } else {
        const created = await createProduct(form, token);
        savedId = created.id;
      }
      // If a video is still compressing/uploading in the background, hand
      // it the id it should attach itself to once it's ready — we're not
      // waiting for it before navigating away.
      if (activeVideoJobTokenRef.current) {
        markVideoJobSubmitted(activeVideoJobTokenRef.current, savedId);
      }
      navigate("/admin");
    } catch {
      setError("Failed to save product. Please check the form and try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p className="py-24 text-center text-stone-400">Loading product…</p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-stone-800">
        {isEditing ? "Edit Product" : "Add Product"}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-2xl border border-rose-100 bg-white p-8 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">
            Name
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">
            Description
          </label>
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">
              Price (AED)
            </label>
            <input
              type="number"
              required
              min={0}
              step="0.01"
              placeholder="0.00"
              value={form.price || ""}
              onChange={(e) =>
                updateField("price", parseFloat(e.target.value) || 0)
              }
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">
              Category
            </label>
            <select
              required
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <ImageUploader
          imageUrl={form.image_url}
          onUploaded={(url) => updateField("image_url", url)}
        />

        <MultiImageUploader
          imageUrls={form.extra_image_urls}
          onChange={(urls) => updateField("extra_image_urls", urls)}
        />

        <VideoUploader
          productId={isEditing && id ? id : null}
          videoUrl={form.video_url}
          onUploaded={(url) => updateField("video_url", url)}
          onRemove={() => updateField("video_url", null)}
          onJobTokenChange={(t) => {
            activeVideoJobTokenRef.current = t;
          }}
        />

        <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => updateField("is_active", e.target.checked)}
            className="h-4 w-4 rounded border-stone-300 text-rose-600 focus:ring-rose-400"
          />
          Active (visible in storefront)
        </label>

        <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
          <input
            type="checkbox"
            checked={form.is_featured}
            onChange={(e) => updateField("is_featured", e.target.checked)}
            className="h-4 w-4 rounded border-stone-300 text-rose-600 focus:ring-rose-400"
          />
          Feature on homepage (Best Sellers)
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : isEditing ? "Save Changes" : "Create Product"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin")}
            className="rounded-lg border border-stone-200 px-5 py-2.5 text-sm font-medium text-stone-600 transition hover:bg-stone-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

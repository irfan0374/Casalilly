import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  adminGetHeroSlide,
  createHeroSlide,
  updateHeroSlide,
} from "../../api/heroSlides";
import ImageUploader from "../../components/admin/ImageUploader";
import { useAuth } from "../../context/AuthContext";
import type { HeroSlideInput } from "../../types";

const EMPTY_FORM: HeroSlideInput = {
  image_url: null,
  image_public_id: null,
  heading: "",
  subheading: "",
  is_active: true,
  sort_order: 0,
};

export default function HeroSlideForm() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { token } = useAuth();

  const [form, setForm] = useState<HeroSlideInput>(EMPTY_FORM);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditing || !id || !token) return;
    let cancelled = false;
    adminGetHeroSlide(id, token)
      .then((slide) => {
        if (cancelled) return;
        setForm({
          image_url: slide.image_url,
          image_public_id: slide.image_public_id,
          heading: slide.heading ?? "",
          subheading: slide.subheading ?? "",
          is_active: slide.is_active,
          sort_order: slide.sort_order,
        });
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load this hero banner.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, isEditing, token]);

  function updateField<K extends keyof HeroSlideInput>(
    key: K,
    value: HeroSlideInput[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (!form.image_url) {
      setError("Please upload a banner image before saving.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (isEditing && id) {
        await updateHeroSlide(Number(id), form, token);
      } else {
        await createHeroSlide(
          { ...form, image_url: form.image_url },
          token
        );
      }
      navigate("/admin/hero-slides");
    } catch {
      setError("Failed to save hero banner. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="py-24 text-center text-stone-400">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-stone-800">
        {isEditing ? "Edit Hero Banner" : "Add Hero Banner"}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-2xl border border-rose-100 bg-white p-8 shadow-sm"
      >
        <ImageUploader
          imageUrl={form.image_url}
          onUploaded={(url, publicId) => {
            updateField("image_url", url);
            updateField("image_public_id", publicId);
          }}
        />
        <p className="-mt-3 text-xs text-stone-400">
          Best results with a wide, landscape photo — it spans the full width
          of the hero banner.
        </p>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">
            Heading
          </label>
          <input
            type="text"
            value={form.heading ?? ""}
            onChange={(e) => updateField("heading", e.target.value)}
            placeholder="Fresh Flowers & Gifts, Delivered with Love"
            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">
            Subtext
          </label>
          <textarea
            rows={3}
            value={form.subheading ?? ""}
            onChange={(e) => updateField("subheading", e.target.value)}
            placeholder="Handpicked bouquets, plants & gift baskets for every occasion…"
            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">
            Display order
          </label>
          <input
            type="number"
            value={form.sort_order}
            onChange={(e) =>
              updateField("sort_order", parseInt(e.target.value, 10) || 0)
            }
            className="w-32 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
          />
          <p className="mt-1 text-xs text-stone-400">
            Lower numbers show first when several banners are active.
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => updateField("is_active", e.target.checked)}
            className="h-4 w-4 rounded border-stone-300 text-rose-600 focus:ring-rose-400"
          />
          Active (shown on homepage)
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : isEditing ? "Save Changes" : "Create Banner"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/hero-slides")}
            className="rounded-lg border border-stone-200 px-5 py-2.5 text-sm font-medium text-stone-600 transition hover:bg-stone-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

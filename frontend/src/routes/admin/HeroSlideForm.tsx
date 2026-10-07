import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Eye, Trash2 } from "lucide-react";
import {
  adminGetHeroSlide,
  adminListHeroSlides,
  createHeroSlide,
  deleteHeroSlide,
  updateHeroSlide,
} from "../../api/heroSlides";
import ImageUploader from "../../components/admin/ImageUploader";
import { ConfirmSheet } from "../../components/admin/ui/BottomSheet";
import { Button } from "../../components/admin/ui/Button";
import { CharCount, Field, TextArea, TextInput } from "../../components/admin/ui/Field";
import { Card, ErrorState, FormHeader, StickyActions } from "../../components/admin/ui/Layout";
import { useToast } from "../../components/admin/ui/Toast";
import { ToggleRow } from "../../components/admin/ui/Toggle";
import { useAuth } from "../../context/AuthContext";
import type { HeroSlideInput } from "../../types";

const HEADING_MAX = 255;

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
  const toast = useToast();
  const { token } = useAuth();

  const [form, setForm] = useState<HeroSlideInput>(EMPTY_FORM);
  const [loading, setLoading] = useState(isEditing);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    if (isEditing && id) {
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
          if (!cancelled) setLoadError("Couldn't load this banner.");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    } else {
      // New banners go to the end of the rotation.
      adminListHeroSlides(token)
        .then((slides) => {
          if (cancelled) return;
          const last = Math.max(-1, ...slides.map((s) => s.sort_order));
          setForm((prev) => ({ ...prev, sort_order: last + 1 }));
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [id, isEditing, token]);

  function updateField<K extends keyof HeroSlideInput>(key: K, value: HeroSlideInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (!form.image_url) {
      setImageError("Add a banner photo.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      heading: form.heading?.trim() || null,
      subheading: form.subheading?.trim() || null,
    };
    try {
      if (isEditing && id) {
        await updateHeroSlide(Number(id), payload, token);
      } else {
        await createHeroSlide(payload, token);
      }
      toast(isEditing ? "Banner saved" : "Banner added");
      navigate("/admin/hero-slides");
    } catch {
      toast("Couldn't save the banner. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!token || !id) return;
    setDeleting(true);
    try {
      await deleteHeroSlide(Number(id), token);
      toast("Banner deleted");
      navigate("/admin/hero-slides");
    } catch {
      toast("Couldn't delete the banner. Please try again.", "error");
      setDeleting(false);
    }
  }

  const title = isEditing ? "Edit Banner" : "Add Banner";

  if (loading || loadError) {
    return (
      <div>
        <FormHeader title={title} backTo="/admin/hero-slides" backLabel="Banners" />
        {loadError ? (
          <ErrorState message={loadError} />
        ) : (
          <div className="aspect-video animate-pulse rounded-3xl bg-white ring-1 ring-stone-100" />
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormHeader title={title} backTo="/admin/hero-slides" backLabel="Banners" />

      <div className="grid items-start gap-5 lg:grid-cols-2 lg:gap-6">
        <div className="flex flex-col gap-5 lg:gap-6">
          <Card title="Banner photo">
            <ImageUploader
              aspect="wide"
              imageUrl={form.image_url}
              emptyLabel="Tap to add a landscape photo"
              emptyHint="Wide photos look best"
              error={imageError}
              onUploaded={(url, publicId) => {
                setImageError(null);
                updateField("image_url", url);
                updateField("image_public_id", publicId);
              }}
            />
          </Card>

          <Card
            title="Preview"
            aside={
              <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-rose-700">
                <Eye className="h-4 w-4" aria-hidden="true" />
                Homepage
              </span>
            }
          >
            <BannerPreview
              imageUrl={form.image_url}
              heading={form.heading ?? ""}
              subheading={form.subheading ?? ""}
            />
          </Card>
        </div>

        <div className="flex flex-col gap-5 lg:gap-6">
          <Card title="Text">
            <div className="flex flex-col gap-5">
              <Field
                label="Heading"
                htmlFor="banner-heading"
                aside={<CharCount value={form.heading ?? ""} max={HEADING_MAX} />}
              >
                <TextInput
                  id="banner-heading"
                  value={form.heading ?? ""}
                  maxLength={HEADING_MAX}
                  placeholder="Fresh Flowers & Gifts, Delivered with Love"
                  onChange={(e) => updateField("heading", e.target.value)}
                />
              </Field>
              <Field label="Subtext" htmlFor="banner-subtext" aside="Optional">
                <TextArea
                  id="banner-subtext"
                  rows={3}
                  value={form.subheading ?? ""}
                  placeholder="Handpicked bouquets, plants & gift baskets for every occasion"
                  onChange={(e) => updateField("subheading", e.target.value)}
                />
              </Field>
            </div>
          </Card>

          <Card title="Display">
            <ToggleRow
              title="Show on homepage"
              description="Live banners rotate at the top of the homepage."
              label="Show on homepage"
              checked={form.is_active}
              onChange={(v) => updateField("is_active", v)}
            />
            <p className="mt-2 border-t border-stone-100 pt-3 text-sm text-stone-500">
              To change where this banner appears in the rotation, use the arrows on the Banners list.
            </p>
          </Card>

          {isEditing && (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex h-12 items-center justify-center gap-2 rounded-2xl text-[15px] font-semibold text-red-600 transition hover:bg-red-50"
            >
              <Trash2 className="h-5 w-5" aria-hidden="true" />
              Delete this banner
            </button>
          )}
        </div>
      </div>

      <StickyActions>
        <Button
          variant="secondary"
          size="lg"
          className="w-28"
          onClick={() => navigate("/admin/hero-slides")}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button type="submit" size="lg" loading={saving} className="flex-1 lg:w-56 lg:flex-none">
          {saving ? "Saving…" : "Save Banner"}
        </Button>
      </StickyActions>

      <ConfirmSheet
        open={confirmDelete}
        title="Delete this banner?"
        message="This can't be undone. The banner is removed from the homepage for good."
        confirmLabel="Delete banner"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
        busy={deleting}
      />
    </form>
  );
}

/** Mirrors how the storefront's HeroSlideshow lays out a slide. */
function BannerPreview({
  imageUrl,
  heading,
  subheading,
}: {
  imageUrl: string | null;
  heading: string;
  subheading: string;
}) {
  return (
    <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-stone-200">
      {imageUrl && <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
      <div className="absolute inset-0 flex flex-col items-start justify-center gap-2 px-5">
        <p className="font-serif text-xl font-bold leading-tight text-white drop-shadow">
          {heading || "Your heading appears here"}
        </p>
        {subheading && <p className="line-clamp-2 text-sm text-white/90 drop-shadow">{subheading}</p>}
      </div>
    </div>
  );
}

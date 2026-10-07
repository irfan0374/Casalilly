import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Star, Trash2 } from "lucide-react";
import {
  adminGetProduct,
  createProduct,
  deleteProduct,
  getCategories,
  updateProduct,
} from "../../api/products";
import ImageUploader from "../../components/admin/ImageUploader";
import MultiImageUploader from "../../components/admin/MultiImageUploader";
import { ProductPreview } from "../../components/admin/ProductTable";
import VideoUploader from "../../components/admin/VideoUploader";
import { ConfirmSheet } from "../../components/admin/ui/BottomSheet";
import { Button } from "../../components/admin/ui/Button";
import { Chip } from "../../components/admin/ui/Chip";
import { CharCount, Field, TextArea, TextInput } from "../../components/admin/ui/Field";
import { Card, ErrorState, FormHeader, StickyActions } from "../../components/admin/ui/Layout";
import { useToast } from "../../components/admin/ui/Toast";
import { ToggleRow } from "../../components/admin/ui/Toggle";
import { useAuth } from "../../context/AuthContext";
import { formatCategory } from "../../lib/categories";
import { markVideoJobSubmitted } from "../../lib/videoUploadManager";
import type { ProductInput } from "../../types";

const NAME_MAX = 255;

const EMPTY_FORM: ProductInput = {
  name: "",
  description: "",
  price: 0,
  categories: [],
  image_url: null,
  image_public_id: null,
  extra_image_urls: [],
  extra_image_public_ids: [],
  video_url: null,
  video_public_id: null,
  is_active: true,
  is_featured: false,
};

type Errors = Partial<Record<"image" | "name" | "description" | "price" | "categories", string>>;

function validate(form: ProductInput, priceText: string): Errors {
  const errors: Errors = {};
  if (!form.image_url) errors.image = "Add a cover photo.";
  if (!form.name.trim()) errors.name = "Enter a product name.";
  if (!form.description.trim()) errors.description = "Add a short description.";
  const price = Number(priceText);
  if (!priceText.trim() || !Number.isFinite(price) || price <= 0) errors.price = "Enter a price above 0.";
  if (form.categories.length === 0) errors.categories = "Pick at least one category.";
  return errors;
}

export default function AdminProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const { token } = useAuth();

  const [form, setForm] = useState<ProductInput>(EMPTY_FORM);
  // Kept as typed text so "12." or an empty field don't snap to 0 mid-typing.
  const [priceText, setPriceText] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // Not state — this only needs to be read once, inside handleSubmit, and
  // shouldn't trigger a re-render when it changes.
  const activeVideoJobTokenRef = useRef<string | null>(null);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!isEditing || !id || !token) return;
    let cancelled = false;
    adminGetProduct(id, token)
      .then((product) => {
        if (cancelled) return;
        const extraUrls = product.extra_image_urls ?? [];
        const extraIds = product.extra_image_public_ids ?? [];
        setForm({
          name: product.name,
          description: product.description ?? "",
          price: Number(product.price),
          categories: product.categories?.length ? product.categories : [product.category],
          image_url: product.image_url,
          image_public_id: product.image_public_id,
          extra_image_urls: extraUrls,
          extra_image_public_ids: extraUrls.map((_, i) => extraIds[i] ?? ""),
          video_url: product.video_url,
          video_public_id: product.video_public_id,
          is_active: product.is_active,
          is_featured: product.is_featured,
        });
        setPriceText(String(Number(product.price)));
      })
      .catch(() => {
        if (!cancelled) setLoadError("Couldn't load this product.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, isEditing, token]);

  function updateField<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function clearError(key: keyof Errors) {
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  function toggleCategory(category: string) {
    clearError("categories");
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    const found = validate(form, priceText);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      // Bring the first problem into view — on a phone it's usually off-screen.
      requestAnimationFrame(() =>
        document.querySelector('[aria-invalid="true"], [role="alert"]')?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        })
      );
      return;
    }

    setSaving(true);
    const payload: ProductInput = {
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(priceText),
    };
    try {
      let savedId: string | number;
      if (isEditing && id) {
        await updateProduct(id, payload, token);
        savedId = id;
      } else {
        const created = await createProduct(payload, token);
        savedId = created.id;
      }
      // If a video is still compressing/uploading in the background, hand
      // it the id it should attach itself to once it's ready — we're not
      // waiting for it before navigating away.
      if (activeVideoJobTokenRef.current) {
        markVideoJobSubmitted(activeVideoJobTokenRef.current, savedId);
      }
      toast(isEditing ? "Changes saved" : "Product added");
      navigate("/admin/products");
    } catch {
      toast("Couldn't save the product. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!token || !id) return;
    setDeleting(true);
    try {
      await deleteProduct(id, token);
      toast("Product deleted");
      navigate("/admin/products");
    } catch {
      toast("Couldn't delete the product. Please try again.", "error");
      setDeleting(false);
    }
  }

  const title = isEditing ? "Edit Product" : "Add Product";

  if (loading || loadError) {
    return (
      <div>
        <FormHeader title={title} backTo="/admin/products" backLabel="Products" />
        {loadError ? (
          <ErrorState message={loadError} />
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="aspect-[4/5] animate-pulse rounded-3xl bg-white ring-1 ring-stone-100" />
            <div className="h-96 animate-pulse rounded-3xl bg-white ring-1 ring-stone-100" />
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormHeader title={title} backTo="/admin/products" backLabel="Products" />

      <div className="grid items-start gap-5 lg:grid-cols-2 lg:gap-6">
        <div className="flex flex-col gap-5 lg:gap-6">
          <Card title="Photos & Video">
            <div className="flex flex-col gap-5">
              <Field label="Cover photo" required hint="Shown first in the shop. Portrait photos look best.">
                <ImageUploader
                  imageUrl={form.image_url}
                  emptyLabel="Tap to add cover photo"
                  emptyHint="From your camera or gallery"
                  error={errors.image}
                  onUploaded={(url, publicId) => {
                    clearError("image");
                    updateField("image_url", url);
                    updateField("image_public_id", publicId);
                  }}
                />
              </Field>

              <Field label="More photos" aside={`${form.extra_image_urls.length} / 3`}>
                <MultiImageUploader
                  images={form.extra_image_urls.map((url, i) => ({
                    url,
                    publicId: form.extra_image_public_ids[i] ?? "",
                  }))}
                  onChange={(images) => {
                    updateField("extra_image_urls", images.map((img) => img.url));
                    updateField("extra_image_public_ids", images.map((img) => img.publicId));
                  }}
                />
              </Field>

              <Field label="Video">
                <VideoUploader
                  productId={isEditing && id ? id : null}
                  videoUrl={form.video_url}
                  onUploaded={(url, publicId) => {
                    updateField("video_url", url);
                    updateField("video_public_id", publicId);
                  }}
                  onRemove={() => {
                    updateField("video_url", null);
                    updateField("video_public_id", null);
                  }}
                  onJobTokenChange={(t) => {
                    activeVideoJobTokenRef.current = t;
                  }}
                />
              </Field>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-5 lg:gap-6">
          <Card title="Details">
            <div className="flex flex-col gap-5">
              <Field
                label="Product name"
                htmlFor="product-name"
                required
                aside={<CharCount value={form.name} max={NAME_MAX} />}
                error={errors.name}
              >
                <TextInput
                  id="product-name"
                  value={form.name}
                  maxLength={NAME_MAX}
                  placeholder="e.g. Blushing Peony Hatbox"
                  error={errors.name}
                  onChange={(e) => {
                    clearError("name");
                    updateField("name", e.target.value);
                  }}
                />
              </Field>

              <Field label="Description" htmlFor="product-description" required error={errors.description}>
                <TextArea
                  id="product-description"
                  rows={5}
                  value={form.description}
                  placeholder="What's in it, colours, size, care tips…"
                  error={errors.description}
                  onChange={(e) => {
                    clearError("description");
                    updateField("description", e.target.value);
                  }}
                />
              </Field>

              <Field label="Price" htmlFor="product-price" required error={errors.price}>
                <TextInput
                  id="product-price"
                  type="text"
                  inputMode="decimal"
                  value={priceText}
                  placeholder="0.00"
                  error={errors.price}
                  leading={<span className="text-sm font-semibold text-stone-500">AED</span>}
                  onChange={(e) => {
                    clearError("price");
                    setPriceText(e.target.value.replace(/[^\d.]/g, ""));
                  }}
                />
              </Field>

              <Field
                label="Categories"
                required
                aside="Select all that apply"
                hint={
                  form.categories.length > 1
                    ? `“${formatCategory(form.categories[0])}” is the main label shown on the product.`
                    : undefined
                }
                error={errors.categories}
              >
                <div className="flex flex-wrap gap-2" role="group" aria-label="Categories">
                  {categories.map((category) => (
                    <Chip
                      key={category}
                      checkable
                      selected={form.categories.includes(category)}
                      onClick={() => toggleCategory(category)}
                    >
                      {formatCategory(category)}
                    </Chip>
                  ))}
                </div>
              </Field>
            </div>
          </Card>

          <Card title="Visibility">
            <div className="divide-y divide-stone-100">
              <ToggleRow
                title="Show in shop"
                description="Customers can see and order this product."
                label="Show in shop"
                checked={form.is_active}
                onChange={(v) => updateField("is_active", v)}
              />
              <ToggleRow
                title="Best Seller"
                description="Feature it in Best Sellers on the homepage."
                icon={<Star className="h-4 w-4 text-amber-500" fill="currentColor" aria-hidden="true" />}
                label="Best Seller"
                tone="amber"
                checked={form.is_featured}
                onChange={(v) => updateField("is_featured", v)}
              />
            </div>
          </Card>

          {isEditing && (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex h-12 items-center justify-center gap-2 rounded-2xl text-[15px] font-semibold text-red-600 transition hover:bg-red-50"
            >
              <Trash2 className="h-5 w-5" aria-hidden="true" />
              Delete this product
            </button>
          )}
        </div>
      </div>

      <StickyActions>
        <Button
          variant="secondary"
          size="lg"
          className="w-28"
          onClick={() => navigate("/admin/products")}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button type="submit" size="lg" loading={saving} className="flex-1 lg:w-56 lg:flex-none">
          {saving ? "Saving…" : isEditing ? "Save Changes" : "Save Product"}
        </Button>
      </StickyActions>

      <ConfirmSheet
        open={confirmDelete}
        title={`Delete “${form.name}”?`}
        message="This can't be undone. The product, its photos and video are removed from the shop for good."
        confirmLabel="Delete product"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
        busy={deleting}
        preview={
          <ProductPreview
            product={{
              name: form.name,
              price: String(form.price),
              image_url: form.image_url,
              category: form.categories[0] ?? "",
            }}
          />
        }
      />
    </form>
  );
}

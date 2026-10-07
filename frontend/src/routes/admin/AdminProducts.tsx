import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Flower2, Pencil, Plus, Search, Star, Trash2, X } from "lucide-react";
import { deleteProduct, getCategories, updateProduct } from "../../api/products";
import { ProductCard, ProductPreview, ProductTable } from "../../components/admin/ProductTable";
import { ActionList, BottomSheet, ConfirmSheet } from "../../components/admin/ui/BottomSheet";
import { LinkButton } from "../../components/admin/ui/Button";
import { Chip, Pill } from "../../components/admin/ui/Chip";
import { EmptyState, ErrorState, Fab, PageHeader } from "../../components/admin/ui/Layout";
import { useToast } from "../../components/admin/ui/Toast";
import { useAuth } from "../../context/AuthContext";
import { formatCategory } from "../../lib/categories";
import { useAdminProducts } from "../../lib/useAdminProducts";
import type { Product } from "../../types";

type StatusFilter = "all" | "active" | "hidden" | "featured";

const STATUS_FILTERS: { value: StatusFilter; label: string; match: (p: Product) => boolean }[] = [
  { value: "all", label: "All", match: () => true },
  { value: "active", label: "Active", match: (p) => p.is_active },
  { value: "hidden", label: "Hidden", match: (p) => !p.is_active },
  { value: "featured", label: "Best Sellers", match: (p) => p.is_featured },
];

// The whole catalog is already in memory; this only limits how many rows
// are rendered at once, growing as the list is scrolled.
const RENDER_STEP = 20;

function inCategory(product: Product, category: string): boolean {
  return (product.categories?.length ? product.categories : [product.category]).includes(category);
}

export default function AdminProducts() {
  const { token } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { products, setProducts, loading, error, reload } = useAdminProducts();
  const [categories, setCategories] = useState<string[]>([]);
  // Filters live in the URL so dashboard stat cards can deep-link here
  // (e.g. ?status=hidden) and the back button keeps them.
  const [params, setParams] = useSearchParams();
  const search = params.get("q") ?? "";
  const category = params.get("category") ?? "";
  const status = (params.get("status") as StatusFilter | null) ?? "all";

  const [busyId, setBusyId] = useState<Product["id"] | null>(null);
  const [menuFor, setMenuFor] = useState<Product | null>(null);
  const [deleteFor, setDeleteFor] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [renderCount, setRenderCount] = useState(RENDER_STEP);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value && value !== "all") next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
    setRenderCount(RENDER_STEP);
  }

  const searched = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products;
  }, [products, search]);

  // Counts shown on each chip reflect the other active filters, so the
  // numbers always add up to what tapping the chip would show.
  const statusMatch = STATUS_FILTERS.find((f) => f.value === status)?.match ?? (() => true);
  const filtered = searched.filter(
    (p) => (!category || inCategory(p, category)) && statusMatch(p)
  );
  const visible = filtered.slice(0, renderCount);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || renderCount >= filtered.length) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setRenderCount((n) => n + RENDER_STEP);
      },
      { rootMargin: "600px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [renderCount, filtered.length]);

  async function patch(
    product: Product,
    changes: Partial<Pick<Product, "is_active" | "is_featured">>,
    success: string
  ) {
    if (!token) return;
    setBusyId(product.id);
    // Optimistic — flip it in the list right away, roll back if it fails.
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, ...changes } : p)));
    try {
      const updated = await updateProduct(product.id, changes, token);
      setProducts((prev) => prev.map((p) => (p.id === product.id ? updated : p)));
      toast(success);
    } catch {
      setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
      toast("Couldn't update the product. Please try again.", "error");
    } finally {
      setBusyId(null);
    }
  }

  function toggleActive(product: Product) {
    patch(
      product,
      { is_active: !product.is_active },
      product.is_active ? "Hidden from shop" : "Now visible in shop"
    );
  }

  function toggleFeatured(product: Product) {
    patch(
      product,
      { is_featured: !product.is_featured },
      product.is_featured ? "Removed from Best Sellers" : "Marked as Best Seller"
    );
  }

  async function confirmDelete() {
    if (!token || !deleteFor) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteFor.id, token);
      setProducts((prev) => prev.filter((p) => p.id !== deleteFor.id));
      toast("Product deleted");
      setDeleteFor(null);
    } catch {
      toast("Couldn't delete the product. Please try again.", "error");
    } finally {
      setDeleting(false);
    }
  }

  const rowActions = {
    onToggleActive: toggleActive,
    onToggleFeatured: toggleFeatured,
    onMore: setMenuFor,
    onDelete: setDeleteFor,
    busyId,
  };

  return (
    <div>
      <PageHeader
        title="Products"
        badge={!loading && <Pill tone="stone">{products.length} items</Pill>}
        action={
          // Desktop only — phones get the floating + button instead.
          <div className="hidden lg:block">
            <LinkButton
              to="/admin/products/new"
              icon={<Plus className="h-4 w-4" aria-hidden="true" />}
            >
              Add Product
            </LinkButton>
          </div>
        }
      />

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400"
          aria-hidden="true"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setParam("q", e.target.value)}
          placeholder="Search products…"
          aria-label="Search products"
          className="h-12 w-full rounded-2xl border border-stone-200 bg-white pl-12 pr-12 text-[15px] placeholder:text-stone-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 [&::-webkit-search-cancel-button]:hidden"
        />
        {search && (
          <button
            type="button"
            onClick={() => setParam("q", "")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="scrollbar-none -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:px-0">
        <Chip selected={!category} onClick={() => setParam("category", "")}>
          All
        </Chip>
        {categories.map((c) => (
          <Chip key={c} selected={category === c} onClick={() => setParam("category", c)}>
            {formatCategory(c)}
            <span className={category === c ? "text-white/70" : "text-stone-400"}>
              {searched.filter((p) => inCategory(p, c)).length}
            </span>
          </Chip>
        ))}
      </div>
      <div className="scrollbar-none -mx-4 mt-2 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
        {STATUS_FILTERS.map((f) => (
          <Chip key={f.value} size="sm" selected={status === f.value} onClick={() => setParam("status", f.value)}>
            {f.label}
            {f.value !== "all" && ` (${searched.filter((p) => (!category || inCategory(p, category)) && f.match(p)).length})`}
          </Chip>
        ))}
      </div>

      <div className="mt-5">
        {loading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-26 animate-pulse rounded-3xl bg-white ring-1 ring-stone-100" />
            ))}
          </div>
        )}

        {!loading && error && <ErrorState message={error} onRetry={reload} />}

        {!loading && !error && products.length === 0 && (
          <EmptyState
            icon={<Flower2 className="h-7 w-7" aria-hidden="true" />}
            title="No products yet"
            description="Add your first bouquet, plant or gift — it appears in the shop as soon as you save."
            action={
              <LinkButton to="/admin/products/new" icon={<Plus className="h-4 w-4" aria-hidden="true" />}>
                Add your first product
              </LinkButton>
            }
          />
        )}

        {!loading && !error && products.length > 0 && filtered.length === 0 && (
          <EmptyState
            icon={<Search className="h-7 w-7" aria-hidden="true" />}
            title="Nothing matches"
            description="Try a different search, or clear the filters."
            action={
              <button
                type="button"
                onClick={() => setParams({}, { replace: true })}
                className="text-sm font-semibold text-rose-700 underline"
              >
                Clear filters
              </button>
            }
          />
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            <div className="flex flex-col gap-3 lg:hidden">
              {visible.map((product) => (
                <ProductCard key={product.id} product={product} {...rowActions} />
              ))}
            </div>
            <div className="hidden lg:block">
              <ProductTable products={visible} {...rowActions} />
            </div>
            <div ref={sentinelRef} aria-hidden="true" />
            <p className="mt-4 text-center text-xs text-stone-400">
              Showing {visible.length} of {filtered.length}
            </p>
          </>
        )}
      </div>

      <Fab to="/admin/products/new" label="Add product" />

      <BottomSheet open={menuFor !== null} onClose={() => setMenuFor(null)} title={menuFor?.name}>
        {menuFor && (
          <ActionList
            actions={[
              {
                label: "Edit",
                icon: <Pencil className="h-5 w-5" aria-hidden="true" />,
                onClick: () => navigate(`/admin/products/${menuFor.id}/edit`),
              },
              {
                label: menuFor.is_featured ? "Remove from Best Sellers" : "Mark as Best Seller",
                icon: <Star className="h-5 w-5" aria-hidden="true" />,
                onClick: () => {
                  toggleFeatured(menuFor);
                  setMenuFor(null);
                },
              },
              {
                label: menuFor.is_active ? "Hide from shop" : "Show in shop",
                icon: menuFor.is_active ? (
                  <EyeOff className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Eye className="h-5 w-5" aria-hidden="true" />
                ),
                onClick: () => {
                  toggleActive(menuFor);
                  setMenuFor(null);
                },
              },
              {
                label: "Delete",
                icon: <Trash2 className="h-5 w-5" aria-hidden="true" />,
                danger: true,
                onClick: () => {
                  setDeleteFor(menuFor);
                  setMenuFor(null);
                },
              },
            ]}
          />
        )}
      </BottomSheet>

      <ConfirmSheet
        open={deleteFor !== null}
        title={`Delete “${deleteFor?.name ?? ""}”?`}
        message="This can't be undone. The product, its photos and video are removed from the shop for good."
        confirmLabel="Delete product"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteFor(null)}
        busy={deleting}
        preview={deleteFor && <ProductPreview product={deleteFor} />}
      />
    </div>
  );
}

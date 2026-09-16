import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../api/products";
import OurProductsGrid, { GRID_CLASS } from "./OurProductsGrid";
import ProductCardSkeleton from "./ProductCardSkeleton";
import { formatCategory } from "../lib/categories";
import type { Product } from "../types";

// Only these categories get a tab here, in this fixed order — the rest of
// the catalog (bouquets, gift baskets, anniversary, other…) stays out of
// this homepage section and is only reachable via the full Shop page.
const VISIBLE_CATEGORIES = ["flowers", "plants", "chocolate"];

// Capped so the homepage preview stays a taste of the category, not the
// whole catalog — "View All" leads to the full, uncapped list on Shop.
const PREVIEW_COUNT = 10;

// Label override just for this tab row — "plants" reads as "Indoor Plants"
// here without changing the shared label used on the Shop/Categories pages.
const TAB_LABELS: Record<string, string> = { plants: "Indoor Plants" };

export default function OurProductsSection({
  categories,
}: {
  categories: string[];
}) {
  const orderedCategories = useMemo(
    () => VISIBLE_CATEGORIES.filter((c) => categories.includes(c)),
    [categories]
  );

  const [active, setActive] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Default to the first tab once categories arrive, without clobbering a
  // choice the visitor already made.
  useEffect(() => {
    if (active === null && orderedCategories.length > 0) {
      setActive(orderedCategories[0]);
    }
  }, [orderedCategories, active]);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    setLoading(true);
    getProducts(active)
      .then((data) => {
        if (!cancelled) setProducts(data.slice(0, PREVIEW_COUNT));
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [active]);

  if (orderedCategories.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 pt-6  pb-8 ">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-bold text-stone-800 sm:text-3xl">
          Our Products
        </h2>
        <Link
          to={`/shop?category=${active ?? ""}`}
          className="text-sm font-semibold text-rose-600 hover:underline"
        >
          View All →
        </Link>
      </div>

      <div className="scrollbar-none mt-6 flex justify-start gap-6 overflow-x-auto pb-1 sm:mt-8 sm:justify-start sm:overflow-visible sm:pb-0">
        {orderedCategories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActive(category)}
            className={`flex-shrink-0 whitespace-nowrap border-b-2 pb-2 text-xs font-semibold uppercase tracking-wide transition sm:text-sm ${
              active === category
                ? "border-rose-600 text-stone-800"
                : "border-transparent text-stone-400 hover:text-stone-600"
            }`}
          >
            {TAB_LABELS[category] ?? formatCategory(category)}
          </button>
        ))}
      </div>

      {loading && (
        <div className={`mt-8 grid ${GRID_CLASS}`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && products.length === 0 && (
        <p className="mt-8 py-8 text-center text-stone-400">
          No products in this category yet.
        </p>
      )}

      {!loading && products.length > 0 && (
        <div className="mt-8">
          <OurProductsGrid products={products} />
        </div>
      )}
    </section>
  );
}

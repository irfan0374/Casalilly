import { useEffect, useMemo, useState } from "react";
import { getProducts } from "../api/products";
import BestSellerCarousel from "./BestSellerCarousel";
import ProductCardSkeleton from "./ProductCardSkeleton";
import { formatCategory } from "../lib/categories";
import type { Product } from "../types";

const BEST_SELLERS_COUNT = 4;

/** Best Sellers, tabbed by category — each tab leads with that category's
 * admin-curated featured products, then tops up with a random pick of other
 * products in the same category so the carousel always has enough to
 * scroll through even when only one or two have been marked featured. */
export default function BestSellersSection({
  categories,
}: {
  categories: string[];
}) {
  const [active, setActive] = useState<string | null>(null);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [all, setAll] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (active === null && categories.length > 0) {
      setActive(categories[0]);
    }
  }, [categories, active]);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([getProducts(active, true), getProducts(active)])
      .then(([featuredData, allData]) => {
        if (!cancelled) {
          setFeatured(featuredData);
          setAll(allData);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFeatured([]);
          setAll([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [active]);

  const products = useMemo(() => {
    if (featured.length >= BEST_SELLERS_COUNT) {
      return featured.slice(0, BEST_SELLERS_COUNT);
    }
    const featuredIds = new Set(featured.map((p) => p.id));
    const fillers = all
      .filter((p) => !featuredIds.has(p.id))
      .sort(() => Math.random() - 0.5);
    return [...featured, ...fillers.slice(0, BEST_SELLERS_COUNT - featured.length)];
  }, [featured, all]);

  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl pt-16 pb-6">
      <div className="mb-6 flex items-center justify-between px-4">
        <h2 className="font-serif text-2xl font-bold text-stone-800 sm:text-3xl">
          Best Sellers
        </h2>
      
      </div>

      <div className="scrollbar-none mb-8 flex justify-start gap-6 overflow-x-auto px-4 pb-1 sm:justify-center sm:overflow-visible">
        {categories.map((category) => (
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
            {formatCategory(category)}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex gap-2 overflow-hidden px-[calc(50%-19vw)] py-6 sm:gap-3 sm:px-[calc(50%-115px)] lg:gap-4 lg:px-[calc(50%-130px)]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-[38vw] flex-shrink-0 sm:w-[230px] lg:w-[260px]">
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      )}

      {!loading && products.length === 0 && (
        <p className="py-12 text-center text-stone-400">
          No products in this category yet.
        </p>
      )}

      {!loading && products.length > 0 && (
        <BestSellerCarousel key={active} products={products} />
      )}
    </section>
  );
}

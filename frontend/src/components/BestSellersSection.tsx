import { useEffect, useMemo, useState } from "react";
import { getProducts } from "../api/products";
import ShopProductCard from "./storefront/ShopProductCard";
import { HomeSection, SectionHeader, ViewAllLink } from "./storefront/HomeSections";
import { CategoryTabs, ProductCardSkeletonRow } from "./storefront/CategoryTabs";
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
    <HomeSection>
      <SectionHeader
        title="Best sellers"
        action={<ViewAllLink to={`/shop?category=${active ?? ""}`} />}
      />
      <CategoryTabs categories={categories} active={active} onSelect={setActive} />

      {loading && <ProductCardSkeletonRow />}

      {!loading && products.length === 0 && (
        <p className="py-12 text-center text-stone-400">No products in this category yet.</p>
      )}

      {!loading && products.length > 0 && (
        // A swipe row: ~2.2 cards in view on phones so it's obvious it
        // scrolls, all four side by side on desktop.
        <div className="scrollbar-none -mx-4 mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0">
          {products.map((product) => (
            <div key={product.id} className="w-[46%] flex-shrink-0 snap-start md:w-auto">
              <ShopProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </HomeSection>
  );
}

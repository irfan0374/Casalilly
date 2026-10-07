import { useEffect, useMemo, useState } from "react";
import { getProducts } from "../api/products";
import ShopProductCard from "./storefront/ShopProductCard";
import { HomeSection, SectionHeader, ViewAllLink } from "./storefront/HomeSections";
import { CategoryTabs, ProductCardSkeletonRow } from "./storefront/CategoryTabs";
import type { Product } from "../types";

// Only these categories get a tab here, in this fixed order — the rest of
// the catalog (bouquets, gift baskets, anniversary, other…) stays out of
// this homepage section and is only reachable via the full Shop page.
const VISIBLE_CATEGORIES = ["flowers", "plants", "chocolate"];

// Capped so the homepage preview stays a taste of the category, not the
// whole catalog — "View all" leads to the full, uncapped list on Shop.
// Phones show the first 6 (3 rows of 2), desktop all 8 (2 rows of 4).
const PREVIEW_COUNT = 8;
const MOBILE_PREVIEW_COUNT = 6;

// Label override just for this tab row — "plants" reads as "Indoor Plants"
// here without changing the shared label used on the Shop/Categories pages.
const TAB_LABELS: Record<string, string> = { plants: "Indoor plants" };

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
    <HomeSection>
      <SectionHeader
        title="Our products"
        action={<ViewAllLink to={`/shop?category=${active ?? ""}`} />}
      />
      <CategoryTabs
        categories={orderedCategories}
        active={active}
        onSelect={setActive}
        labels={TAB_LABELS}
      />

      {loading && <ProductCardSkeletonRow />}

      {!loading && products.length === 0 && (
        <p className="py-12 text-center text-stone-400">No products in this category yet.</p>
      )}

      {!loading && products.length > 0 && (
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {products.map((product, i) => (
            <div key={product.id} className={i >= MOBILE_PREVIEW_COUNT ? "hidden md:block" : ""}>
              <ShopProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </HomeSection>
  );
}

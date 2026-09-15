import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getCategories, getProducts } from "../api/products";
import ProductCard from "../components/ProductCard";
import ProductCardSkeleton from "../components/ProductCardSkeleton";
import CategoryFilter from "../components/CategoryFilter";
import PublicLayout from "../components/PublicLayout";
import type { Product } from "../types";

const SKELETON_COUNT = 8;

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getProducts(selectedCategory ?? undefined)
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .catch(() => {
        if (!cancelled) {
          setError(
            "Couldn't load products right now. Please try again shortly."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedCategory]);

  function handleSelectCategory(category: string | null) {
    setSearchParams(category ? { category } : {});
  }

  return (
    <PublicLayout>
      <section className="bg-gradient-to-b from-rose-50 to-transparent px-4 py-12 text-center sm:py-16">
        <h1 className="font-serif text-4xl font-bold text-stone-800 sm:text-5xl">
          Shop
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-stone-500">
          Fresh flowers, bouquets &amp; gift baskets for every occasion —
          order in a tap over WhatsApp.
        </p>
      </section>

      <main className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-8">
          {categoriesLoading ? (
            <div className="flex flex-wrap gap-2">
              {["w-14", "w-24", "w-20", "w-28", "w-20", "w-16"].map(
                (w, i) => (
                  <div
                    key={i}
                    className={`h-8 ${w} animate-pulse rounded-full bg-rose-100`}
                  />
                )
              )}
            </div>
          ) : (
            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onSelect={handleSelectCategory}
            />
          )}
        </div>

        {loading && (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && error && (
          <p className="py-16 text-center text-red-500">{error}</p>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="py-16 text-center text-stone-400">
            No products found in this category yet.
          </p>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </PublicLayout>
  );
}

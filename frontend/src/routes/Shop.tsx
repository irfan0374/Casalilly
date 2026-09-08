import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getCategories, getProducts } from "../api/products";
import ProductCard from "../components/ProductCard";
import CategoryFilter from "../components/CategoryFilter";
import PublicLayout from "../components/PublicLayout";
import type { Product } from "../types";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
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
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onSelect={handleSelectCategory}
          />
        </div>

        {loading && (
          <p className="py-16 text-center text-stone-400">
            Loading products…
          </p>
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

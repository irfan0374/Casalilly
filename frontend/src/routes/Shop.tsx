import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getCategories, getProducts } from "../api/products";
import ProductCard from "../components/ProductCard";
import ProductCardSkeleton from "../components/ProductCardSkeleton";
import CategoryFilter from "../components/CategoryFilter";
import PublicLayout from "../components/PublicLayout";
import type { Product } from "../types";

const PAGE_SIZE = 12;

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category");
  const searchQuery = searchParams.get("search");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<Product[]>([]);
  // In-flight guard for loadMore — a plain ref so it's checked/set
  // synchronously within the same tick as the intersection callback,
  // immune to React 19 StrictMode's dev-only double effect invocation
  // (which otherwise let two overlapping "load more" fetches both append,
  // duplicating items).
  const fetchingMoreRef = useRef(false);
  // Bumped on every filter change; a page-1 or load-more response is only
  // applied if it's still the current generation, so a slow response for a
  // filter the visitor has since changed away from can't get appended.
  const genRef = useRef(0);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false));
  }, []);

  // Fetch just the first page whenever the category/search filters change —
  // the rest is fetched on demand as the visitor scrolls, instead of
  // loading the entire catalog up front.
  useEffect(() => {
    const gen = ++genRef.current;
    fetchingMoreRef.current = false;
    setLoading(true);
    setError(null);
    setHasMore(true);
    getProducts(
      selectedCategory ?? undefined,
      undefined,
      searchQuery ?? undefined,
      0,
      PAGE_SIZE
    )
      .then((data) => {
        if (genRef.current !== gen) return;
        setProducts(data);
        setHasMore(data.length === PAGE_SIZE);
      })
      .catch(() => {
        if (genRef.current === gen) {
          setError(
            "Couldn't load products right now. Please try again shortly."
          );
        }
      })
      .finally(() => {
        if (genRef.current === gen) setLoading(false);
      });
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  const loadMore = useCallback(() => {
    if (fetchingMoreRef.current) return;
    fetchingMoreRef.current = true;
    const gen = genRef.current;
    setLoadingMore(true);
    getProducts(
      selectedCategory ?? undefined,
      undefined,
      searchQuery ?? undefined,
      productsRef.current.length,
      PAGE_SIZE
    )
      .then((data) => {
        if (genRef.current !== gen) return;
        setProducts((prev) => [...prev, ...data]);
        setHasMore(data.length === PAGE_SIZE);
      })
      .catch(() => {
        if (genRef.current === gen) setHasMore(false);
      })
      .finally(() => {
        fetchingMoreRef.current = false;
        if (genRef.current === gen) setLoadingMore(false);
      });
  }, [selectedCategory, searchQuery]);

  // Reconnects (and so re-checks current intersection) every time the list
  // grows — a plain IntersectionObserver only fires on enter/exit, but a
  // short first page can leave the sentinel sitting continuously inside
  // the rootMargin zone with no further crossing to trigger the next page,
  // stalling the scroll. Re-observing forces a fresh check each time.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || loading) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore) loadMore();
      },
      { rootMargin: "400px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loading, hasMore, loadMore, products.length]);

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
        {searchQuery && (
          <p className="mb-6 text-sm text-stone-500">
            Showing results for <span className="font-semibold text-stone-700">“{searchQuery}”</span>
          </p>
        )}

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
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && error && (
          <p className="py-16 text-center text-red-500">{error}</p>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="py-16 text-center text-stone-400">
            {searchQuery
              ? `No products found for "${searchQuery}".`
              : "No products found in this category yet."}
          </p>
        )}

        {!loading && !error && products.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {loadingMore && (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Fetch trigger for infinite scroll — sits just below the grid,
                observed with a lookahead margin so the next page loads
                before the visitor actually hits the bottom. */}
            <div ref={sentinelRef} className="h-1" aria-hidden="true" />

            {!hasMore && !loadingMore && products.length > PAGE_SIZE && (
              <p className="py-8 text-center text-sm text-stone-400">
                You've reached the end.
              </p>
            )}
          </>
        )}
      </main>
    </PublicLayout>
  );
}

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProduct, getProducts } from "../api/products";
import ProductImage from "../components/ProductImage";
import WhatsAppButton from "../components/WhatsAppButton";
import WishlistButton from "../components/WishlistButton";
import PublicLayout from "../components/PublicLayout";
import OurProductCard from "../components/OurProductCard";
import type { Product } from "../types";
import { formatCategory } from "../lib/categories";
import { productGallery } from "../lib/gallery";

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23fbe7ef'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='20' fill='%23d18ca8' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [related, setRelated] = useState<Product[]>([]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setActiveImage(0);
    getProduct(id)
      .then((data) => {
        if (!cancelled) setProduct(data);
      })
      .catch(() => {
        if (!cancelled) setError("This product couldn't be found.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getProducts()
      .then((all) => {
        if (cancelled) return;
        const others = all.filter((p) => String(p.id) !== String(id));
        setRelated(shuffle(others).slice(0, 4));
      })
      .catch(() => {
        if (!cancelled) {
          setRelated([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <PublicLayout>
        <p className="py-24 text-center text-stone-400">Loading product…</p>
      </PublicLayout>
    );
  }

  if (error || !product) {
    return (
      <PublicLayout>
        <div className="py-24 text-center">
          <p className="mb-4 text-red-500">{error ?? "Product not found."}</p>
          <Link to="/shop" className="text-rose-600 underline">
            Back to shop
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const gallery = productGallery(product);
  const activeUrl = gallery[activeImage] ?? gallery[0];

  return (
    <PublicLayout>
      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-10 lg:max-w-6xl">
        <div className="relative lg:grid lg:grid-cols-2 lg:items-start lg:gap-10">
          <div className="flex flex-col-reverse gap-3 lg:flex-row">
            {gallery.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
                {gallery.map((url, index) => (
                  <button
                    key={url + index}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    aria-label={`Show image ${index + 1}`}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition lg:h-20 lg:w-20 ${
                      index === activeImage
                        ? "border-rose-500"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={url}
                      alt={`${product.name} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="relative aspect-[4/5] w-full flex-1 overflow-hidden rounded-3xl bg-rose-50 sm:aspect-[16/10] lg:aspect-[4/5] lg:sticky lg:top-24">
              <ProductImage
                key={activeUrl}
                src={activeUrl}
                alt={product.name}
                fallback={FALLBACK_IMAGE}
                loading="eager"
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
                <Link
                  to="/shop"
                  aria-label="Back to shop"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-stone-700 backdrop-blur transition hover:bg-white"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </Link>

                <div className="flex items-center gap-2">
                  <WishlistButton
                    product={product}
                    variant="overlay"
                    className="h-10 w-10"
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            className={`relative z-10 rounded-3xl bg-white p-6 shadow-xl shadow-rose-100 sm:mx-6 sm:p-8 lg:mx-0 lg:mt-0 lg:p-0 lg:shadow-none ${
              gallery.length > 1 ? "mt-3" : "-mt-10"
            }`}
          >
            <span className="w-fit rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700">
              {formatCategory(product.category)}
            </span>
            <h1 className="mt-3 font-serif text-2xl font-bold text-stone-800 sm:text-3xl lg:text-4xl">
              {product.name}
            </h1>
            <p className="mt-3 leading-relaxed text-stone-600">
              {product.description}
            </p>

            <div className="mt-6 flex items-center justify-between gap-4 border-t border-rose-100 pt-6 lg:mt-8">
              <span className="text-2xl font-bold text-rose-600">
                AED {product.price}
              </span>
              <WhatsAppButton product={product} />
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-serif text-2xl font-bold text-stone-800">
              You May Also Like
            </h2>
            <div className="mt-6 grid grid-cols-3 gap-x-2 gap-y-6 sm:gap-x-6 sm:gap-y-8 lg:grid-cols-4">
              {related.map((p) => (
                <OurProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>
    </PublicLayout>
  );
}

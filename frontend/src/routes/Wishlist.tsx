import { Link } from "react-router-dom";
import PublicLayout from "../components/PublicLayout";
import { useWishlist } from "../context/WishlistContext";
import { buildBulkWhatsAppLink } from "../lib/whatsapp";
import { formatCategory } from "../lib/categories";

const SHOP_PHONE = import.meta.env.VITE_WHATSAPP_NUMBER || "+10000000000";
const SITE_BASE_URL =
  import.meta.env.VITE_SITE_BASE_URL || "http://localhost:8000";

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23fbe7ef'/%3E%3C/svg%3E";

export default function Wishlist() {
  const { items, remove, setQuantity, clear } = useWishlist();
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <PublicLayout>
      <section className="bg-gradient-to-b from-rose-50 to-transparent px-4 py-12 text-center sm:py-16">
        <h1 className="font-serif text-4xl font-bold text-stone-800 sm:text-5xl">
          Your Wishlist
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-stone-500">
          Saved on this device — tap the heart on any product to add or
          remove it.
        </p>
      </section>

      <main className="mx-auto max-w-2xl px-4 pb-16">
        {items.length === 0 ? (
          <div className="py-16 text-center">
            <p className="mb-4 text-stone-400">Your wishlist is empty.</p>
            <Link to="/shop" className="text-rose-600 underline">
              Browse the shop
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-stone-500">
                {totalQuantity} item{totalQuantity === 1 ? "" : "s"} saved
              </p>
              <div className="flex gap-3">
                <a
                  href={buildBulkWhatsAppLink(items, SHOP_PHONE, SITE_BASE_URL)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1ebe57]"
                >
                  Enquire About All via WhatsApp
                </a>
                <button
                  type="button"
                  onClick={clear}
                  className="rounded-full border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-600 transition hover:bg-stone-50"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 rounded-2xl border border-rose-100 bg-white p-4 shadow-sm"
                >
                  <Link
                    to={`/product/${product.id}`}
                    className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-rose-50"
                  >
                    <img
                      src={product.image_url || FALLBACK_IMAGE}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                      }}
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/product/${product.id}`}
                      className="block truncate font-semibold text-stone-800 hover:text-rose-600"
                    >
                      {product.name}
                    </Link>
                    <p className="truncate text-sm text-stone-400">
                      {formatCategory(product.category)}
                    </p>
                    <p className="mt-1 font-semibold text-rose-600">
                      AED {product.price}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 rounded-full border border-stone-200 px-1 py-1">
                    <button
                      type="button"
                      onClick={() => setQuantity(product.id, quantity - 1)}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                      className="flex h-7 w-7 items-center justify-center rounded-full text-stone-500 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-medium text-stone-800">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(product.id, quantity + 1)}
                      aria-label="Increase quantity"
                      className="flex h-7 w-7 items-center justify-center rounded-full text-stone-500 transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(product.id)}
                    aria-label="Remove from wishlist"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-stone-400 transition hover:bg-red-50 hover:text-red-500"
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
                        d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16ZM10 11v6M14 11v6"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </PublicLayout>
  );
}

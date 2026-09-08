import { useWishlist } from "../context/WishlistContext";
import type { Product } from "../types";

interface WishlistButtonProps {
  product: Product;
  className?: string;
  /** "overlay" is for placement on top of a photo (translucent, blurred backdrop). */
  variant?: "default" | "overlay";
}

export default function WishlistButton({
  product,
  className = "",
  variant = "default",
}: WishlistButtonProps) {
  const { isWishlisted, toggle } = useWishlist();
  const active = isWishlisted(product.id);

  const variantClass =
    variant === "overlay"
      ? active
        ? "border-transparent bg-rose-500 text-white"
        : "border-transparent bg-white/80 text-rose-500 backdrop-blur hover:bg-white"
      : active
        ? "border-rose-500 bg-rose-500 text-white"
        : "border-rose-200 bg-white text-rose-500 hover:bg-rose-50";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(product);
      }}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={active}
      className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${variantClass} ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21s-6.716-4.35-9.428-8.06C.94 10.35 1.2 6.9 3.8 5.2c2.13-1.4 4.66-.86 6.2 1.02L12 8.4l2-2.18c1.54-1.88 4.07-2.42 6.2-1.02 2.6 1.7 2.86 5.15 1.23 7.74C18.716 16.65 12 21 12 21Z"
        />
      </svg>
    </button>
  );
}

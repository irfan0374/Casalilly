import { Link } from "react-router-dom";
import type { Product } from "../types";
import ProductImage from "./ProductImage";
import WhatsAppButton from "./WhatsAppButton";
import WishlistButton from "./WishlistButton";
import { formatCategory } from "../lib/categories";

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23fbe7ef'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='20' fill='%23d18ca8' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to={`/product/${product.id}`}
      className="group flex flex-col overflow-hidden border border-stone-200 bg-white transition-colors duration-300 hover:border-rose-300"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-rose-50">
        <ProductImage
          src={product.image_url}
          alt={product.name}
          fallback={FALLBACK_IMAGE}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <WishlistButton
          product={product}
          className="absolute right-1.5 top-1.5 h-7 w-7 shadow-sm sm:right-2 sm:top-2 sm:h-9 sm:w-9"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 border-t border-stone-100 p-3 sm:gap-1.5 sm:p-5">
        <span className="hidden text-xs font-medium text-rose-600 sm:block">
          {formatCategory(product.category)}
        </span>
        <h3 className="line-clamp-1 text-sm font-semibold text-stone-800 sm:text-lg">
          {product.name}
        </h3>
        <p className="line-clamp-2 hidden flex-1 text-sm text-stone-500 sm:block">
          {product.description}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-1.5 sm:flex-col sm:items-stretch sm:gap-2 sm:pt-3">
          <span className="text-sm font-bold text-stone-900 sm:text-xl">
            AED {product.price}
          </span>
          <WhatsAppButton
            product={product}
            size="sm"
            compact
            className="sm:w-full sm:justify-center"
          />
        </div>
      </div>
    </Link>
  );
}
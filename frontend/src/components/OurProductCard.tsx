
import { Link } from "react-router-dom";
import ProductImage from "./ProductImage";
import type { Product } from "../types";

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f2f0'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='20' fill='%23a8a29e' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";

/** Purpose-built for the "Our Products" catalog grid — flat gray image
 * tile, star row, name, price. Deliberately its own component rather than
 * reusing ProductCard, which has a different (bordered/shadowed, always
 * has a WhatsApp button) look meant for the Shop grid and carousels. */
export default function OurProductCard({ product }: { product: Product }) {
  return (
    <Link
      to={`/product/${product.id}`}
      className="group flex w-full flex-col text-left"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-stone-100">
        <ProductImage
          src={product.image_url}
          alt={product.name}
          fallback={FALLBACK_IMAGE}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col gap-1 pt-2 sm:gap-1.5 sm:pt-3">
        <h3 className="line-clamp-1 text-xs font-medium text-stone-700 sm:text-sm">
          {product.name}
        </h3>
        <span className="text-xs font-semibold text-stone-900 sm:text-sm">
          AED {product.price}
        </span>
      </div>
    </Link>
  );
}

import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import ProductImage from "../ProductImage";
import WhatsAppIcon from "../WhatsAppIcon";
import WishlistButton from "../WishlistButton";
import { SHOP_PHONE, SITE_BASE_URL } from "../../lib/config";
import { formatPrice } from "../../lib/format";
import { buildWhatsAppLink } from "../../lib/whatsapp";
import type { Product } from "../../types";

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500'%3E%3Crect width='400' height='500' fill='%23f5f5f4'/%3E%3C/svg%3E";

/** Minimal storefront product card: portrait photo with a wishlist heart,
 * name, price, and a one-tap "order on WhatsApp" button. */
export default function ShopProductCard({ product }: { product: Product }) {
  const whatsappHref = buildWhatsAppLink(product, SHOP_PHONE, SITE_BASE_URL);

  return (
    <Link
      to={`/product/${product.id}`}
      className="group flex h-full flex-col rounded-3xl bg-white p-2.5 ring-1 ring-stone-100 transition hover:ring-rose-200 hover:shadow-sm"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-stone-100">
        <ProductImage
          src={product.image_url}
          alt={product.name}
          fallback={FALLBACK_IMAGE}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <WishlistButton
          product={product}
          variant="overlay"
          className="absolute right-2 top-2 h-9 w-9 shadow-sm"
        />
        {product.video_url && (
          <span className="absolute bottom-2 left-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur">
            <Play className="h-3.5 w-3.5" fill="currentColor" aria-label="Has video" />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-1.5 pb-1 pt-3">
        <h3 className="line-clamp-1 text-sm font-medium text-stone-900 md:text-[15px]">{product.name}</h3>
        <p className="mt-1 line-clamp-1 text-xs text-stone-500 md:text-sm">{product.description}</p>
        <div className="mt-auto flex items-center justify-between gap-1.5 pt-2">
          <span className="whitespace-nowrap text-sm font-semibold text-stone-900 md:text-[15px]">{formatPrice(product.price)}</span>
          {/* A button, not a nested <a> — this whole card is already a link. */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open(whatsappHref, "_blank", "noopener,noreferrer");
            }}
            aria-label={`Order ${product.name} on WhatsApp`}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#25D366] md:h-9 md:w-9 text-white transition hover:bg-[#1ebe57] active:scale-95"
          >
            <WhatsAppIcon className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </Link>
  );
}

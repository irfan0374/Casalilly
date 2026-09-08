import type { Product } from "../types";

/**
 * Builds a wa.me deep link pre-filled with an enquiry message for a product.
 *
 * The link embeds `${siteBaseUrl}/product/{id}` — that URL is the backend's
 * crawler-facing route (see API contract), which WhatsApp's link-preview bot
 * fetches server-side to generate the rich preview. It is intentionally NOT
 * the Vite dev server origin.
 */
export function buildWhatsAppLink(
  product: Pick<Product, "id" | "name" | "price">,
  shopPhone: string,
  siteBaseUrl: string
): string {
  const phone = shopPhone.replace(/[^\d]/g, "");
  const productUrl = `${siteBaseUrl.replace(/\/$/, "")}/product/${product.id}`;
  const message = `Hi! I'm interested in "${product.name}" (AED ${product.price}).\n${productUrl}`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/** Builds a general (non-product) wa.me enquiry link, e.g. for a "Contact Us" nav button. */
export function buildGeneralWhatsAppLink(shopPhone: string): string {
  const phone = shopPhone.replace(/[^\d]/g, "");
  const message = "Hi! I'd love to know more about your flowers & gifts.";
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/** Builds a wa.me link listing several products (with quantities) at once, e.g. for a wishlist "enquire about all" action. */
export function buildBulkWhatsAppLink(
  items: {
    product: Pick<Product, "id" | "name" | "price">;
    quantity: number;
  }[],
  shopPhone: string,
  siteBaseUrl: string
): string {
  const phone = shopPhone.replace(/[^\d]/g, "");
  const base = siteBaseUrl.replace(/\/$/, "");
  const lines = items.map(
    ({ product, quantity }) =>
      `- ${quantity}x ${product.name} (AED ${product.price} each) — ${base}/product/${product.id}`
  );
  const message = `Hi! I'm interested in these items from my wishlist:\n${lines.join(
    "\n"
  )}`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

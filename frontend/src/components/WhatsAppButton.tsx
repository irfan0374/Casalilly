import { buildWhatsAppLink } from "../lib/whatsapp";
import type { Product } from "../types";

const SHOP_PHONE = import.meta.env.VITE_WHATSAPP_NUMBER || "+10000000000";
const SITE_BASE_URL =
  import.meta.env.VITE_SITE_BASE_URL || "http://localhost:8000";

interface WhatsAppButtonProps {
  product: Pick<Product, "id" | "name" | "price">;
  className?: string;
  size?: "sm" | "md";
  /** Icon-only below the sm breakpoint, full label from sm up — for cards
   * that need to stay usable at very narrow (2-up mobile grid) widths. */
  compact?: boolean;
}

export default function WhatsAppButton({
  product,
  className = "",
  size = "md",
  compact = false,
}: WhatsAppButtonProps) {
  const href = buildWhatsAppLink(product, SHOP_PHONE, SITE_BASE_URL);
  const sizeClasses =
    size === "sm"
      ? compact
        ? "p-1.5 sm:px-3 sm:py-1.5 text-sm"
        : "px-3 py-1.5 text-sm"
      : "px-5 py-2.5 text-base";

  return (
    // A <button> rather than an <a> — this renders inside ProductCard's
    // outer Link, and nesting an anchor inside an anchor is invalid HTML
    // (and breaks click targeting in some browsers).
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        window.open(href, "_blank", "noopener,noreferrer");
      }}
      aria-label={compact ? "Order via WhatsApp" : undefined}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#25D366] font-semibold text-white shadow-sm transition hover:bg-[#1ebe57] active:scale-95 ${sizeClasses} ${className}`}
    >
      <svg
        viewBox="0 0 32 32"
        fill="currentColor"
        className={size === "sm" ? "h-4 w-4" : "h-5 w-5"}
        aria-hidden="true"
      >
        <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.386.697 4.61 1.898 6.484L4 29l7.694-1.86A11.94 11.94 0 0 0 16.001 27C22.63 27 28 21.627 28 15S22.63 3 16.001 3Zm0 21.75a9.7 9.7 0 0 1-4.95-1.36l-.355-.21-4.566 1.104 1.127-4.45-.232-.367A9.72 9.72 0 0 1 5.75 15c0-5.66 4.59-10.25 10.251-10.25S26.25 9.34 26.25 15 20.912 24.75 16.001 24.75Zm5.593-7.593c-.306-.153-1.81-.893-2.09-.995-.28-.102-.483-.153-.687.153-.204.306-.79.995-.968 1.199-.178.204-.357.23-.663.077-.306-.153-1.292-.476-2.462-1.518-.91-.812-1.525-1.814-1.704-2.12-.178-.306-.019-.472.134-.624.138-.137.306-.357.459-.535.153-.178.204-.306.306-.51.102-.204.051-.383-.026-.536-.076-.153-.687-1.656-.941-2.268-.248-.596-.5-.515-.687-.524l-.586-.01c-.204 0-.535.077-.815.383-.28.306-1.069 1.044-1.069 2.547 0 1.503 1.094 2.955 1.247 3.159.153.204 2.153 3.288 5.218 4.61.729.315 1.298.503 1.741.644.731.233 1.396.2 1.922.121.586-.088 1.81-.74 2.065-1.454.255-.714.255-1.326.179-1.454-.077-.128-.281-.204-.587-.357Z" />
      </svg>
      {compact ? (
        <span className="hidden sm:inline">Order via WhatsApp</span>
      ) : (
        "Order via WhatsApp"
      )}
    </button>
  );
}

import { Gift, Leaf, MessageCircle } from "lucide-react";
import { buildGeneralWhatsAppLink } from "../lib/whatsapp";

const SHOP_PHONE = import.meta.env.VITE_WHATSAPP_NUMBER || "+10000000000";

const highlights = [
  { icon: Leaf, label: "Handpicked Blooms" },
  { icon: MessageCircle, label: "Order via WhatsApp" },
  { icon: Gift, label: "Every Occasion Covered" },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-rose-100 bg-rose-50/50">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 text-center sm:grid-cols-3">
        {highlights.map((h) => (
          <div
            key={h.label}
            className="flex items-center justify-center gap-3 text-stone-600"
          >
            <h.icon className="h-6 w-6 text-rose-500" strokeWidth={1.75} aria-hidden="true" />
            <span className="text-sm font-medium">{h.label}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-rose-100">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 text-sm text-stone-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Casa Lilly. All rights reserved.</p>
          <a
            href={buildGeneralWhatsAppLink(SHOP_PHONE)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-rose-600 hover:underline"
          >
            Chat with us on WhatsApp →
          </a>
        </div>
      </div>
    </footer>
  );
}

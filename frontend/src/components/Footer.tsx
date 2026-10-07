import { buildGeneralWhatsAppLink } from "../lib/whatsapp";
import { SHOP_PHONE } from "../lib/config";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-rose-100 bg-rose-50/50">
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
    </footer>
  );
}

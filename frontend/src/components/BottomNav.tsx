import { BookOpen, Heart, Home, Store, type LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import { buildGeneralWhatsAppLink } from "../lib/whatsapp";
import { useWishlist } from "../context/WishlistContext";
import { SHOP_PHONE } from "../lib/config";
import WhatsAppIcon from "./WhatsAppIcon";

const TABS: { to: string; label: string; icon: LucideIcon; end?: boolean }[] = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/shop", label: "Shop", icon: Store },
  { to: "/about", label: "About", icon: BookOpen },
  { to: "/wishlist", label: "Wishlist", icon: Heart },
];

/** Phones only — floating pill navigation at the bottom of the screen. */
export default function BottomNav() {
  const { items } = useWishlist();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-30 flex justify-center px-4 md:hidden"
    >
      <div className="grid w-full max-w-md grid-cols-5 rounded-full bg-white/95 px-2 py-1.5 shadow-lg shadow-stone-900/10 ring-1 ring-stone-100 backdrop-blur-xl">
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center gap-0.5 rounded-full py-1.5 text-[11px] font-medium transition ${
                isActive ? "text-rose-700" : "text-stone-500 hover:text-stone-800"
              }`
            }
          >
            <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            {label}
            {to === "/wishlist" && items.length > 0 && (
              <span className="absolute right-3 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
                {items.length}
              </span>
            )}
          </NavLink>
        ))}
        <a
          href={buildGeneralWhatsAppLink(SHOP_PHONE)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-0.5 rounded-full py-1.5 text-[11px] font-medium text-[#1ea952] transition hover:text-[#128c3f]"
        >
          <WhatsAppIcon className="h-5 w-5" />
          WhatsApp
        </a>
      </div>
    </nav>
  );
}

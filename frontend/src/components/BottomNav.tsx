import { ShoppingBag, BookOpen, Heart, Send } from "lucide-react";
import { NavLink } from "react-router-dom";
import logo from "../assets/logo-180.png";
import { buildGeneralWhatsAppLink } from "../lib/whatsapp";
import { useWishlist } from "../context/WishlistContext";

const SHOP_PHONE = import.meta.env.VITE_WHATSAPP_NUMBER || "+10000000000";

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `relative flex h-11 w-11 items-center justify-center rounded-full transition ${
    isActive ? "bg-white/90 text-stone-900" : "text-white/80 hover:text-white"
  }`;

/** Mobile only — replaces the top Navbar entirely below the sm breakpoint. */
export default function BottomNav() {
  const { items } = useWishlist();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-4 z-30 flex justify-center px-4 sm:hidden"
    >
      <div className="flex w-full max-w-sm items-center justify-between rounded-full border border-white/15 bg-stone-900/55 px-5 py-2 shadow-lg shadow-black/20 backdrop-blur-xl">
        <NavLink to="/" end aria-label="Home" className={tabClass}>
          <img
            src={logo}
            alt=""
            className="h-7 w-7 rounded-full object-cover"
          />
        </NavLink>
        <NavLink to="/shop" aria-label="Shop" className={tabClass}>
          <ShoppingBag className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
        </NavLink>
        <NavLink to="/about" aria-label="About Us" className={tabClass}>
          <BookOpen className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
        </NavLink>
        <NavLink to="/wishlist" aria-label="Wishlist" className={tabClass}>
          <Heart className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          {items.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
              {items.length}
            </span>
          )}
        </NavLink>
        <a
          href={buildGeneralWhatsAppLink(SHOP_PHONE)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact us on WhatsApp"
          className="flex h-11 w-11 items-center justify-center rounded-full text-white/80 transition hover:text-white"
        >
          <Send className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
        </a>
      </div>
    </nav>
  );
}

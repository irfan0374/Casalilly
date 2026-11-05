import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Heart, Search } from "lucide-react";
import logo from "../assets/logo-180.png";
import { buildGeneralWhatsAppLink } from "../lib/whatsapp";
import { useWishlist } from "../context/WishlistContext";
import { SHOP_PHONE } from "../lib/config";
import SearchOverlay from "./SearchOverlay";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-[15px] font-medium transition hover:text-rose-700 ${
    isActive ? "text-rose-700" : "text-stone-600"
  }`;

/** Slim sticky top bar on every storefront page. Phones get logo + search
 * + wishlist (the main navigation lives in BottomNav); from `md` up it
 * becomes the full navigation bar. */
export default function Navbar() {
  const { items } = useWishlist();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-stone-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:h-[72px] md:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="" className="h-10 w-10 rounded-full object-cover ring-1 ring-stone-100" />
            <span className="leading-none">
              <span className="block font-serif text-xl font-semibold text-stone-900">Casalily</span>
              <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.25em] text-stone-400">
                Dubai
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-10 md:flex" aria-label="Primary">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/shop" className={navLinkClass}>
              Shop
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              About
            </NavLink>
          </nav>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="flex h-11 w-11 items-center justify-center rounded-full text-stone-700 transition hover:bg-stone-100"
            >
              <Search className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            </button>
            <Link
              to="/wishlist"
              aria-label={`Wishlist${items.length ? ` (${items.length})` : ""}`}
              className="relative flex h-11 w-11 items-center justify-center rounded-full text-stone-700 transition hover:bg-stone-100"
            >
              <Heart className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
              {items.length > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
                  {items.length}
                </span>
              )}
            </Link>
            <a
              href={buildGeneralWhatsAppLink(SHOP_PHONE)}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 hidden h-10 items-center rounded-full bg-rose-600 px-5 text-sm font-semibold text-white transition hover:bg-rose-700 md:flex"
            >
              Contact us
            </a>
          </div>
        </div>
      </header>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

import { Link, NavLink } from "react-router-dom";
import logo from "../assets/logo-180.png";
import { buildGeneralWhatsAppLink } from "../lib/whatsapp";
import { useWishlist } from "../context/WishlistContext";

const SHOP_PHONE = import.meta.env.VITE_WHATSAPP_NUMBER || "+10000000000";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition hover:text-rose-600 ${
    isActive ? "text-rose-600" : "text-stone-600"
  }`;

/** Desktop/tablet only — mobile uses BottomNav instead (see PublicLayout). */
export default function Navbar() {
  const { items } = useWishlist();

  return (
    <header className="sticky top-0 z-20 hidden border-b border-rose-100 bg-white/90 backdrop-blur sm:block">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link
          to="/"
          className="flex items-center gap-2.5 font-serif text-xl font-bold text-stone-800"
        >
          <img
            src={logo}
            alt="Casa Lilly"
            className="h-10 w-10 rounded-full object-cover"
          />
          Casa Lilly
        </Link>

        <nav className="flex items-center gap-8">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/shop" className={navLinkClass}>
            Shop
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About Us
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-stone-600 transition hover:bg-rose-50 hover:text-rose-600"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21s-6.716-4.35-9.428-8.06C.94 10.35 1.2 6.9 3.8 5.2c2.13-1.4 4.66-.86 6.2 1.02L12 8.4l2-2.18c1.54-1.88 4.07-2.42 6.2-1.02 2.6 1.7 2.86 5.15 1.23 7.74C18.716 16.65 12 21 12 21Z"
              />
            </svg>
            {items.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
                {items.length}
              </span>
            )}
          </Link>
          <a
            href={buildGeneralWhatsAppLink(SHOP_PHONE)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            Contact Us
          </a>
        </div>
      </div>
    </header>
  );
}

import { ShoppingBag, BookOpen, Heart } from "lucide-react";
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
          <svg viewBox="0 0 32 32" fill="currentColor" className="h-5 w-5" aria-hidden="true">
            <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.386.697 4.61 1.898 6.484L4 29l7.694-1.86A11.94 11.94 0 0 0 16.001 27C22.63 27 28 21.627 28 15S22.63 3 16.001 3Zm0 21.75a9.7 9.7 0 0 1-4.95-1.36l-.355-.21-4.566 1.104 1.127-4.45-.232-.367A9.72 9.72 0 0 1 5.75 15c0-5.66 4.59-10.25 10.251-10.25S26.25 9.34 26.25 15 20.912 24.75 16.001 24.75Zm5.593-7.593c-.306-.153-1.81-.893-2.09-.995-.28-.102-.483-.153-.687.153-.204.306-.79.995-.968 1.199-.178.204-.357.23-.663.077-.306-.153-1.292-.476-2.462-1.518-.91-.812-1.525-1.814-1.704-2.12-.178-.306-.019-.472.134-.624.138-.137.306-.357.459-.535.153-.178.204-.306.306-.51.102-.204.051-.383-.026-.536-.076-.153-.687-1.656-.941-2.268-.248-.596-.5-.515-.687-.524l-.586-.01c-.204 0-.535.077-.815.383-.28.306-1.069 1.044-1.069 2.547 0 1.503 1.094 2.955 1.247 3.159.153.204 2.153 3.288 5.218 4.61.729.315 1.298.503 1.741.644.731.233 1.396.2 1.922.121.586-.088 1.81-.74 2.065-1.454.255-.714.255-1.326.179-1.454-.077-.128-.281-.204-.587-.357Z" />
          </svg>
        </a>
      </div>
    </nav>
  );
}

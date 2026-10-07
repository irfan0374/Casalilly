import { Link } from "react-router-dom";
import { Camera, MapPin, Phone } from "lucide-react";
import logo from "../assets/logo-180.png";
import { buildGeneralWhatsAppLink } from "../lib/whatsapp";
import { INSTAGRAM_HANDLE, SHOP_ADDRESS, SHOP_LANDLINE, SHOP_PHONE } from "../lib/config";
import WhatsAppIcon from "./WhatsAppIcon";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-stone-100 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 text-center md:grid-cols-4 md:px-8 md:text-left">
        <div className="flex flex-col items-center md:items-start">
          <img src={logo} alt="" className="h-12 w-12 rounded-full object-cover ring-1 ring-stone-100" />
          <p className="mt-3 font-serif text-2xl font-semibold text-stone-900">Casa Lilly</p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-stone-500">
            Fresh flowers, plants and gifts, handcrafted in Dubai.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">Explore</p>
          <ul className="mt-4 flex justify-center gap-6 text-sm text-stone-700 md:flex-col md:gap-3">
            <li><Link to="/shop" className="hover:text-rose-700">Shop</Link></li>
            <li><Link to="/about" className="hover:text-rose-700">About</Link></li>
            <li><Link to="/wishlist" className="hover:text-rose-700">Wishlist</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">Visit us</p>
          <ul className="mt-4 flex flex-col items-center gap-3 text-sm text-stone-700 md:items-start">
            <li className="flex max-w-xs items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-stone-400" aria-hidden="true" />
              {SHOP_ADDRESS}
            </li>
            <li>
              <a href={`tel:${SHOP_LANDLINE.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-rose-700">
                <Phone className="h-4 w-4 text-stone-400" aria-hidden="true" />
                {SHOP_LANDLINE}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">Follow & chat</p>
          <div className="mt-4 flex flex-col items-center gap-3 text-sm md:items-start">
            <a
              href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-stone-700 hover:text-rose-700"
            >
              <Camera className="h-4 w-4 text-stone-400" aria-hidden="true" />@{INSTAGRAM_HANDLE}
            </a>
            <a
              href={buildGeneralWhatsAppLink(SHOP_PHONE)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-medium text-[#1ea952] hover:text-[#128c3f]"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
      <p className="border-t border-stone-100 py-5 text-center text-xs text-stone-400">
        © {new Date().getFullYear()} Casa Lilly. All rights reserved.
      </p>
    </footer>
  );
}

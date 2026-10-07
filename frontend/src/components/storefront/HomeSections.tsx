import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Flower2,
  Leaf,
  LayoutGrid,
  MapPin,
  Navigation,
  Phone,
  Smile,
  type LucideIcon,
} from "lucide-react";
import WhatsAppIcon from "../WhatsAppIcon";
import type { Occasion } from "../../types";
import { categoryIcon, categoryImage, formatCategory } from "../../lib/categories";
import { buildGeneralWhatsAppLink } from "../../lib/whatsapp";
import { SHOP_ADDRESS, SHOP_LANDLINE, SHOP_MOBILE_DISPLAY, SHOP_PHONE } from "../../lib/config";

/** Serif section title with an optional right-hand link/label. */
export function SectionHeader({
  title,
  eyebrow,
  action,
}: {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4 md:mb-7">
      <div>
        {eyebrow && (
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-rose-700">
            {eyebrow}
          </p>
        )}
        <h2 className="font-serif text-[22px] font-medium leading-tight text-stone-900 md:text-4xl">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

export function ViewAllLink({ to, label = "View all" }: { to: string; label?: string }) {
  return (
    <Link
      to={to}
      className="flex flex-shrink-0 items-center gap-1 text-sm font-semibold text-rose-700 hover:text-rose-800"
    >
      {label}
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}

/** Container shared by every homepage section, so spacing stays uniform. */
export function HomeSection({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`mx-auto max-w-7xl px-4 pt-12 md:px-8 md:pt-20 ${className}`}>{children}</section>;
}

interface Stat {
  icon: LucideIcon;
  value: string;
  label: string;
}

/** One slim card with four small stats, divided by hairlines. */
export function StatsStrip({ categoryCount, loading }: { categoryCount: number; loading: boolean }) {
  const stats: Stat[] = [
    { icon: LayoutGrid, value: loading ? "–" : String(categoryCount), label: "Categories" },
    { icon: Leaf, value: "Fresh", label: "Picked daily" },
    { icon: Smile, value: "1000+", label: "Happy customers" },
    { icon: Flower2, value: "Direct", label: "WhatsApp orders" },
  ];
  return (
    <section className="mx-auto max-w-4xl px-4 pt-6 md:px-8 md:pt-8">
      <div className="grid grid-cols-4 divide-x divide-stone-100 rounded-3xl bg-white py-4 ring-1 ring-stone-100">
        {stats.map(({ icon: Icon, value, label }) => (
          <div key={label} className="flex flex-col items-center gap-1 px-1 text-center">
            <Icon className="h-4 w-4 text-rose-600" strokeWidth={1.75} aria-hidden="true" />
            <span className="text-sm font-semibold text-stone-900 md:text-lg">{value}</span>
            <span className="text-[11px] leading-tight text-stone-500 md:text-xs">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

const SEARCH_CHIPS = ["Roses", "Birthday", "Anniversary", "Plants", "Hatbox"];

/** Quick-search suggestion chips under the search bar. */
export function SearchChips() {
  return (
    <div className="scrollbar-none -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 md:mx-0 md:justify-center md:px-0">
      {SEARCH_CHIPS.map((term) => (
        <Link
          key={term}
          to={`/shop?search=${encodeURIComponent(term.toLowerCase())}`}
          className="flex h-9 flex-shrink-0 items-center rounded-full bg-white px-4 text-sm text-stone-600 ring-1 ring-stone-200 transition hover:text-rose-700 hover:ring-rose-300"
        >
          {term}
        </Link>
      ))}
    </div>
  );
}

/** Circular category thumbnails — a swipe row on phones, one row on desktop. */
export function CategoryRow({ categories }: { categories: string[] }) {
  return (
    <div className="scrollbar-none -mx-4 flex gap-4 overflow-x-auto px-4 pb-1 md:mx-0 md:justify-center md:gap-8 md:px-0">
      {categories.map((category) => {
        const image = categoryImage(category);
        const Icon = categoryIcon(category);
        return (
          <Link
            key={category}
            to={`/shop?category=${encodeURIComponent(category)}`}
            className="group flex w-20 flex-shrink-0 flex-col items-center gap-2.5 md:w-24"
          >
            <span className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-stone-100 ring-1 ring-stone-100 transition group-hover:ring-2 group-hover:ring-rose-300 md:h-24 md:w-24">
              {image ? (
                <img src={image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              ) : (
                <Icon className="h-8 w-8 text-rose-600" strokeWidth={1.5} aria-hidden="true" />
              )}
            </span>
            <span className="text-center text-sm text-stone-700 group-hover:text-rose-700">
              {formatCategory(category)}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export function CategoryRowSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden md:justify-center md:gap-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex w-20 flex-shrink-0 flex-col items-center gap-2.5 md:w-24">
          <span className="h-20 w-20 animate-pulse rounded-full bg-stone-100 md:h-24 md:w-24" />
          <span className="h-3 w-14 animate-pulse rounded bg-stone-100" />
        </div>
      ))}
    </div>
  );
}

// The immutable occasion id keeps product assignments intact after renaming.
export function OccasionGrid({ occasions }: { occasions: Occasion[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-6">
      {occasions.map(({ id, name, shop_link, image_url }) => (
        <Link
          key={id}
          to={shop_link || `/shop?occasion=${id}`}
          className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-stone-200 shadow-sm outline-offset-4 focus-visible:outline-2 focus-visible:outline-rose-600"
        >
          <img
            src={image_url}
            alt=""
            loading="lazy"
            decoding="async"
            width={640}
            height={480}
            className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
          />
          <span className="absolute inset-0 bg-black/40" aria-hidden="true" />
          <span className="absolute inset-x-0 bottom-0 p-3 font-serif text-lg font-medium leading-tight text-white md:p-4">
            {name}
          </span>
        </Link>
      ))}
    </div>
  );
}

/** Photo + short story with a link. Stacked on phones, side by side on
 * desktop (`reverse` puts the photo on the right). */
export function StoryCard({
  image,
  imageAlt,
  eyebrow,
  title,
  body,
  cta,
  to,
  reverse,
}: {
  image: string;
  imageAlt: string;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  to: string;
  reverse?: boolean;
}) {
  return (
    <div
      className={`overflow-hidden rounded-3xl bg-white ring-1 ring-stone-100 md:flex ${
        reverse ? "md:flex-row-reverse" : ""
      }`}
    >
      {/* Fixed-ratio frame so a tall source photo can't stretch the card. */}
      <div className="relative aspect-[16/11] w-full md:aspect-auto md:min-h-[420px] md:w-3/5">
        <img
          src={image}
          alt={imageAlt}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-col items-start justify-center gap-3 p-6 md:w-2/5 md:p-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-rose-700">{eyebrow}</p>
        <h2 className="font-serif text-[22px] font-medium leading-tight text-stone-900 md:text-4xl">{title}</h2>
        <p className="text-[15px] leading-relaxed text-stone-600">{body}</p>
        <Link
          to={to}
          className="mt-2 flex h-11 items-center gap-1.5 rounded-full px-5 text-sm font-semibold text-rose-700 ring-1 ring-stone-200 transition hover:bg-rose-50 hover:ring-rose-200"
        >
          {cta}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

const MAP_QUERY = encodeURIComponent(`Casa Lilly, ${SHOP_ADDRESS}`);

/** Map + address + call/WhatsApp buttons for visiting the shop. */
export function VisitBoutique() {
  return (
    <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-stone-100 md:grid md:grid-cols-2">
      <iframe
        title="Map showing Casa Lilly's location"
        src={`https://www.google.com/maps?q=${MAP_QUERY}&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="aspect-[16/10] w-full border-0 md:aspect-auto md:h-full md:min-h-80"
      />
      <div className="flex flex-col gap-5 p-6 md:p-10">
        <div className="flex gap-3">
          <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-600" aria-hidden="true" />
          <div>
            <p className="font-semibold text-stone-900">Casa Lilly</p>
            <p className="mt-0.5 text-[15px] text-stone-600">{SHOP_ADDRESS}</p>
          </div>
        </div>
        <div className="flex gap-3 text-[15px] text-stone-600">
          <Phone className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-600" aria-hidden="true" />
          <div className="space-y-1">
            <p>
              Phone{" "}
              <a href={`tel:+971${SHOP_LANDLINE.replace(/\s/g, "").slice(1)}`} className="font-medium text-stone-900 hover:text-rose-700">
                {SHOP_LANDLINE}
              </a>
            </p>
            <p>
              Mobile / WhatsApp{" "}
              <a href={`tel:+971${SHOP_MOBILE_DISPLAY.replace(/\s/g, "").slice(1)}`} className="font-medium text-stone-900 hover:text-rose-700">
                {SHOP_MOBILE_DISPLAY}
              </a>
            </p>
          </div>
        </div>
        <div className="mt-1 grid grid-cols-2 gap-3">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 items-center justify-center gap-2 rounded-full text-sm font-semibold text-stone-800 ring-1 ring-stone-200 transition hover:bg-stone-50"
          >
            <Navigation className="h-4 w-4" aria-hidden="true" />
            Directions
          </a>
          <a
            href={buildGeneralWhatsAppLink(SHOP_PHONE)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-semibold text-white transition hover:bg-[#1ebe57]"
          >
            <WhatsAppIcon className="h-4 w-4" />
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

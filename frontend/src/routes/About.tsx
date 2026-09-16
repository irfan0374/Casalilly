import { useEffect, useState } from "react";
import { MapPin, Phone, Smartphone } from "lucide-react";
import PublicLayout from "../components/PublicLayout";
import { getSettings } from "../api/settings";
import { buildGeneralWhatsAppLink } from "../lib/whatsapp";
import boutiqueImage from "../assets/about/img_6893.png";
import bouquetImage from "../assets/about/Team Training_ Bouquet Bootcamp with The Floral Coach - Sweet Root Village Blog.jpeg";
import toteImage from "../assets/about/img_6894.jpg";
import type { SiteSettings } from "../types";

import teamBigImage from "../assets/about/team-1.png";
import teamSmall1Image from "../assets/about/team-2.jpeg";
import teamSmall2Image from "../assets/about/team-3.jpeg";

const SHOP_PHONE = import.meta.env.VITE_WHATSAPP_NUMBER || "+9710586569933";
const INSTAGRAM_HANDLE = "casalily26";

const DEFAULT_HEADING = "Casa Lily Flowers & Plants";
const DEFAULT_BODY =
  "Casa Lily Boutique merges premium botanicals with elite craftsmanship, delivering sophisticated floral experiences for every space.";

const STORY_TILES = [
  {
    image: teamSmall2Image,
    title: "Indoor Plant Styling",
    caption: "Elevate your interiors with our curated selection of lush, thriving indoor plants designed to breathe life into your home.",
    className: "sm:row-span-2",
    imageClassName: "sm:h-full",
  },
  {
    image: teamSmall1Image,
    title: "Outdoor Decorating",
    caption: "Transform your exterior spaces into breathtaking botanical retreats with our expert outdoor plant landscaping.",
    className: "sm:row-span-1",
    imageClassName: "sm:h-full",
  },
  {
    image: teamBigImage,
    title: "Handcrafted Bouquets",
    caption: "Beautifully composed fresh stems, lovingly packaged and delivered across Dubai.",
    className: "sm:row-span-2",
    imageClassName: "sm:h-full",
  },
];

export default function About() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    getSettings()
      .then(setSettings)
      .catch(() => setSettings(null));
  }, []);

  const heading = settings?.about_heading || DEFAULT_HEADING;
  const body = settings?.about_body || DEFAULT_BODY;

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-rose-50 to-transparent px-4 py-16 text-center sm:py-20">
        <h1 className="font-serif text-4xl font-bold text-stone-800 sm:text-5xl">
          {heading}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl whitespace-pre-line text-lg leading-relaxed text-stone-600">
          {body}
        </p>
      </section>

      {/* Our Team Section */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <h2 className="text-center font-serif text-2xl font-bold text-stone-800 sm:text-3xl">
          Our Team
        </h2>
        <div className="mt-8 flex flex-col gap-4 sm:gap-6">
          <div className="relative overflow-hidden rounded-2xl shadow-sm">
            <img
              src={boutiqueImage}
              alt="Casa Lily boutique interior"
              className="h-72 w-full object-cover sm:h-96"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <div className="relative overflow-hidden rounded-2xl shadow-sm">
              <img
                src={bouquetImage}
                alt="Our expert florists"
                className="h-40 w-full object-cover sm:h-56"
              />
            </div>
            <div className="relative overflow-hidden rounded-2xl shadow-sm">
              <img
                src={toteImage}
                alt="Casa Lily delivery and packaging"
                className="h-40 w-full object-cover sm:h-56"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Service Section */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <h2 className="text-center font-serif text-2xl font-bold text-stone-800 sm:text-3xl">
          Our Services
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
          {STORY_TILES.map((tile) => (
            <div
              key={tile.title}
              className={`group relative overflow-hidden rounded-2xl shadow-sm ${tile.className}`}
            >
              <img
                src={tile.image}
                alt={tile.title}
                className={`h-64 w-full object-cover transition duration-700 group-hover:scale-105 ${tile.imageClassName}`}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="font-serif text-xl font-bold text-white">
                  {tile.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/90">
                  {tile.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contacts Section */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:pb-20">
        <div className="overflow-hidden rounded-3xl bg-stone-900 px-6 py-12 text-center text-white sm:py-16 shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-300">
            Contacts
          </p>
          <p className="mt-3 font-serif text-2xl font-bold sm:text-3xl">
            Casa Lily Flowers &amp; Plants
          </p>

          <div className="mx-auto mt-6 flex max-w-md flex-col items-center gap-3 text-sm text-white/80 sm:text-base">
            <p className="flex items-start justify-center gap-2">
              <MapPin className="mt-1 h-4 w-4 flex-shrink-0 text-rose-300" strokeWidth={2} aria-hidden="true" />
              <span>Mubarak Al Mansoori Building, Arjan | Al Barsha 3, Dubai | UAE</span>
            </p>
            <p className="flex items-center justify-center gap-2">
              <Phone className="h-4 w-4 flex-shrink-0 text-rose-300" strokeWidth={2} aria-hidden="true" />
              <a href="tel:+97144269933" className="transition hover:text-rose-200">
                04 426 9933
              </a>
            </p>
            <p className="flex items-center justify-center gap-2">
              <Smartphone className="h-4 w-4 flex-shrink-0 text-rose-300" strokeWidth={2} aria-hidden="true" />
              <a href="tel:+971586569933" className="transition hover:text-rose-200">
                058 656 9933
              </a>
            </p>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <a
              href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Casa Lily on Instagram"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/25 text-white transition hover:border-rose-300 hover:bg-white/10 hover:text-rose-300"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a
              href={buildGeneralWhatsAppLink(SHOP_PHONE)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with Casa Lily on WhatsApp"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/25 text-white transition hover:border-rose-300 hover:bg-white/10 hover:text-rose-300"
            >
              <svg viewBox="0 0 32 32" fill="currentColor" className="h-6 w-6" aria-hidden="true">
                <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.386.697 4.61 1.898 6.484L4 29l7.694-1.86A11.94 11.94 0 0 0 16.001 27C22.63 27 28 21.627 28 15S22.63 3 16.001 3Zm0 21.75a9.7 9.7 0 0 1-4.95-1.36l-.355-.21-4.566 1.104 1.127-4.45-.232-.367A9.72 9.72 0 0 1 5.75 15c0-5.66 4.59-10.25 10.251-10.25S26.25 9.34 26.25 15 20.912 24.75 16.001 24.75Zm5.593-7.593c-.306-.153-1.81-.893-2.09-.995-.28-.102-.483-.153-.687.153-.204.306-.79.995-.968 1.199-.178.204-.357.23-.663.077-.306-.153-1.292-.476-2.462-1.518-.91-.812-1.525-1.814-1.704-2.12-.178-.306-.019-.472.134-.624.138-.137.306-.357.459-.535.153-.178.204-.306.306-.51.102-.204.051-.383-.026-.536-.076-.153-.687-1.656-.941-2.268-.248-.596-.5-.515-.687-.524l-.586-.01c-.204 0-.535.077-.815.383-.28.306-1.069 1.044-1.069 2.547 0 1.503 1.094 2.955 1.247 3.159.153.204 2.153 3.288 5.218 4.61.729.315 1.298.503 1.741.644.731.233 1.396.2 1.922.121.586-.088 1.81-.74 2.065-1.454.255-.714.255-1.326.179-1.454-.077-.128-.281-.204-.587-.357Z" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
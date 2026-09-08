import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { HeroSlide } from "../types";

const AUTO_ROTATE_MS = 6000;

/** Full-bleed hero banner. A single slide renders statically; several
 * cross-fade on an interval with dot navigation, so admins can add more
 * without the homepage needing any other change. */
export default function HeroSlideshow({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, AUTO_ROTATE_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Clamp in case the active slide count shrinks (e.g. one gets disabled
  // elsewhere) while this page is open.
  const active = slides[index] ?? slides[0];
  if (!active) return null;

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[21/9]">
        {slides.map((slide, i) => (
          <img
            key={slide.id}
            src={slide.image_url}
            alt={slide.heading ?? "Casa Lilly"}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

        <div className="absolute inset-0 flex flex-col items-start justify-center gap-4 px-6 pb-16 sm:px-12 sm:pb-20 lg:px-20 lg:pb-24">
          <h1 className="max-w-2xl font-serif text-3xl font-bold leading-tight text-white drop-shadow sm:text-4xl lg:text-5xl">
            {active.heading || "Fresh Flowers & Gifts, Delivered with Love"}
          </h1>
          <p className="max-w-xl text-white/90 drop-shadow">
            {active.subheading ||
              "Handpicked bouquets, plants & gift baskets for every occasion — browse the collection and order in a tap over WhatsApp."}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <Link
              to="/shop"
              className="rounded-full bg-rose-600 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
            >
              Shop Now
            </Link>
            <Link
              to="/shop"
              className="text-sm font-semibold text-white/90 hover:text-white"
            >
              Browse Categories →
            </Link>
          </div>
        </div>

        {slides.length > 1 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Show slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

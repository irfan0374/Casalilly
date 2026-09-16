import { useEffect, useState } from "react";
import HeroSearchBar from "./HeroSearchBar";
import SearchOverlay from "./SearchOverlay";
import type { HeroSlide } from "../types";

const AUTO_ROTATE_MS = 6000;

/** Full-bleed hero banner. A single slide renders statically; several
 * cross-fade on an interval with dot navigation and prev/next arrows, so
 * admins can add more without the homepage needing any other change. */
export default function HeroSlideshow({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, AUTO_ROTATE_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  function goToPrev() {
    setIndex((i) => (i - 1 + slides.length) % slides.length);
  }

  function goToNext() {
    setIndex((i) => (i + 1) % slides.length);
  }

  if (slides.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-3 pt-4 sm:px-4 lg:px-1">
      <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl sm:aspect-[2/1] sm:rounded-3xl lg:aspect-[3/1]">
        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="relative h-full w-full flex-shrink-0">
              <img
                src={slide.image_url}
                alt={slide.heading ?? "Casa Lilly"}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
              <div className="absolute inset-0 flex flex-col items-start justify-center gap-3 px-6 pb-4 sm:gap-4 sm:px-12 lg:px-20">
                <h1 className="max-w-2xl font-serif text-2xl font-bold leading-tight text-white drop-shadow sm:text-4xl lg:text-5xl">
                  {slide.heading || "Fresh Flowers & Gifts, Delivered with Love"}
                </h1>
                <p className="max-w-xl text-sm text-white/90 drop-shadow sm:text-base">
                  {slide.subheading ||
                    "Handpicked bouquets, plants & gift baskets for every occasion — browse the collection and order in a tap over WhatsApp."}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute inset-x-0 top-3 z-20 flex justify-center px-4 sm:top-5">
          <HeroSearchBar onOpen={() => setSearchOpen(true)} />
        </div>

        <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={goToPrev}
              aria-label="Previous slide"
              className="absolute left-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-stone-700 backdrop-blur transition hover:bg-white sm:left-4 sm:h-10 sm:w-10"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 sm:h-5 sm:w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={goToNext}
              aria-label="Next slide"
              className="absolute right-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-stone-700 backdrop-blur transition hover:bg-white sm:right-4 sm:h-10 sm:w-10"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 sm:h-5 sm:w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

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
          </>
        )}
      </div>
    </section>
  );
}

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HeroSlide } from "../types";
import { buildGeneralWhatsAppLink } from "../lib/whatsapp";
import { SHOP_PHONE } from "../lib/config";
import WhatsAppIcon from "./WhatsAppIcon";

const AUTO_ROTATE_MS = 6000;
const SWIPE_THRESHOLD_PX = 40;

/** Homepage hero. Slides (desktop + mobile photo, optional heading and
 * subtext) come from the admin's Banners screen; several rotate on a timer, can be swiped on phones, and
 * get arrows on desktop. */
export default function HeroSlideshow({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  // Bumped on manual navigation so the auto-rotate timer restarts instead
  // of flipping the slide right after the visitor chose one.
  const [interaction, setInteraction] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, AUTO_ROTATE_MS);
    return () => clearInterval(timer);
  }, [slides.length, interaction]);

  function go(delta: number) {
    setIndex((i) => (i + delta + slides.length) % slides.length);
    setInteraction((n) => n + 1);
  }

  if (slides.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-4 md:px-8 md:pt-6">
      <div
        className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-stone-200 sm:aspect-[16/10] lg:aspect-[21/9]"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null || slides.length < 2) return;
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          if (Math.abs(dx) > SWIPE_THRESHOLD_PX) go(dx < 0 ? 1 : -1);
          touchStartX.current = null;
        }}
      >
        <div
          className="flex h-full transition-transform duration-700 ease-[cubic-bezier(.22,.61,.36,1)]"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide, i) => {
            // A banner with no text shows just the photo and the buttons, so
            // text baked into the photo itself isn't covered or shaded.
            const hasText = Boolean(slide.heading || slide.subheading);
            return (
            <div
              key={slide.id}
              className="relative h-full w-full flex-shrink-0"
              aria-hidden={i !== index}
            >
              {/* Portrait photo on phones (where the hero is 4:5), wide photo
                  from sm up. Older banners without a mobile photo fall back
                  to the wide one. */}
              <picture>
                <source media="(min-width: 640px)" srcSet={slide.image_url} />
                <img
                  src={slide.mobile_image_url || slide.image_url}
                  alt={slide.heading ?? ""}
                  loading={i === 0 ? "eager" : "lazy"}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </picture>
              {hasText ? (
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent lg:bg-gradient-to-r lg:from-black/60 lg:via-black/25" />
              ) : (
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
              )}
              <div
                className={`absolute inset-x-0 bottom-0 flex flex-col items-start gap-3 p-6 pb-12 sm:p-10 sm:pb-14 ${
                  hasText ? "lg:inset-y-0 lg:max-w-2xl lg:justify-center lg:p-16" : "lg:px-16"
                }`}
              >
                {hasText && (
                  <>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/75">
                      Casa Lilly · Dubai
                    </p>
                    {slide.heading && (
                      <h1 className="font-serif text-[28px] font-medium leading-[1.1] text-white sm:text-5xl lg:text-6xl">
                        {slide.heading}
                      </h1>
                    )}
                    {slide.subheading && (
                      <p className="max-w-md text-[15px] leading-relaxed text-white/85 sm:text-base">
                        {slide.subheading}
                      </p>
                    )}
                  </>
                )}
                <div className={`grid w-full grid-cols-2 gap-2.5 sm:flex sm:w-auto sm:gap-3 ${hasText ? "mt-3" : ""}`}>
                  <Link
                    to="/shop"
                    tabIndex={i === index ? 0 : -1}
                    className="flex h-11 items-center justify-center rounded-full bg-rose-600 px-3 text-sm sm:h-12 sm:px-6 sm:text-[15px] font-semibold text-white transition hover:bg-rose-700"
                  >
                    Shop now
                  </Link>
                  <a
                    href={buildGeneralWhatsAppLink(SHOP_PHONE)}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={i === index ? 0 : -1}
                    className="flex h-11 items-center justify-center gap-1.5 rounded-full bg-white px-3 text-sm sm:h-12 sm:gap-2 sm:px-5 sm:text-[15px] font-semibold text-stone-900 transition hover:bg-stone-100"
                  >
                    <WhatsAppIcon className="h-5 w-5 text-[#25D366]" />
                    <span className="sm:hidden">WhatsApp</span>
                    <span className="hidden sm:inline">Order on WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
            );
          })}
        </div>

        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous slide"
              className="absolute left-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-stone-800 backdrop-blur transition hover:bg-white lg:flex"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next slide"
              className="absolute right-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-stone-800 backdrop-blur transition hover:bg-white lg:flex"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-1.5">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Show slide ${i + 1}`}
                  aria-current={i === index}
                  onClick={() => {
                    setIndex(i);
                    setInteraction((n) => n + 1);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
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

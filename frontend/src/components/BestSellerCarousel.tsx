import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { Link } from "react-router-dom";
import ProductImage from "./ProductImage";
import type { Product } from "../types";

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23fbe7ef'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='20' fill='%23d18ca8' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";

/**
 * Coverflow-style horizontal carousel: the item nearest the viewport
 * center renders at full size/opacity, neighbors shrink & fade based on
 * their live distance from center (recomputed on scroll via rAF), so the
 * focus effect stays smooth for touch swipes, wheel scroll, and drag alike.
 */
export default function BestSellerCarousel({
  products,
}: {
  products: Product[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const rafRef = useRef<number | null>(null);
  const dragRef = useRef({ active: false, startX: 0, startScroll: 0, moved: 0 });
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateStyles = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const trackRect = track.getBoundingClientRect();
    const center = trackRect.left + trackRect.width / 2;
    const cardWidth =
      itemRefs.current.find(Boolean)?.getBoundingClientRect().width || 260;
    // Reference distance spans ~2.4 card-widths so the size/opacity/blur
    // falloff reads as a smooth staircase across several neighbors on each
    // side (not just an immediate on/off between center and everything
    // else), which is what gives the coverflow its premium feel.
    const reference = cardWidth * 2.4;

    itemRefs.current.forEach((el) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const itemCenter = rect.left + rect.width / 2;
      const normalized = Math.min(Math.abs(itemCenter - center) / reference, 1);
      const scale = 1 - normalized * 0.42;
      const opacity = 1 - normalized * 0.85;
      el.style.transform = `scale(${scale.toFixed(3)})`;
      el.style.opacity = opacity.toFixed(3);
      el.style.filter = normalized > 0.04 ? `blur(${(normalized * 4).toFixed(2)}px)` : "none";
      el.style.zIndex = String(Math.round((1 - normalized) * 10));
    });

    setAtStart(track.scrollLeft <= 4);
    setAtEnd(track.scrollLeft >= track.scrollWidth - track.clientWidth - 4);
  }, []);

  const scheduleUpdate = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(updateStyles);
  }, [updateStyles]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Center on the middle item (not the first) so both arrows are usable
    // right away — starting at item 1 always disabled the "previous" arrow,
    // which hid the fact that you can scroll either direction. Runs in a
    // layout effect (before paint) so there's no flash of item 1 centered
    // first.
    const first = itemRefs.current.find(Boolean);
    if (first && products.length > 1) {
      const gap = parseFloat(getComputedStyle(track).columnGap || "0") || 0;
      const step = first.getBoundingClientRect().width + gap;
      const middleIndex = Math.floor((products.length - 1) / 2);
      track.scrollLeft = step * middleIndex;
    }

    scheduleUpdate();
    const ro = new ResizeObserver(scheduleUpdate);
    ro.observe(track);
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", scheduleUpdate);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [scheduleUpdate, products.length]);

  const scrollByCard = (dir: 1 | -1) => {
    const track = trackRef.current;
    const first = itemRefs.current.find(Boolean);
    if (!track || !first) return;
    const gap = parseFloat(getComputedStyle(track).columnGap || "24") || 24;
    const amount = first.getBoundingClientRect().width + gap;
    track.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  // Drag-to-scroll for mouse/trackpad users; touch keeps native momentum
  // scrolling so it doesn't fight the browser's own swipe handling.
  // Listens on `window` (rather than using setPointerCapture) so the click
  // that follows a plain, no-drag press still lands on the card underneath
  // instead of being redirected to the track.
  const onWindowMouseMove = useCallback(
    (e: MouseEvent) => {
      const track = trackRef.current;
      const drag = dragRef.current;
      if (!track || !drag.active) return;
      const delta = e.clientX - drag.startX;
      drag.moved = Math.max(drag.moved, Math.abs(delta));
      track.scrollLeft = drag.startScroll - delta;
      scheduleUpdate();
    },
    [scheduleUpdate]
  );

  const onWindowMouseUp = useCallback(() => {
    const track = trackRef.current;
    if (track) {
      track.style.scrollSnapType = "";
      track.classList.remove("cursor-grabbing");
    }
    dragRef.current.active = false;
    window.removeEventListener("mousemove", onWindowMouseMove);
    window.removeEventListener("mouseup", onWindowMouseUp);
  }, [onWindowMouseMove]);

  const onMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track) return;
    dragRef.current = { active: true, startX: e.clientX, startScroll: track.scrollLeft, moved: 0 };
    track.style.scrollSnapType = "none";
    track.classList.add("cursor-grabbing");
    window.addEventListener("mousemove", onWindowMouseMove);
    window.addEventListener("mouseup", onWindowMouseUp);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", onWindowMouseMove);
      window.removeEventListener("mouseup", onWindowMouseUp);
    };
  }, [onWindowMouseMove, onWindowMouseUp]);

  if (products.length === 0) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => scrollByCard(-1)}
        disabled={atStart}
        aria-label="Previous product"
        className={`absolute left-0 top-[38%] z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-stone-500 shadow-md shadow-black/10 transition hover:text-rose-600 hover:shadow-lg disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-stone-500 sm:h-11 sm:w-11 sm:left-1 lg:-left-2`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 sm:h-5 sm:w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div
        ref={trackRef}
        role="region"
        aria-label="Best sellers carousel"
        tabIndex={0}
        onScroll={scheduleUpdate}
        onMouseDown={onMouseDown}
        onClickCapture={(e) => {
          if (dragRef.current.moved > 6) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        className="scrollbar-none flex cursor-grab snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth px-[calc(50%-19vw)] py-6 select-none sm:gap-3 sm:px-[calc(50%-115px)] lg:gap-4 lg:px-[calc(50%-130px)]"
      >
        {products.map((product, i) => (
          <div
            key={product.id}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className="w-[38vw] flex-shrink-0 snap-center transition-[transform,opacity,filter] duration-150 ease-out will-change-transform sm:w-[230px] lg:w-[260px]"
          >
            <CarouselCard product={product} />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scrollByCard(1)}
        disabled={atEnd}
        aria-label="Next product"
        className={`absolute right-0 top-[38%] z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-stone-500 shadow-md shadow-black/10 transition hover:text-rose-600 hover:shadow-lg disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-stone-500 sm:h-11 sm:w-11 sm:right-1 lg:-right-2`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 sm:h-5 sm:w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

function CarouselCard({ product }: { product: Product }) {
  return (
    <Link
      to={`/product/${product.id}`}
      draggable={false}
      className="flex flex-col items-center text-center"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-rose-50">
        <ProductImage
          src={product.image_url}
          alt={product.name}
          fallback={FALLBACK_IMAGE}
          draggable={false}
          className="h-full w-full object-cover"
        />
      </div>
      <h3 className="mt-4 line-clamp-1 text-sm font-semibold text-stone-800 sm:text-base">
        {product.name}
      </h3>
    </Link>
  );
}

import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Pause, Play } from "lucide-react";
import type { Product } from "../types";
import ProductImage from "./ProductImage";
import WhatsAppButton from "./WhatsAppButton";
import WishlistButton from "./WishlistButton";
import { formatCategory } from "../lib/categories";
import { releaseVideoPlay, requestVideoPlay } from "../lib/videoPlayback";

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23fbe7ef'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='20' fill='%23d18ca8' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";

export default function ProductCard({ product }: { product: Product }) {
  const [videoActive, setVideoActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Stable identity so the global "one video at a time" coordinator can
  // tell this card's own stop-callback apart from a fresh closure on every
  // render (otherwise resuming playback would look like a different video
  // starting and stop itself).
  const stopVideo = useCallback(() => {
    setVideoActive(false);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    return () => releaseVideoPlay(stopVideo);
  }, [stopVideo]);

  // The `autoPlay` attribute alone is unreliable here — the browser's
  // autoplay policy can reject it since the element mounts asynchronously
  // (on the next render, after the click that triggered it), landing just
  // outside the window it recognizes as a direct user gesture. Calling
  // .play() explicitly once the element exists is more robust.
  useEffect(() => {
    if (videoActive) videoRef.current?.play().catch(() => {});
  }, [videoActive]);

  // Pause (not revert to the image) when this card scrolls out of view —
  // only reverting fully happens when a different video takes over.
  useEffect(() => {
    if (!videoActive) return;
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) videoRef.current?.pause();
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [videoActive]);

  function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!videoActive) {
      requestVideoPlay(stopVideo);
      setVideoActive(true);
      return;
    }
    if (isPlaying) {
      videoRef.current?.pause();
    } else {
      requestVideoPlay(stopVideo);
      videoRef.current?.play().catch(() => {});
    }
  }

  return (
    <Link
      to={`/product/${product.id}`}
      className="group flex flex-col overflow-hidden border border-stone-200 bg-white transition-colors duration-300 hover:border-rose-300"
    >
      <div
        ref={containerRef}
        className="relative aspect-square w-full overflow-hidden bg-rose-50"
      >
        {videoActive && product.video_url ? (
          <video
            ref={videoRef}
            src={product.video_url}
            autoPlay
            loop
            playsInline
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="h-full w-full object-cover"
          />
        ) : (
          <ProductImage
            src={product.image_url}
            alt={product.name}
            fallback={FALLBACK_IMAGE}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        )}

        {product.video_url && (
          <button
            type="button"
            onClick={handleToggle}
            aria-label={isPlaying ? "Pause product video" : "Play product video"}
            className="absolute left-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full border border-transparent bg-white/80 text-rose-500 shadow-sm backdrop-blur transition hover:bg-white sm:left-2 sm:top-2 sm:h-9 sm:w-9"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" fill="currentColor" aria-hidden="true" />
            ) : (
              <Play className="h-4 w-4" fill="currentColor" aria-hidden="true" />
            )}
          </button>
        )}

        <WishlistButton
          product={product}
          className="absolute right-1.5 top-1.5 h-7 w-7 shadow-sm sm:right-2 sm:top-2 sm:h-9 sm:w-9"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 border-t border-stone-100 p-3 sm:gap-1.5 sm:p-5">
        <span className="hidden text-xs font-medium text-rose-600 sm:block">
          {formatCategory(product.category)}
        </span>
        <h3 className="line-clamp-1 text-sm font-semibold text-stone-800 sm:text-lg">
          {product.name}
        </h3>
        <p className="line-clamp-2 hidden flex-1 text-sm text-stone-500 sm:block">
          {product.description}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-1.5 sm:flex-col sm:items-stretch sm:gap-2 sm:pt-3">
          <span className="text-sm font-bold text-stone-900 sm:text-xl">
            AED {product.price}
          </span>
          <WhatsAppButton
            product={product}
            size="sm"
            compact
            className="sm:w-full sm:justify-center"
          />
        </div>
      </div>
    </Link>
  );
}

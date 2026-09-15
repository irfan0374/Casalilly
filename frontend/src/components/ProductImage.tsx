import { useEffect, useRef, useState } from "react";

interface ProductImageProps {
  src: string | null | undefined;
  alt: string;
  fallback: string;
  className?: string;
  draggable?: boolean;
  loading?: "lazy" | "eager";
}

/** Product photo with a pulsing skeleton shown until it finishes loading (or
 * falls back). Must sit inside a `relative` container — the skeleton and
 * image both fill it via `absolute inset-0` / a full-size <img>. */
export default function ProductImage({
  src,
  alt,
  fallback,
  className = "",
  draggable = true,
  loading = "lazy",
}: ProductImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // A cached image can finish loading before this effect (and the
    // onLoad handler below) even attaches — check synchronously on mount
    // and whenever the source changes, or the skeleton gets stuck forever.
    setLoaded(Boolean(imgRef.current?.complete && imgRef.current.naturalWidth > 0));
  }, [src]);

  return (
    <>
      {!loaded && (
        <div
          className="absolute inset-0 animate-pulse bg-rose-100"
          aria-hidden="true"
        />
      )}
      <img
        ref={imgRef}
        src={src || fallback}
        alt={alt}
        draggable={draggable}
        loading={loading}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          setLoaded(true);
          (e.target as HTMLImageElement).src = fallback;
        }}
        className={`${className} transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </>
  );
}

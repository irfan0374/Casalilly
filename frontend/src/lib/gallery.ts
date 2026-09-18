import type { Product } from "../types";

export interface GalleryItem {
  url: string;
  type: "image" | "video";
}

/** Combines the cover image, up to 3 extra images (capped at 4 photos total),
 * and the product video (if any, always last) into a single typed gallery —
 * the video isn't counted against the 4-photo cap since it's a separate,
 * single-slot asset. */
export function productGallery(
  product: Pick<Product, "image_url" | "extra_image_urls" | "video_url">
): GalleryItem[] {
  const images: GalleryItem[] = [product.image_url, ...(product.extra_image_urls ?? [])]
    .filter((url): url is string => Boolean(url))
    .slice(0, 4)
    .map((url) => ({ url, type: "image" as const }));

  if (product.video_url) {
    images.push({ url: product.video_url, type: "video" });
  }

  return images;
}

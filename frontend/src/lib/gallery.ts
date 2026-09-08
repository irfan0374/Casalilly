import type { Product } from "../types";

/** Combines the cover image and up to 3 extra images into a single gallery, capped at 4. */
export function productGallery(
  product: Pick<Product, "image_url" | "extra_image_urls">
): string[] {
  const images = [product.image_url, ...(product.extra_image_urls ?? [])];
  return images.filter((url): url is string => Boolean(url)).slice(0, 4);
}

export type ProductCategory =
  | "flowers"
  | "bouquets"
  | "gift_baskets"
  | "anniversary"
  | "chocolate"
  | "plants"
  | "other";

export interface Product {
  id: number | string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory | string;
  image_url: string | null;
  extra_image_urls: string[] | null;
  video_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  extra_image_urls: string[];
  video_url: string | null;
  is_active: boolean;
  is_featured: boolean;
}

export interface SiteSettings {
  about_heading: string | null;
  about_body: string | null;
}

export interface SiteSettingsInput {
  about_heading?: string | null;
  about_body?: string | null;
}

export interface HeroSlide {
  id: number;
  image_url: string;
  image_public_id: string | null;
  heading: string | null;
  subheading: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string | null;
}

export interface HeroSlideInput {
  image_url: string | null;
  image_public_id?: string | null;
  heading: string | null;
  subheading: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface UploadResponse {
  url: string;
  public_id: string;
}

/** Short-lived credentials for uploading a file straight from the browser
 * to Cloudinary, bypassing our backend as a relay. */
export interface VideoUploadSignature {
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
  folder: string;
}

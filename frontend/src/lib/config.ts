/** Shop-wide settings read from the Vite env, in one place so every page
 * falls back to the same values when a variable isn't set. */

// The shop's real WhatsApp number — a fallback for when VITE_WHATSAPP_NUMBER
// is missing, so enquiry links still reach the shop instead of a dummy number.
export const SHOP_PHONE: string =
  import.meta.env.VITE_WHATSAPP_NUMBER || "+971586569933";

// The backend's public URL — product links in WhatsApp messages point at its
// crawler-facing /product/{id} route (see lib/whatsapp.ts).
export const SITE_BASE_URL: string =
  import.meta.env.VITE_SITE_BASE_URL || "http://localhost:8000";

// Shown on the About page when the admin hasn't set their own text (and as
// placeholders in the admin's About editor).
export const DEFAULT_ABOUT_HEADING = "Casalily Flowers & Plants";
export const DEFAULT_ABOUT_BODY =
  "Casalily Boutique merges premium botanicals with elite craftsmanship, delivering sophisticated floral experiences for every space.";

// Boutique contact details — shown in the footer, the homepage's "Visit our
// boutique" section and the About page.
export const SHOP_ADDRESS = "Mubarak Al Mansoori Building, Arjan, Al Barsha 3, Dubai";
export const SHOP_LANDLINE = "04 426 9933";
export const SHOP_MOBILE_DISPLAY = "058 656 9933";
export const INSTAGRAM_HANDLE = "casalily26";

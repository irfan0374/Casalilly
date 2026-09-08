import {
  Flower2,
  FlowerIcon,
  Gift,
  Sprout,
  Gem,
  Candy,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import flowerImg from "../assets/Category/flower_category_icon.png";
import bouquetImg from "../assets/Category/flower_bouquet_category_icon.png";
import giftBasketImg from "../assets/Category/gift_basket_category_icon.png";
import plantImg from "../assets/Category/plant_category_icon.png";
import anniversaryImg from "../assets/Category/anniversary_category_icon.png";
import chocolateImg from "../assets/Category/chocolate_category_icon.png";

const CATEGORY_IMAGES: Record<string, string> = {
  flowers: flowerImg,
  bouquets: bouquetImg,
  gift_baskets: giftBasketImg,
  plants: plantImg,
  anniversary: anniversaryImg,
  chocolate: chocolateImg,
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  flowers: Flower2,
  bouquets: FlowerIcon,
  gift_baskets: Gift,
  plants: Sprout,
  anniversary: Gem,
  chocolate: Candy,
  other: Sparkles,
};

/** Photo for a category tile, if one's been provided. Falls back to null so
 * callers can drop back to the icon (e.g. "other" has no photo yet). */
export function categoryImage(category: string): string | null {
  return CATEGORY_IMAGES[category] ?? null;
}

export function categoryIcon(category: string): LucideIcon {
  return CATEGORY_ICONS[category] ?? Sparkles;
}

export function formatCategory(category: string): string {
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

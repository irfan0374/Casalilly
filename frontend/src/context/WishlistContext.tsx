import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "../types";

const STORAGE_KEY = "casalilly_wishlist";

export interface WishlistItem {
  product: Product;
  quantity: number;
}

interface WishlistContextValue {
  items: WishlistItem[];
  isWishlisted: (id: Product["id"]) => boolean;
  toggle: (product: Product) => void;
  remove: (id: Product["id"]) => void;
  setQuantity: (id: Product["id"], quantity: number) => void;
  clear: () => void;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(
  undefined
);

function loadInitial(): WishlistItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return [];
    // Migrate from the earlier format (a plain array of products, no quantity).
    if (!("quantity" in parsed[0])) {
      return (parsed as Product[]).map((product) => ({
        product,
        quantity: 1,
      }));
    }
    return parsed as WishlistItem[];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>(loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // localStorage unavailable (e.g. private browsing) — wishlist just won't persist.
    }
  }, [items]);

  function isWishlisted(id: Product["id"]): boolean {
    return items.some((item) => String(item.product.id) === String(id));
  }

  function toggle(product: Product) {
    setItems((prev) =>
      prev.some((item) => String(item.product.id) === String(product.id))
        ? prev.filter((item) => String(item.product.id) !== String(product.id))
        : [...prev, { product, quantity: 1 }]
    );
  }

  function remove(id: Product["id"]) {
    setItems((prev) =>
      prev.filter((item) => String(item.product.id) !== String(id))
    );
  }

  function setQuantity(id: Product["id"], quantity: number) {
    setItems((prev) =>
      prev.map((item) =>
        String(item.product.id) === String(id)
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  }

  function clear() {
    setItems([]);
  }

  return (
    <WishlistContext.Provider
      value={{ items, isWishlisted, toggle, remove, setQuantity, clear }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}

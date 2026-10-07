import { useCallback, useEffect, useState } from "react";
import { adminListProducts } from "../api/products";
import { useAuth } from "../context/AuthContext";
import type { Product } from "../types";

/** The full admin catalog (including hidden products), plus a setter so a
 * page can apply its own edits optimistically without refetching. */
export function useAdminProducts() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    adminListProducts(token)
      .then(setProducts)
      .catch(() => setError("Couldn't load products. Check your connection and try again."))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(reload, [reload]);

  return { products, setProducts, loading, error, reload };
}

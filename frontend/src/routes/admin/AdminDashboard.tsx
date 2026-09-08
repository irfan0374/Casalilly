import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminListProducts, deleteProduct } from "../../api/products";
import ProductTable from "../../components/admin/ProductTable";
import { useAuth } from "../../context/AuthContext";
import type { Product } from "../../types";

export default function AdminDashboard() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<Product["id"] | null>(null);

  function loadProducts() {
    if (!token) return;
    setLoading(true);
    setError(null);
    adminListProducts(token)
      .then(setProducts)
      .catch(() => setError("Couldn't load products."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadProducts();
  }, [token]);

  async function handleDelete(id: Product["id"]) {
    if (!token) return;
    if (!window.confirm("Delete this product? This cannot be undone.")) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteProduct(id, token);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      window.alert("Failed to delete product.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Products</h1>
          <p className="text-sm text-stone-500">
            Manage the Casa Lilly product catalog.
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
        >
          + Add Product
        </Link>
      </div>

      {loading && (
        <p className="py-16 text-center text-stone-400">Loading…</p>
      )}
      {!loading && error && (
        <p className="py-16 text-center text-red-500">{error}</p>
      )}
      {!loading && !error && products.length === 0 && (
        <p className="py-16 text-center text-stone-400">
          No products yet. Add your first one.
        </p>
      )}
      {!loading && !error && products.length > 0 && (
        <ProductTable
          products={products}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      )}
    </div>
  );
}

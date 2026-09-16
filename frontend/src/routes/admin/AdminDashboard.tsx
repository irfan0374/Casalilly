import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { adminListProducts, deleteProduct, getCategories } from "../../api/products";
import AdminTableSkeleton from "../../components/admin/AdminTableSkeleton";
import ProductTable from "../../components/admin/ProductTable";
import { formatCategory } from "../../lib/categories";
import { useAuth } from "../../context/AuthContext";
import type { Product } from "../../types";

const PAGE_SIZE = 10;

export default function AdminDashboard() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<Product["id"] | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);

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

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesSearch = !q || p.name.toLowerCase().includes(q);
      const matchesCategory = !categoryFilter || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  // Jump back to page 1 whenever the filters change so the user never lands
  // on a now-empty page.
  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page_ = Math.min(page, totalPages);
  const paged = filtered.slice((page_ - 1) * PAGE_SIZE, page_ * PAGE_SIZE);

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

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
            strokeWidth={2}
            aria-hidden="true"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name…"
            className="w-full rounded-lg border border-stone-200 py-2 pl-9 pr-3 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400 sm:w-52"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {formatCategory(category)}
            </option>
          ))}
        </select>
      </div>

      {loading && <AdminTableSkeleton columns={7} rows={8} />}
      {!loading && error && (
        <p className="py-16 text-center text-red-500">{error}</p>
      )}
      {!loading && !error && products.length === 0 && (
        <p className="py-16 text-center text-stone-400">
          No products yet. Add your first one.
        </p>
      )}
      {!loading && !error && products.length > 0 && filtered.length === 0 && (
        <p className="py-16 text-center text-stone-400">
          No products match your search or filter.
        </p>
      )}
      {!loading && !error && filtered.length > 0 && (
        <>
          <ProductTable
            products={paged}
            onDelete={handleDelete}
            deletingId={deletingId}
          />

          {totalPages > 1 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-stone-500">
                Page {page_} of {totalPages} · {filtered.length} products
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page_ === 1}
                  className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm font-medium text-stone-600 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page_ === totalPages}
                  className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm font-medium text-stone-600 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

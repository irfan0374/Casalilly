import { Link } from "react-router-dom";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import type { Product } from "../../types";

interface ProductTableProps {
  products: Product[];
  onDelete: (id: Product["id"]) => void;
  deletingId: Product["id"] | null;
  onToggleActive: (product: Product) => void;
  togglingId: Product["id"] | null;
}

export default function ProductTable({
  products,
  onDelete,
  deletingId,
  onToggleActive,
  togglingId,
}: ProductTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-rose-100">
      <table className="min-w-full divide-y divide-rose-100 text-sm">
        <thead className="bg-rose-50 text-left text-stone-500">
          <tr>
            <th className="px-4 py-3 font-medium">Image</th>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Price</th>
            <th className="px-4 py-3 font-medium">Active</th>
            <th className="px-4 py-3 font-medium">Featured</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-rose-50 bg-white">
          {products.map((product) => (
            <tr key={product.id}>
              <td className="px-4 py-3">
                <div className="h-12 w-12 overflow-hidden rounded-lg bg-rose-50">
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              </td>
              <td className="px-4 py-3 font-medium text-stone-800">
                {product.name}
              </td>
              <td className="px-4 py-3 text-stone-500">{product.category}</td>
              <td className="px-4 py-3 text-stone-500">AED {product.price}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    product.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-stone-100 text-stone-500"
                  }`}
                >
                  {product.is_active ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-4 py-3">
                {product.is_featured && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                    ★ Featured
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => onToggleActive(product)}
                    disabled={togglingId === product.id}
                    aria-label={product.is_active ? "Disable product" : "Activate product"}
                    title={product.is_active ? "Disable" : "Activate"}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 transition hover:bg-stone-100 disabled:opacity-50"
                  >
                    {product.is_active ? (
                      <Eye className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                    ) : (
                      <EyeOff className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                    )}
                  </button>
                  <Link
                    to={`/admin/products/${product.id}/edit`}
                    aria-label="Edit product"
                    title="Edit"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-600 transition hover:bg-rose-50"
                  >
                    <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => onDelete(product.id)}
                    disabled={deletingId === product.id}
                    aria-label="Delete product"
                    title="Delete"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

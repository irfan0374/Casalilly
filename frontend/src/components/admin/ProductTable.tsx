import { Link } from "react-router-dom";
import { CircleAlert, Ellipsis, Loader2, Pencil, Play, Star, Trash2, Video } from "lucide-react";
import type { Product } from "../../types";
import { formatCategory } from "../../lib/categories";
import { formatPrice } from "../../lib/format";
import { useVideoJobForProduct, type VideoJob } from "../../lib/videoUploadManager";
import { Pill } from "./ui/Chip";
import { Toggle } from "./ui/Toggle";

export interface ProductRowActions {
  onToggleActive: (product: Product) => void;
  onToggleFeatured: (product: Product) => void;
  onMore: (product: Product) => void;
  onDelete: (product: Product) => void;
  busyId: Product["id"] | null;
}

function categoryLabel(product: Product): string {
  const categories = product.categories?.length ? product.categories : [product.category];
  const extra = categories.length - 1;
  return formatCategory(categories[0]) + (extra > 0 ? ` +${extra}` : "");
}

function videoJobLabel(job: VideoJob): string {
  if (job.status === "compressing") return `Compressing video ${job.progress}%`;
  if (job.status === "attaching") return "Attaching video…";
  return `Uploading video ${job.progress}%`;
}

/** Mobile list item: thumbnail, name, price, visibility switch and "⋯" menu. */
export function ProductCard({ product, ...actions }: { product: Product } & ProductRowActions) {
  const job = useVideoJobForProduct(product.id);
  const running = job && job.status !== "done" && job.status !== "error";

  return (
    <div
      className={`rounded-3xl bg-white p-3 shadow-sm ring-1 ring-stone-100 ${
        product.is_active ? "" : "bg-white/70"
      }`}
    >
      <div className="flex items-center gap-3">
        <Link
          to={`/admin/products/${product.id}/edit`}
          className="flex min-w-0 flex-1 items-center gap-3"
        >
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-stone-100">
            {product.image_url && (
              <img
                src={product.image_url}
                alt=""
                loading="lazy"
                className={`h-full w-full object-cover ${product.is_active ? "" : "opacity-60 grayscale-[40%]"}`}
              />
            )}
            {product.video_url && (
              <span className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white">
                <Play className="h-3 w-3" fill="currentColor" aria-label="Has video" />
              </span>
            )}
            {!product.is_active && (
              <span className="absolute left-1 top-1 rounded-md bg-stone-900/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                Hidden
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            {product.is_featured && (
              <span className="mb-1 inline-flex">
                <Pill tone="amber">
                  <Star className="h-3 w-3" fill="currentColor" aria-hidden="true" />
                  Best Seller
                </Pill>
              </span>
            )}
            <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-stone-400">
              {categoryLabel(product)}
            </p>
            <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-stone-900">{product.name}</p>
            <p className="font-semibold text-rose-700">{formatPrice(product.price)}</p>
          </div>
        </Link>
        <div className="flex flex-shrink-0 items-center gap-1">
          <Toggle
            checked={product.is_active}
            onChange={() => actions.onToggleActive(product)}
            disabled={actions.busyId === product.id}
            label={product.is_active ? `Hide ${product.name} from shop` : `Show ${product.name} in shop`}
          />
          <button
            type="button"
            onClick={() => actions.onMore(product)}
            aria-label={`More actions for ${product.name}`}
            className="flex h-11 w-9 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-100"
          >
            <Ellipsis className="h-5 w-5 rotate-90" aria-hidden="true" />
          </button>
        </div>
      </div>

      {running && job && (
        <div className="mt-3 border-t border-stone-100 px-1 pt-3">
          <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-stone-600">
            <span className="flex items-center gap-1.5">
              <Video className="h-4 w-4 text-rose-600" aria-hidden="true" />
              {videoJobLabel(job)}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-rose-100">
            <div className="h-full rounded-full bg-rose-600 transition-all" style={{ width: `${job.progress}%` }} />
          </div>
        </div>
      )}
      {job?.status === "error" && (
        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <CircleAlert className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span className="flex-1">Video upload failed</span>
          <Link to={`/admin/products/${product.id}/edit`} className="font-semibold underline">
            Try again
          </Link>
        </div>
      )}
    </div>
  );
}

/** Desktop table. */
export function ProductTable({
  products,
  ...actions
}: { products: Product[] } & ProductRowActions) {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-stone-100">
      <table className="w-full text-sm">
        <thead className="bg-stone-50 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">
          <tr>
            <th className="px-5 py-3.5">Product</th>
            <th className="px-3 py-3.5">Category</th>
            <th className="px-3 py-3.5 text-right">Price</th>
            <th className="px-3 py-3.5 text-center">Visible</th>
            <th className="px-3 py-3.5 text-center">Best Seller</th>
            <th className="px-3 py-3.5">Video</th>
            <th className="px-5 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {products.map((product) => (
            <TableRow key={product.id} product={product} {...actions} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableRow({ product, ...actions }: { product: Product } & ProductRowActions) {
  const job = useVideoJobForProduct(product.id);
  const busy = actions.busyId === product.id;

  return (
    <tr className={product.is_active ? "" : "bg-stone-50/60"}>
      <td className="px-5 py-3">
        <Link to={`/admin/products/${product.id}/edit`} className="flex items-center gap-3">
          <img
            src={product.image_url ?? undefined}
            alt=""
            loading="lazy"
            className={`h-14 w-14 flex-shrink-0 rounded-xl bg-stone-100 object-cover ${product.is_active ? "" : "opacity-60"}`}
          />
          <span className="font-semibold text-stone-900 hover:text-rose-700">{product.name}</span>
        </Link>
      </td>
      <td className="px-3 py-3">
        <div className="flex flex-wrap gap-1">
          {(product.categories?.length ? product.categories : [product.category]).map((c) => (
            <Pill key={c} tone="stone">
              {formatCategory(c)}
            </Pill>
          ))}
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-3 text-right font-semibold text-stone-900">
        {formatPrice(product.price)}
      </td>
      <td className="px-3 py-3 text-center">
        <Toggle
          checked={product.is_active}
          onChange={() => actions.onToggleActive(product)}
          disabled={busy}
          label={product.is_active ? `Hide ${product.name} from shop` : `Show ${product.name} in shop`}
        />
      </td>
      <td className="px-3 py-3 text-center">
        <button
          type="button"
          onClick={() => actions.onToggleFeatured(product)}
          disabled={busy}
          aria-pressed={product.is_featured}
          aria-label={product.is_featured ? "Remove from Best Sellers" : "Mark as Best Seller"}
          title={product.is_featured ? "Remove from Best Sellers" : "Mark as Best Seller"}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-amber-50 disabled:opacity-50"
        >
          <Star
            className={`h-5 w-5 ${product.is_featured ? "text-amber-500" : "text-stone-300"}`}
            fill={product.is_featured ? "currentColor" : "none"}
            aria-hidden="true"
          />
        </button>
      </td>
      <td className="px-3 py-3">
        <VideoStatus product={product} job={job} />
      </td>
      <td className="px-5 py-3">
        <div className="flex justify-end gap-1">
          <Link
            to={`/admin/products/${product.id}/edit`}
            aria-label={`Edit ${product.name}`}
            title="Edit"
            className="flex h-9 w-9 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-100 hover:text-rose-700"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={() => actions.onDelete(product)}
            disabled={busy}
            aria-label={`Delete ${product.name}`}
            title="Delete"
            className="flex h-9 w-9 items-center justify-center rounded-full text-stone-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function VideoStatus({ product, job }: { product: Product; job?: VideoJob }) {
  if (job && job.status === "error") {
    return (
      <span title={job.error}>
        <Pill tone="red">
          <CircleAlert className="h-3 w-3" aria-hidden="true" />
          Upload failed
        </Pill>
      </span>
    );
  }
  if (job && job.status !== "done") {
    return (
      <div className="w-32">
        <p className="mb-1 flex items-center gap-1 text-xs font-medium text-stone-600">
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
          {job.status === "compressing" ? "Compressing" : "Uploading"} {job.progress}%
        </p>
        <div className="h-1.5 overflow-hidden rounded-full bg-rose-100">
          <div className="h-full rounded-full bg-rose-600" style={{ width: `${job.progress}%` }} />
        </div>
      </div>
    );
  }
  // A job that just finished attached its video after this list loaded.
  if (product.video_url || job?.status === "done") return <Pill tone="green" dot>Ready</Pill>;
  return <span className="text-stone-300">—</span>;
}

/** Compact product summary, e.g. inside the delete confirmation. */
export function ProductPreview({ product }: { product: Pick<Product, "name" | "price" | "image_url" | "category"> }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-stone-50 p-3">
      <img
        src={product.image_url ?? undefined}
        alt=""
        className="h-16 w-16 flex-shrink-0 rounded-xl bg-stone-200 object-cover"
      />
      <div className="min-w-0">
        <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-stone-900">{product.name}</p>
        <p className="text-sm text-stone-500">{formatCategory(product.category)}</p>
        <p className="font-semibold text-rose-700">{formatPrice(product.price)}</p>
      </div>
    </div>
  );
}

import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Archive,
  BookOpen,
  ChevronRight,
  ExternalLink,
  EyeOff,
  GalleryHorizontal,
  Loader2,
  Plus,
  Star,
  Store,
  type LucideIcon,
} from "lucide-react";
import { buttonClass, LinkButton } from "../../components/admin/ui/Button";
import { Pill } from "../../components/admin/ui/Chip";
import { ErrorState } from "../../components/admin/ui/Layout";
import { formatCategory } from "../../lib/categories";
import { formatPrice, greeting } from "../../lib/format";
import { useAdminProducts } from "../../lib/useAdminProducts";
import { useVideoJobs, type VideoJob } from "../../lib/videoUploadManager";
import type { Product } from "../../types";

interface Stat {
  label: string;
  value: number;
  icon: LucideIcon;
  to: string;
  tag: React.ReactNode;
}

export default function AdminDashboard() {
  const { products, loading, error, reload } = useAdminProducts();
  const videoJobs = useVideoJobs();

  const stats: Stat[] = useMemo(() => {
    const active = products.filter((p) => p.is_active).length;
    return [
      { label: "Total products", value: products.length, icon: Archive, to: "/admin/products", tag: <Pill tone="stone">Catalog</Pill> },
      { label: "Active in shop", value: active, icon: Store, to: "/admin/products?status=active", tag: <Pill tone="green" dot>Live</Pill> },
      { label: "Hidden", value: products.length - active, icon: EyeOff, to: "/admin/products?status=hidden", tag: <Pill tone="stone">Hidden</Pill> },
      { label: "Best Sellers", value: products.filter((p) => p.is_featured).length, icon: Star, to: "/admin/products?status=featured", tag: <Pill tone="amber">Featured</Pill> },
    ];
  }, [products]);

  // The API already returns newest first.
  const recent = products.slice(0, 3);
  const runningJobs = [...videoJobs.values()].filter((job) => job.status !== "done");
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-stone-500">{today}</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-stone-900 lg:text-4xl">
            {greeting()} <span aria-hidden="true">🌸</span>
          </h1>
        </div>
        <div className="hidden gap-3 lg:flex">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass("secondary")}
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            View Website
          </a>
          <LinkButton to="/admin/products/new" icon={<Plus className="h-4 w-4" aria-hidden="true" />}>
            Add Product
          </LinkButton>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={reload} />}

      {!error && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            {stats.map(({ label, value, icon: Icon, to, tag }) => (
              <Link
                key={label}
                to={to}
                className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-stone-100 transition hover:ring-rose-200 sm:p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <Icon className="h-5 w-5 text-stone-500" strokeWidth={1.75} aria-hidden="true" />
                  {tag}
                </div>
                {loading ? (
                  <span className="mt-4 block h-9 w-12 animate-pulse rounded-lg bg-stone-100" />
                ) : (
                  <p className="mt-4 font-display text-4xl font-bold text-stone-900">{value}</p>
                )}
                <p className="mt-1 text-sm text-stone-500">{label}</p>
              </Link>
            ))}
          </div>

          <LinkButton
            to="/admin/products/new"
            size="lg"
            className="mt-5 w-full lg:hidden"
            icon={<Plus className="h-5 w-5" aria-hidden="true" />}
          >
            Add Product
          </LinkButton>

          <div className="mt-3 grid grid-cols-3 gap-3 lg:mt-5 lg:max-w-xl">
            <QuickAction to="/admin/hero-slides/new" icon={GalleryHorizontal} label="Banner" />
            <QuickAction to="/admin/about" icon={BookOpen} label="About" />
            <QuickAction href="/" icon={ExternalLink} label="Website" />
          </div>

          {runningJobs.length > 0 && (
            <div className="mt-5 flex flex-col gap-3">
              {runningJobs.map((job) => (
                <UploadCard
                  key={job.token}
                  job={job}
                  product={products.find((p) => String(p.id) === String(job.productId))}
                />
              ))}
            </div>
          )}

          <section className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold text-stone-900">Recently added</h2>
              <Link
                to="/admin/products"
                className="flex items-center gap-0.5 text-sm font-semibold text-rose-700"
              >
                View all
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            {loading ? (
              <div className="flex flex-col gap-3 lg:grid lg:grid-cols-3 lg:gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded-2xl bg-white ring-1 ring-stone-100 lg:h-72" />
                ))}
              </div>
            ) : recent.length === 0 ? (
              <p className="rounded-3xl bg-white p-6 text-center text-sm text-stone-500 ring-1 ring-stone-100">
                No products yet — tap <span className="font-semibold">Add Product</span> to create your first one.
              </p>
            ) : (
              <>
                <ul className="divide-y divide-stone-100 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-stone-100 lg:hidden">
                  {recent.map((product) => (
                    <li key={product.id}>
                      <RecentRow product={product} />
                    </li>
                  ))}
                </ul>
                <div className="hidden grid-cols-3 gap-4 lg:grid">
                  {recent.map((product) => (
                    <RecentCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function QuickAction({
  to,
  href,
  icon: Icon,
  label,
}: {
  to?: string;
  href?: string;
  icon: LucideIcon;
  label: string;
}) {
  const className =
    "flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-white py-4 text-sm font-medium text-stone-700 shadow-sm ring-1 ring-stone-100 transition hover:bg-rose-50 hover:text-rose-700";
  const content = (
    <>
      <Icon className="h-5 w-5 text-rose-600" strokeWidth={1.75} aria-hidden="true" />
      {label}
    </>
  );
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {content}
    </a>
  ) : (
    <Link to={to!} className={className}>
      {content}
    </Link>
  );
}

function StatusPills({ product }: { product: Product }) {
  return (
    <>
      {product.is_active ? <Pill tone="green">Active</Pill> : <Pill tone="stone">Hidden</Pill>}
      {product.is_featured && (
        <Pill tone="amber">
          <Star className="h-3 w-3" fill="currentColor" aria-hidden="true" />
          Best Seller
        </Pill>
      )}
    </>
  );
}

function RecentRow({ product }: { product: Product }) {
  return (
    <Link
      to={`/admin/products/${product.id}/edit`}
      className="flex items-center gap-3 p-3 transition hover:bg-stone-50"
    >
      <img
        src={product.image_url ?? undefined}
        alt=""
        className="h-16 w-16 flex-shrink-0 rounded-2xl bg-stone-100 object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-stone-900">{product.name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-sm text-stone-500">{formatPrice(product.price)}</span>
          <StatusPills product={product} />
        </div>
      </div>
      <ChevronRight className="h-5 w-5 flex-shrink-0 text-stone-300" aria-hidden="true" />
    </Link>
  );
}

function RecentCard({ product }: { product: Product }) {
  return (
    <Link
      to={`/admin/products/${product.id}/edit`}
      className="group overflow-hidden rounded-3xl bg-white p-3 shadow-sm ring-1 ring-stone-100 transition hover:ring-rose-200"
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-stone-100">
        <img
          src={product.image_url ?? undefined}
          alt=""
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-2 top-2 flex gap-1.5">
          <StatusPills product={product} />
        </div>
      </div>
      <div className="px-1 pb-1 pt-3">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
            {formatCategory(product.category)}
          </p>
          <p className="font-semibold text-stone-900">{formatPrice(product.price)}</p>
        </div>
        <p className="mt-1 truncate font-display text-lg font-semibold text-stone-900">
          {product.name}
        </p>
      </div>
    </Link>
  );
}

function UploadCard({ job, product }: { job: VideoJob; product?: Product }) {
  const failed = job.status === "error";
  const label = failed
    ? "Video upload failed"
    : job.status === "compressing"
      ? `Compressing video… ${job.progress}%`
      : job.status === "attaching"
        ? "Attaching video…"
        : `Uploading video… ${job.progress}%`;

  return (
    <div className="flex items-center gap-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-stone-100">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-rose-50">
        {product?.image_url ? (
          <img src={product.image_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <Loader2 className="h-5 w-5 animate-spin text-rose-600" aria-hidden="true" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold ${failed ? "text-red-700" : "text-stone-900"}`}>
          {label}
        </p>
        <p className="truncate text-xs text-stone-500">
          {failed ? job.error : (product?.name ?? "New product")}
        </p>
        {!failed && (
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-rose-100">
            <div
              className="h-full rounded-full bg-rose-600 transition-all"
              style={{ width: `${job.progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

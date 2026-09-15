import logo from "../assets/logo-180.png";

/** Placeholder matching ProductCard's exact layout, shown while the product
 * list itself is still loading (not just an individual image — see
 * ProductImage for that) so the page never shows a blank/plain "Loading…"
 * state. */
export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-rose-100 bg-white shadow-sm sm:rounded-2xl">
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-rose-50">
        <img src={logo} alt="" className="h-10 w-10 rounded-full object-cover opacity-40" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-2.5 sm:gap-2.5 sm:p-4">
        <div className="hidden h-5 w-20 animate-pulse rounded-full bg-rose-100 sm:block" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-rose-100 sm:h-5" />
        <div className="hidden h-3 w-full animate-pulse rounded bg-rose-100 sm:block" />
        <div className="hidden h-3 w-2/3 animate-pulse rounded bg-rose-100 sm:block" />
        <div className="mt-auto flex items-center justify-between gap-2 pt-1.5 sm:flex-col sm:items-stretch sm:gap-2 sm:pt-3">
          <div className="h-4 w-16 animate-pulse rounded bg-rose-100 sm:h-6 sm:w-20" />
          <div className="h-7 w-7 animate-pulse rounded-full bg-rose-100 sm:h-9 sm:w-full" />
        </div>
      </div>
    </div>
  );
}

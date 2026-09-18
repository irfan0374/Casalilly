import logo from "../assets/logo-180.png";

/** Placeholder matching ProductDetail's layout, shown while the product
 * itself is still loading, so the page never flashes a plain "Loading…"
 * text — mirrors ProductCardSkeleton's approach for the shop grid. */
export default function ProductDetailSkeleton() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-10 lg:max-w-6xl">
      <div className="relative lg:grid lg:grid-cols-2 lg:items-start lg:gap-10">
        <div className="flex flex-col-reverse gap-3 lg:flex-row">
          <div className="flex gap-3 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-16 w-16 shrink-0 animate-pulse rounded-xl bg-rose-100 lg:h-20 lg:w-20"
              />
            ))}
          </div>

          <div className="relative flex aspect-[4/5] w-full flex-1 items-center justify-center overflow-hidden rounded-3xl bg-rose-50 sm:aspect-[16/10] lg:aspect-[4/5]">
            <img src={logo} alt="" className="h-12 w-12 rounded-full object-cover opacity-40" />
          </div>
        </div>

        <div className="relative z-10 mt-3 rounded-3xl bg-white p-6 shadow-xl shadow-rose-100 sm:mx-6 sm:p-8 lg:mx-0 lg:mt-0 lg:p-0 lg:shadow-none">
          <div className="h-6 w-24 animate-pulse rounded-full bg-rose-100" />
          <div className="mt-3 h-8 w-3/4 animate-pulse rounded bg-rose-100 sm:h-9" />
          <div className="mt-4 space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-rose-100" />
            <div className="h-4 w-full animate-pulse rounded bg-rose-100" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-rose-100" />
          </div>

          <div className="mt-6 flex items-center justify-between gap-4 border-t border-rose-100 pt-6 lg:mt-8">
            <div className="h-8 w-20 animate-pulse rounded bg-rose-100" />
            <div className="h-11 w-36 animate-pulse rounded-full bg-rose-100" />
          </div>
        </div>
      </div>
    </main>
  );
}

import { formatCategory } from "../../lib/categories";

/** Pill tabs for switching a homepage product section between categories. */
export function CategoryTabs({
  categories,
  active,
  onSelect,
  labels = {},
}: {
  categories: string[];
  active: string | null;
  onSelect: (category: string) => void;
  /** Per-section label overrides, e.g. plants → "Indoor plants". */
  labels?: Record<string, string>;
}) {
  return (
    <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0" role="tablist">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          role="tab"
          aria-selected={active === category}
          onClick={() => onSelect(category)}
          className={`h-10 flex-shrink-0 whitespace-nowrap rounded-full px-4 text-sm font-medium transition ${
            active === category
              ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
              : "bg-white text-stone-600 ring-1 ring-stone-200 hover:text-stone-900"
          }`}
        >
          {labels[category] ?? formatCategory(category)}
        </button>
      ))}
    </div>
  );
}

/** Placeholder cards while a section's products load. */
export function ProductCardSkeletonRow() {
  return (
    <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={`rounded-3xl bg-white p-2.5 ring-1 ring-stone-100 ${i >= 2 ? "hidden md:block" : ""}`}>
          <div className="aspect-[4/5] animate-pulse rounded-2xl bg-stone-100" />
          <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-stone-100" />
          <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-stone-100" />
        </div>
      ))}
    </div>
  );
}

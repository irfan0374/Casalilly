import { formatCategory } from "../lib/categories";

interface CategoryFilterProps {
  categories: string[];
  selected: string | null;
  onSelect: (category: string | null) => void;
}

export default function CategoryFilter({
  categories,
  selected,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
          selected === null
            ? "border-rose-600 bg-rose-600 text-white"
            : "border-rose-200 bg-white text-stone-600 hover:border-rose-400 hover:text-rose-600"
        }`}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onSelect(category)}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
            selected === category
              ? "border-rose-600 bg-rose-600 text-white"
              : "border-rose-200 bg-white text-stone-600 hover:border-rose-400 hover:text-rose-600"
          }`}
        >
          {formatCategory(category)}
        </button>
      ))}
    </div>
  );
}

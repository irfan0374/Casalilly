import type { ReactNode } from "react";
import { Check } from "lucide-react";

interface ChipProps {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  /** Shows a check mark when selected — for multi-select pickers. */
  checkable?: boolean;
  size?: "sm" | "md";
}

/** Rounded pill used for filters and pickers. */
export function Chip({ selected, onClick, children, checkable, size = "md" }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`inline-flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border font-medium transition ${
        size === "sm" ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm"
      } ${
        selected
          ? "border-rose-600 bg-rose-600 text-white"
          : "border-stone-200 bg-white text-stone-600 hover:border-rose-300 hover:text-rose-700"
      }`}
    >
      {checkable && selected && <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />}
      {children}
    </button>
  );
}

type PillTone = "green" | "stone" | "amber" | "rose" | "red";

const PILL_TONES: Record<PillTone, string> = {
  green: "bg-emerald-50 text-emerald-700",
  stone: "bg-stone-100 text-stone-500",
  amber: "bg-amber-50 text-amber-700",
  rose: "bg-rose-50 text-rose-700",
  red: "bg-red-50 text-red-700",
};

/** Small read-only status label ("Active", "Hidden", "Best Seller"…). */
export function Pill({
  tone,
  dot,
  children,
}: {
  tone: PillTone;
  dot?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${PILL_TONES[tone]}`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  /** "amber" for the Best Seller switch, so it reads differently from Visible. */
  tone?: "rose" | "amber";
}

/** iOS-style switch. `label` is for screen readers; visible text sits beside it. */
export function Toggle({ checked, onChange, label, disabled, tone = "rose" }: ToggleProps) {
  const on = tone === "amber" ? "bg-amber-500" : "bg-rose-600";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 disabled:opacity-50 ${
        checked ? on : "bg-stone-200"
      }`}
    >
      <span
        className={`inline-block h-6 w-6 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

interface ToggleRowProps extends ToggleProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

/** A full-width settings row: title + description on the left, switch on the right. */
export function ToggleRow({ title, description, icon, ...toggle }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-[15px] font-semibold text-stone-800">
          {title}
          {icon}
        </p>
        {description && <p className="mt-0.5 text-sm text-stone-500">{description}</p>}
      </div>
      <Toggle {...toggle} />
    </div>
  );
}

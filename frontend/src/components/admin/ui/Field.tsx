import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

const CONTROL =
  "w-full rounded-xl border bg-white px-4 text-[15px] text-stone-800 placeholder:text-stone-400 transition focus:outline-none focus:ring-2";

function controlClass(error?: string | null): string {
  return `${CONTROL} ${
    error
      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
      : "border-stone-200 focus:border-rose-400 focus:ring-rose-100"
  }`;
}

interface FieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  /** Shown on the right of the label row, e.g. a character counter. */
  aside?: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  children: ReactNode;
}

/** Label + control + hint/error, laid out the same way on every admin form. */
export function Field({ label, htmlFor, required, aside, hint, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-sm font-semibold text-stone-800">
          {label}
          {required && <span className="text-rose-600"> *</span>}
        </label>
        {aside && <span className="text-xs text-stone-400">{aside}</span>}
      </div>
      {children}
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-stone-500">{hint}</p>
      )}
    </div>
  );
}

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string | null;
  /** Rendered inside the field on the left, e.g. an icon or "AED". */
  leading?: ReactNode;
  /** Rendered inside the field on the right, e.g. a show-password button. */
  trailing?: ReactNode;
}

export function TextInput({ error, leading, trailing, className = "", ...rest }: TextInputProps) {
  return (
    <div className="relative">
      {leading && (
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-stone-400">
          {leading}
        </span>
      )}
      <input
        className={`${controlClass(error)} h-12 ${leading ? "pl-12" : ""} ${trailing ? "pr-12" : ""} ${className}`}
        aria-invalid={error ? true : undefined}
        {...rest}
      />
      {trailing && (
        <span className="absolute inset-y-0 right-2 flex items-center">{trailing}</span>
      )}
    </div>
  );
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string | null;
}

export function TextArea({ error, className = "", rows = 4, ...rest }: TextAreaProps) {
  return (
    <textarea
      rows={rows}
      className={`${controlClass(error)} py-3 leading-relaxed ${className}`}
      aria-invalid={error ? true : undefined}
      {...rest}
    />
  );
}

/** "24 / 255" — turns amber near the limit. */
export function CharCount({ value, max }: { value: string; max: number }) {
  const near = value.length > max * 0.9;
  return (
    <span className={near ? "text-amber-600" : undefined}>
      {value.length} / {max}
    </span>
  );
}

import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";

/** White rounded section card with an optional serif title. */
export function Card({
  title,
  subtitle,
  aside,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-3xl bg-white p-5 shadow-sm ring-1 ring-stone-100 sm:p-6 ${className}`}
    >
      {(title || aside) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && (
              <h2 className="font-display text-xl font-semibold text-stone-900">{title}</h2>
            )}
            {subtitle && <p className="mt-0.5 text-sm text-stone-500">{subtitle}</p>}
          </div>
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}

/** Big serif page title with an optional count badge and right-side action. */
export function PageHeader({
  title,
  badge,
  description,
  action,
}: {
  title: string;
  badge?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3 lg:mb-7">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-bold text-stone-900 lg:text-4xl">{title}</h1>
          {badge}
        </div>
        {description && <p className="mt-1.5 text-[15px] text-stone-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/** Top bar for full-screen form pages on mobile: back arrow + title.
 * On desktop it becomes a breadcrumb above a large title. */
export function FormHeader({
  title,
  backTo,
  backLabel,
}: {
  title: string;
  backTo: string;
  backLabel: string;
}) {
  const navigate = useNavigate();
  return (
    <>
      <div className="sticky top-0 z-30 -mx-4 mb-4 flex h-14 items-center gap-2 border-b border-stone-100 bg-white/90 px-2 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => navigate(backTo)}
          aria-label={`Back to ${backLabel}`}
          className="flex h-11 w-11 items-center justify-center rounded-full text-stone-700 transition hover:bg-stone-100"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
        </button>
        <h1 className="font-display text-xl font-semibold text-stone-900">{title}</h1>
      </div>
      <div className="mb-7 hidden lg:block">
        <p className="text-sm text-stone-500">
          <Link to={backTo} className="hover:text-rose-700">
            {backLabel}
          </Link>
          <span className="mx-2 text-stone-300">/</span>
          <span className="text-stone-700">{title}</span>
        </p>
        <h1 className="mt-1 font-display text-4xl font-bold text-stone-900">{title}</h1>
      </div>
    </>
  );
}

/** Floating round "+" button, mobile only — sits above the bottom tab bar. */
export function Fab({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      aria-label={label}
      className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg shadow-rose-600/30 transition hover:bg-rose-700 active:scale-95 lg:hidden"
    >
      <Plus className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
    </Link>
  );
}

/** Save/Cancel bar pinned to the bottom of the screen on form pages.
 * `aboveTabs` lifts it over the mobile bottom tab bar, for pages that keep
 * the tabs visible (full-screen add/edit pages hide them instead). */
export function StickyActions({ children, aboveTabs }: { children: ReactNode; aboveTabs?: boolean }) {
  return (
    <div
      className={`fixed inset-x-0 z-30 border-t border-stone-100 bg-white/95 px-4 pt-3 backdrop-blur lg:left-64 lg:bottom-0 lg:pb-3 ${
        aboveTabs
          ? "bottom-[calc(4rem+env(safe-area-inset-bottom))] pb-3"
          : "bottom-0 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-end gap-3 lg:px-6">{children}</div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-3xl bg-white px-6 py-12 text-center ring-1 ring-stone-100">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600">
        {icon}
      </div>
      <h2 className="font-display text-xl font-semibold text-stone-900">{title}</h2>
      {description && <p className="mt-1.5 max-w-sm text-sm text-stone-500">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-3xl bg-red-50 px-6 py-10 text-center ring-1 ring-red-100">
      <p className="text-red-700">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 text-sm font-semibold text-red-700 underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}

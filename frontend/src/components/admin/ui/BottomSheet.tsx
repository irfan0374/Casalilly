import { useEffect, useId, type ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { Button } from "./Button";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Blocks closing by backdrop tap / Escape (e.g. while a request runs). */
  dismissible?: boolean;
}

/** Slides up from the bottom on phones; a centered dialog from `sm` up. */
export function BottomSheet({ open, onClose, title, children, dismissible = true }: BottomSheetProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && dismissible) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, dismissible, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px]"
        onClick={dismissible ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-3 shadow-2xl sm:max-w-md sm:rounded-3xl sm:p-6"
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-stone-200 sm:hidden" aria-hidden="true" />
        {title && (
          <h2 id={titleId} className="mb-4 font-display text-2xl font-semibold text-stone-900">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}

interface ConfirmSheetProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
  /** Optional preview of the thing being acted on (e.g. a product row). */
  preview?: ReactNode;
}

/** Replaces window.confirm() for destructive actions. */
export function ConfirmSheet({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  busy,
  preview,
}: ConfirmSheetProps) {
  return (
    <BottomSheet open={open} onClose={onCancel} title={title} dismissible={!busy}>
      {preview && <div className="mb-4">{preview}</div>}
      <div className="mb-5 flex gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-800">
        <CircleAlert className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
        <p>{message}</p>
      </div>
      <div className="flex flex-col gap-2.5">
        <Button variant="danger" size="lg" onClick={onConfirm} loading={busy}>
          {confirmLabel}
        </Button>
        <Button variant="secondary" size="lg" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
      </div>
    </BottomSheet>
  );
}

interface ActionItem {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  danger?: boolean;
}

/** A list of tappable actions inside a bottom sheet (the "⋯" menu). */
export function ActionList({ actions }: { actions: ActionItem[] }) {
  return (
    <div className="flex flex-col">
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={action.onClick}
          className={`flex h-14 items-center gap-4 rounded-xl px-3 text-left text-[15px] font-medium transition hover:bg-stone-50 ${
            action.danger ? "text-red-600" : "text-stone-800"
          }`}
        >
          <span className={action.danger ? "text-red-500" : "text-stone-400"}>{action.icon}</span>
          {action.label}
        </button>
      ))}
    </div>
  );
}

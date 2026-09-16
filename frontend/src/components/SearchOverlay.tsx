import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, TrendingUp } from "lucide-react";

const TRENDING = [
  "flowers",
  "birthday gift",
  "anniversary gift",
  "new born gift",
  "bouquets",
  "chocolate",
];

/** Full-screen search — opened by tapping the hero's search bar. A real
 * text input, but on its own dedicated screen rather than inline in the
 * hero, and at a normal 16px+ size so focusing it never triggers the
 * mobile browser's automatic zoom. */
export default function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  function go(term: string) {
    const trimmed = term.trim();
    onClose();
    navigate(trimmed ? `/shop?search=${encodeURIComponent(trimmed)}` : "/shop");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    go(query);
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-b border-stone-100 px-3 py-3 sm:px-6"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close search"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-100"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
        </button>
        <div className="flex flex-1 items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-4 py-2.5 focus-within:border-rose-300">
          <Search className="h-4 w-4 flex-shrink-0 text-stone-400" strokeWidth={2} aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search flowers, gifts…"
            aria-label="Search products"
            className="w-full min-w-0 bg-transparent text-base text-stone-800 placeholder:text-stone-400 focus:outline-none"
          />
        </div>
      </form>

      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-xl">
          <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-stone-400">
            <TrendingUp className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
            Trending searches
          </div>
          <div className="flex flex-wrap gap-2">
            {TRENDING.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => go(term)}
                className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

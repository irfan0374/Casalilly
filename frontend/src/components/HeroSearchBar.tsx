import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

const SUGGESTIONS = [
  "flowers",
  "birthday gift",
  "new born gift",
  "anniversary gift",
];
const TYPE_MS = 70;
const DELETE_MS = 35;
const PAUSE_FULL_MS = 1300;
const PAUSE_EMPTY_MS = 400;

/** Typewriter effect cycling through SUGGESTIONS: types a word out, pauses,
 * deletes it, then moves to the next — only while the visitor hasn't typed
 * anything themselves. */
function useTypewriter(active: boolean) {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "pausing" | "deleting">("typing");

  useEffect(() => {
    if (!active) return;
    const word = SUGGESTIONS[wordIndex];

    if (phase === "typing") {
      if (text.length < word.length) {
        const t = setTimeout(() => setText(word.slice(0, text.length + 1)), TYPE_MS);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase("pausing"), PAUSE_FULL_MS);
      return () => clearTimeout(t);
    }

    if (phase === "pausing") {
      const t = setTimeout(() => setPhase("deleting"), 0);
      return () => clearTimeout(t);
    }

    // deleting
    if (text.length > 0) {
      const t = setTimeout(() => setText(text.slice(0, -1)), DELETE_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setWordIndex((i) => (i + 1) % SUGGESTIONS.length);
      setPhase("typing");
    }, PAUSE_EMPTY_MS);
    return () => clearTimeout(t);
  }, [active, phase, text, wordIndex]);

  return text;
}

/** Search bar overlaid on the hero — placeholder types itself out through
 * suggestions when the visitor hasn't typed anything, then submits to the
 * Shop page's ?search= filter. */
export default function HeroSearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const typedPlaceholder = useTypewriter(!query);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    navigate(trimmed ? `/shop?search=${encodeURIComponent(trimmed)}` : "/shop");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md items-center gap-2 rounded-full border border-white/40 bg-white/20 px-4 py-2.5 shadow-lg backdrop-blur-xl transition focus-within:border-white/70 focus-within:bg-white/30 sm:max-w-lg sm:py-3"
    >
      <Search className="h-4 w-4 shrink-0 text-white" strokeWidth={2} aria-hidden="true" />
      <span className="relative w-full min-w-0 text-left">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search products"
          className="peer w-full min-w-0 bg-transparent text-sm text-white placeholder:text-transparent focus:outline-none"
        />
        {!query && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center text-sm text-white/85">
            Search "{typedPlaceholder}
            <span className="ml-px inline-block w-px animate-pulse bg-white/85">&nbsp;</span>
            "
          </span>
        )}
      </span>
    </form>
  );
}

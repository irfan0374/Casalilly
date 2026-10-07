import { useEffect, useState } from "react";
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
 * deletes it, then moves to the next. */
function useTypewriter() {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "pausing" | "deleting">("typing");

  useEffect(() => {
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
  }, [phase, text, wordIndex]);

  return text;
}

/** Search "bar" — really a button, not a real text input. Tapping it opens
 * the full-screen SearchOverlay instead of letting the visitor type in
 * place: a real <input> here would need a small font-size to fit the pill,
 * and any focused input under 16px triggers an automatic page zoom on
 * iOS/Android — which read as "the site zooms in when I tap search". */
export default function HeroSearchBar({ onOpen }: { onOpen: () => void }) {
  const typedPlaceholder = useTypewriter();

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Search products"
      className="flex h-14 w-full items-center gap-3 rounded-full bg-white px-5 text-left ring-1 ring-stone-200 transition hover:ring-rose-300 md:mx-auto md:max-w-2xl"
    >
      <Search className="h-5 w-5 shrink-0 text-stone-400" strokeWidth={1.75} aria-hidden="true" />
      <span className="w-full min-w-0 truncate text-[15px] text-stone-400">
        Search for {typedPlaceholder}
        <span className="ml-px inline-block w-px animate-pulse bg-stone-400">&nbsp;</span>
      </span>
    </button>
  );
}

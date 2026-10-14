import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUp, Clock, EyeOff, GalleryHorizontal, Lightbulb, Pencil, Plus } from "lucide-react";
import { adminListHeroSlides, updateHeroSlide } from "../../api/heroSlides";
import { LinkButton } from "../../components/admin/ui/Button";
import { Pill } from "../../components/admin/ui/Chip";
import { EmptyState, ErrorState, Fab, PageHeader } from "../../components/admin/ui/Layout";
import { useToast } from "../../components/admin/ui/Toast";
import { Toggle } from "../../components/admin/ui/Toggle";
import { useAuth } from "../../context/AuthContext";
import { timeAgo } from "../../lib/format";
import type { HeroSlide } from "../../types";

export default function HeroSlideList() {
  const { token } = useAuth();
  const toast = useToast();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function load() {
    if (!token) return;
    setLoading(true);
    setError(null);
    adminListHeroSlides(token)
      .then(setSlides)
      .catch(() => setError("Couldn't load banners. Check your connection and try again."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [token]);

  async function toggleActive(slide: HeroSlide) {
    if (!token) return;
    setBusy(true);
    setSlides((prev) => prev.map((s) => (s.id === slide.id ? { ...s, is_active: !s.is_active } : s)));
    try {
      const updated = await updateHeroSlide(slide.id, { is_active: !slide.is_active }, token);
      setSlides((prev) => prev.map((s) => (s.id === slide.id ? updated : s)));
      toast(slide.is_active ? "Banner hidden" : "Banner is live");
    } catch {
      setSlides((prev) => prev.map((s) => (s.id === slide.id ? slide : s)));
      toast("Couldn't update the banner. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  }

  /** Moves a banner one place up/down, then renumbers every banner's
   * sort_order to its new position so the order is unambiguous. */
  async function move(index: number, direction: -1 | 1) {
    if (!token) return;
    const target = index + direction;
    if (target < 0 || target >= slides.length) return;
    const previous = slides;
    const reordered = [...slides];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    const renumbered = reordered.map((s, i) => ({ ...s, sort_order: i }));
    setSlides(renumbered);
    setBusy(true);
    try {
      await Promise.all(
        renumbered
          .filter((s) => previous.find((p) => p.id === s.id)?.sort_order !== s.sort_order)
          .map((s) => updateHeroSlide(s.id, { sort_order: s.sort_order }, token))
      );
    } catch {
      setSlides(previous);
      toast("Couldn't change the order. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  }

  const liveCount = slides.filter((s) => s.is_active).length;

  return (
    <div>
      <PageHeader
        title="Banners"
        badge={
          !loading &&
          slides.length > 0 && (
            <Pill tone="rose" dot>
              {slides.length} banner{slides.length === 1 ? "" : "s"} · {liveCount} live
            </Pill>
          )
        }
        description="Live banners rotate at the top of the homepage."
        action={
          // Desktop only — phones get the floating + button instead.
          <div className="hidden lg:block">
            <LinkButton
              to="/admin/hero-slides/new"
              icon={<Plus className="h-4 w-4" aria-hidden="true" />}
            >
              Add Banner
            </LinkButton>
          </div>
        }
      />

      {loading && (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="aspect-[16/11] animate-pulse rounded-3xl bg-white ring-1 ring-stone-100" />
          ))}
        </div>
      )}

      {!loading && error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && slides.length === 0 && (
        <EmptyState
          icon={<GalleryHorizontal className="h-7 w-7" aria-hidden="true" />}
          title="No banners yet"
          description="Add a wide photo with a short heading to welcome visitors on the homepage."
          action={
            <LinkButton to="/admin/hero-slides/new" icon={<Plus className="h-4 w-4" aria-hidden="true" />}>
              Add your first banner
            </LinkButton>
          }
        />
      )}

      {!loading && !error && slides.length > 0 && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            {slides.map((slide, index) => (
              <article key={slide.id} className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-stone-100">
                <div className="flex items-center gap-2 px-3 py-2.5">
                  <div className="flex">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={busy || index === 0}
                      aria-label="Move up"
                      className="flex h-10 w-10 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-100 disabled:opacity-30"
                    >
                      <ArrowUp className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={busy || index === slides.length - 1}
                      aria-label="Move down"
                      className="flex h-10 w-10 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-100 disabled:opacity-30"
                    >
                      <ArrowDown className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                  <span className="text-sm font-semibold text-stone-700">Position {index + 1}</span>
                  {slide.is_active ? <Pill tone="green" dot>Live</Pill> : <Pill tone="stone">Hidden</Pill>}
                  <span className="ml-auto">
                    <Toggle
                      checked={slide.is_active}
                      onChange={() => toggleActive(slide)}
                      disabled={busy}
                      label={slide.is_active ? "Hide banner" : "Show banner"}
                    />
                  </span>
                </div>

                <Link to={`/admin/hero-slides/${slide.id}/edit`} className="relative block aspect-video bg-stone-100">
                  <img
                    src={slide.image_url}
                    alt=""
                    className={`h-full w-full object-cover ${slide.is_active ? "" : "opacity-60 grayscale-[30%]"}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  {!slide.mobile_image_url && (
                    <span className="absolute left-3 top-3 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                      Add phone photo
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="font-display text-xl font-semibold leading-tight text-white">
                      {slide.heading || <span className="italic text-white/70">Photo only — no text</span>}
                    </p>
                    {slide.subheading && (
                      <p className="mt-1 line-clamp-1 text-sm text-white/85">{slide.subheading}</p>
                    )}
                  </div>
                </Link>

                <div className="flex items-center justify-between px-4 py-2.5 text-sm text-stone-500">
                  <span className="flex items-center gap-1.5">
                    {slide.is_active ? (
                      <>
                        <Clock className="h-4 w-4" aria-hidden="true" />
                        Edited {timeAgo(slide.updated_at ?? slide.created_at)}
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                        Hidden from homepage
                      </>
                    )}
                  </span>
                  <Link
                    to={`/admin/hero-slides/${slide.id}/edit`}
                    aria-label="Edit banner"
                    className="flex h-10 w-10 items-center justify-center rounded-full text-stone-600 transition hover:bg-stone-100 hover:text-rose-700"
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-5 flex gap-3 rounded-3xl bg-rose-50/60 p-4 text-sm text-stone-600">
            <Lightbulb className="h-5 w-5 flex-shrink-0 text-rose-600" aria-hidden="true" />
            <p>Use the arrows to change the order. Live banners rotate on the homepage in this order.</p>
          </div>
        </>
      )}

      <Fab to="/admin/hero-slides/new" label="Add banner" />
    </div>
  );
}

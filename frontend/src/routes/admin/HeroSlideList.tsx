import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import {
  adminListHeroSlides,
  deleteHeroSlide,
  updateHeroSlide,
} from "../../api/heroSlides";
import AdminTableSkeleton from "../../components/admin/AdminTableSkeleton";
import { useAuth } from "../../context/AuthContext";
import type { HeroSlide } from "../../types";

export default function HeroSlideList() {
  const { token } = useAuth();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  function load() {
    if (!token) return;
    setLoading(true);
    setError(null);
    adminListHeroSlides(token)
      .then(setSlides)
      .catch(() => setError("Couldn't load hero banners."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [token]);

  async function handleToggleActive(slide: HeroSlide) {
    if (!token) return;
    setBusyId(slide.id);
    try {
      const updated = await updateHeroSlide(
        slide.id,
        { is_active: !slide.is_active },
        token
      );
      setSlides((prev) => prev.map((s) => (s.id === slide.id ? updated : s)));
    } catch {
      window.alert("Failed to update hero banner.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(slide: HeroSlide) {
    if (!token) return;
    if (!window.confirm("Delete this hero banner? This cannot be undone.")) {
      return;
    }
    setBusyId(slide.id);
    try {
      await deleteHeroSlide(slide.id, token);
      setSlides((prev) => prev.filter((s) => s.id !== slide.id));
    } catch {
      window.alert("Failed to delete hero banner.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Hero Banners</h1>
          <p className="text-sm text-stone-500">
            Create several — the homepage rotates through the active ones.
          </p>
        </div>
        <Link
          to="/admin/hero-slides/new"
          className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
        >
          + Add Hero Banner
        </Link>
      </div>

      {loading && <AdminTableSkeleton columns={5} rows={4} />}
      {!loading && error && (
        <p className="py-16 text-center text-red-500">{error}</p>
      )}
      {!loading && !error && slides.length === 0 && (
        <p className="py-16 text-center text-stone-400">
          No hero banners yet. Add your first one.
        </p>
      )}

      {!loading && !error && slides.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-rose-100">
          <table className="min-w-full divide-y divide-rose-100 text-sm">
            <thead className="bg-rose-50 text-left text-stone-500">
              <tr>
                <th className="px-4 py-3 font-medium">Image</th>
                <th className="px-4 py-3 font-medium">Heading</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50 bg-white">
              {slides.map((slide) => (
                <tr key={slide.id}>
                  <td className="px-4 py-3">
                    <div className="h-12 w-20 overflow-hidden rounded-lg bg-rose-50">
                      <img
                        src={slide.image_url}
                        alt={slide.heading ?? ""}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-stone-800">
                    {slide.heading || (
                      <span className="text-stone-400">No heading</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-stone-500">{slide.sort_order}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        slide.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-stone-100 text-stone-500"
                      }`}
                    >
                      {slide.is_active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(slide)}
                        disabled={busyId === slide.id}
                        aria-label={slide.is_active ? "Disable hero banner" : "Activate hero banner"}
                        title={slide.is_active ? "Disable" : "Activate"}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 transition hover:bg-stone-100 disabled:opacity-50"
                      >
                        {slide.is_active ? (
                          <Eye className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                        ) : (
                          <EyeOff className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                        )}
                      </button>
                      <Link
                        to={`/admin/hero-slides/${slide.id}/edit`}
                        aria-label="Edit hero banner"
                        title="Edit"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-600 transition hover:bg-rose-50"
                      >
                        <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(slide)}
                        disabled={busyId === slide.id}
                        aria-label="Delete hero banner"
                        title="Delete"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

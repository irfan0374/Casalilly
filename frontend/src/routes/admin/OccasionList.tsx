import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarHeart, Pencil, Plus } from "lucide-react";
import { adminListOccasions, occasionError, saveOccasion } from "../../api/occasions";
import { LinkButton } from "../../components/admin/ui/Button";
import { Card, EmptyState, ErrorState, PageHeader } from "../../components/admin/ui/Layout";
import { ToggleRow } from "../../components/admin/ui/Toggle";
import { useToast } from "../../components/admin/ui/Toast";
import { useAuth } from "../../context/AuthContext";
import type { Occasion } from "../../types";

export default function OccasionList() {
  const { token } = useAuth();
  const toast = useToast();
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError(null);
    try { setOccasions(await adminListOccasions(token)); }
    catch { setError("Couldn't load occasions. Please try again."); }
    finally { setLoading(false); }
  }, [token]);
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    adminListOccasions(token).then(items => { if (!cancelled) setOccasions(items); })
      .catch(() => { if (!cancelled) setError("Couldn't load occasions. Please try again."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [token]);

  async function toggle(occasion: Occasion, active: boolean) {
    if (!token || busy !== null) return;
    setBusy(occasion.id);
    try {
      const saved = await saveOccasion(occasion.id, { ...occasion, is_active: active }, token);
      setOccasions(prev => prev.map(item => item.id === saved.id ? saved : item));
      toast(active ? "Occasion shown on homepage" : "Occasion hidden from homepage");
    } catch (err) { toast(occasionError(err, "Couldn't update this occasion."), "error"); }
    finally { setBusy(null); }
  }

  return (
    <div>
      <PageHeader title="Occasions" description="Manage the homepage's Shop by occasion cards." action={<LinkButton to="/admin/occasions/new" icon={<Plus className="h-4 w-4" />}>Add occasion</LinkButton>} />
      {loading ? <div className="h-64 animate-pulse rounded-3xl bg-white" /> : error ? <ErrorState message={error} onRetry={load} /> : occasions.length === 0 ? (
        <EmptyState icon={<CalendarHeart />} title="No occasions yet" description="Add an occasion, then assign products to it in the product form." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {occasions.map(occasion => (
            <Card key={occasion.id}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-stone-100">
                <img src={occasion.image_url} alt="" className="h-full w-full object-cover" />
                <span className="absolute inset-0 bg-black/40" />
                <span className="absolute bottom-3 left-3 font-serif text-xl text-white">{occasion.name}</span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-xs text-stone-500">{occasion.is_active ? "Visible on homepage" : "Hidden from homepage"}</span>
                <Link to={`/admin/occasions/${occasion.id}/edit`} className="flex min-h-11 items-center gap-1.5 text-sm font-semibold text-rose-700"><Pencil className="h-4 w-4" />Edit</Link>
              </div>
              <ToggleRow title="Show on homepage" label={`Show ${occasion.name} on homepage`} checked={occasion.is_active} onChange={active => { void toggle(occasion, active); }} disabled={busy !== null} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

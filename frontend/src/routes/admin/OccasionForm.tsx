import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { adminGetOccasion, deleteOccasion, occasionError, saveOccasion } from "../../api/occasions";
import ImageUploader from "../../components/admin/ImageUploader";
import { ConfirmSheet } from "../../components/admin/ui/BottomSheet";
import { Button } from "../../components/admin/ui/Button";
import { Field, TextInput } from "../../components/admin/ui/Field";
import { Card, ErrorState, FormHeader, StickyActions } from "../../components/admin/ui/Layout";
import { ToggleRow } from "../../components/admin/ui/Toggle";
import { useToast } from "../../components/admin/ui/Toast";
import { useAuth } from "../../context/AuthContext";
import type { OccasionInput } from "../../types";

const EMPTY: OccasionInput = { name: "", image_url: "", image_public_id: null, shop_link: null, is_active: true };
export default function OccasionForm() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState<OccasionInput>(EMPTY);
  const [loading, setLoading] = useState(Boolean(id));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    if (!id || !token) return;
    let cancelled = false;
    adminGetOccasion(id, token).then(item => { if (!cancelled) setForm(item); })
      .catch(() => { if (!cancelled) setLoadError("Couldn't load this occasion."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, token]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!token || uploading || saving) return;
    if (!form.name.trim() || !form.image_url) { setError("Add a name and photo for this occasion."); return; }
    const link = form.shop_link?.trim() || null;
    if (link && (!/^\/shop(?:\?[^#\\]*)?$/.test(link) || Array.from(link).some(c => c.charCodeAt(0) < 32))) { setError("Use a shop link such as /shop?category=flowers, or leave it blank."); return; }
    setSaving(true); setError(null);
    try {
      await saveOccasion(id ?? null, { ...form, name: form.name.trim(), shop_link: link }, token);
      toast(id ? "Occasion saved" : "Occasion added"); navigate("/admin/occasions");
    } catch (err) { setError(occasionError(err, "Couldn't save this occasion. Please try again.")); }
    finally { setSaving(false); }
  }
  async function remove() {
    if (!id || !token) return;
    setDeleting(true);
    try { await deleteOccasion(id, token); toast("Occasion removed; products kept"); navigate("/admin/occasions"); }
    catch (err) { toast(occasionError(err, "Couldn't remove this occasion."), "error"); setDeleting(false); }
  }
  const title = id ? "Edit Occasion" : "Add Occasion";
  if (loading || loadError) return <div><FormHeader title={title} backTo="/admin/occasions" backLabel="Occasions" />{loadError ? <ErrorState message={loadError} /> : <div className="h-64 animate-pulse rounded-3xl bg-white" />}</div>;
  return (
    <form onSubmit={submit} noValidate>
      <FormHeader title={title} backTo="/admin/occasions" backLabel="Occasions" />
      <fieldset disabled={saving || deleting} className="grid gap-5 lg:grid-cols-2">
        <Card title="Occasion photo" subtitle="Landscape photos look best on the homepage.">
          <ImageUploader aspect="wide" imageUrl={form.image_url || null} onBusyChange={setUploading} onUploaded={(url, publicId) => setForm(prev => ({ ...prev, image_url: url, image_public_id: publicId }))} />
        </Card>
        <Card title="Details">
          <div className="flex flex-col gap-5">
            <Field label="Occasion name" htmlFor="occasion-name" required><TextInput id="occasion-name" maxLength={100} value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g. Birthday" /></Field>
            <Field label="Shop link (optional)" htmlFor="occasion-link" hint="Leave blank to show products assigned to this occasion. A custom shop link replaces that filter."><TextInput id="occasion-link" value={form.shop_link ?? ""} onChange={e => setForm(prev => ({ ...prev, shop_link: e.target.value }))} placeholder="Automatic occasion products" /></Field>
            <ToggleRow title="Show on homepage" label="Show on homepage" description="Hidden occasions remain available for assigning products." checked={form.is_active} onChange={is_active => setForm(prev => ({ ...prev, is_active }))} />
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            {id && <Button variant="ghost" className="text-red-600" icon={<Trash2 className="h-4 w-4" />} onClick={() => setConfirmDelete(true)} disabled={uploading}>Remove occasion</Button>}
          </div>
        </Card>
      </fieldset>
      <StickyActions>
        <Button variant="secondary" onClick={() => navigate("/admin/occasions")} disabled={saving || uploading}>Cancel</Button>
        <Button type="submit" loading={saving} disabled={uploading} className="flex-1 lg:flex-none">{uploading ? "Uploading photo…" : "Save occasion"}</Button>
      </StickyActions>
      <ConfirmSheet open={confirmDelete} title={`Remove “${form.name}”?`} message="The homepage card and its product assignments will be removed. Your products will stay in the shop." confirmLabel="Remove occasion" onConfirm={remove} onCancel={() => setConfirmDelete(false)} busy={deleting} />
    </form>
  );
}

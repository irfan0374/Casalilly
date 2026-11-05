import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { getSettings, updateSettings } from "../../api/settings";
import { Button } from "../../components/admin/ui/Button";
import { CharCount, Field, TextArea, TextInput } from "../../components/admin/ui/Field";
import { Card, ErrorState, PageHeader, StickyActions } from "../../components/admin/ui/Layout";
import { useToast } from "../../components/admin/ui/Toast";
import { useAuth } from "../../context/AuthContext";
import { DEFAULT_ABOUT_BODY as DEFAULT_BODY, DEFAULT_ABOUT_HEADING as DEFAULT_HEADING } from "../../lib/config";

const HEADING_MAX = 255;
// Not enforced by the API — just a guide so the intro stays readable.
const BODY_GUIDE = 600;

/** Edits the heading and intro text at the top of the public About page.
 * Leaving a field empty falls back to the About page's built-in default. */
export default function AboutSettingsForm() {
  const { token } = useAuth();
  const toast = useToast();
  const [heading, setHeading] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getSettings()
      .then((settings) => {
        if (cancelled) return;
        setHeading(settings.about_heading ?? "");
        setBody(settings.about_body ?? "");
      })
      .catch(() => {
        if (!cancelled) setLoadError("Couldn't load the About page content.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      await updateSettings(
        { about_heading: heading.trim() || null, about_body: body.trim() || null },
        token
      );
      toast("About page saved");
    } catch {
      toast("Couldn't save. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PageHeader
        title="About Page"
        description="The heading and intro at the top of your website's About page. Leave a field empty to use the default text."
      />

      {loadError && <ErrorState message={loadError} />}
      {loading && !loadError && (
        <div className="h-80 animate-pulse rounded-3xl bg-white ring-1 ring-stone-100" />
      )}

      {!loading && !loadError && (
        <>
          <div className="grid items-start gap-5 lg:grid-cols-2 lg:gap-6">
            <Card>
              <div className="flex flex-col gap-5">
                <Field
                  label="Heading"
                  htmlFor="about-heading"
                  aside={<CharCount value={heading} max={HEADING_MAX} />}
                >
                  <TextInput
                    id="about-heading"
                    value={heading}
                    maxLength={HEADING_MAX}
                    placeholder={DEFAULT_HEADING}
                    onChange={(e) => setHeading(e.target.value)}
                  />
                </Field>
                <Field
                  label="Intro text"
                  htmlFor="about-body"
                  aside={<CharCount value={body} max={BODY_GUIDE} />}
                  hint="Tell customers about Casalily's story. Line breaks are kept as typed."
                >
                  <TextArea
                    id="about-body"
                    rows={8}
                    value={body}
                    placeholder={DEFAULT_BODY}
                    onChange={(e) => setBody(e.target.value)}
                  />
                </Field>
              </div>
            </Card>

            <Card
              title="Preview"
              aside={
                <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-rose-700">
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  About page
                </span>
              }
            >
              <div className="rounded-2xl bg-gradient-to-b from-rose-50 to-white px-5 py-8 text-center">
                <p className="font-serif text-2xl font-bold text-stone-800">
                  {heading.trim() || DEFAULT_HEADING}
                </p>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-stone-600">
                  {body.trim() || DEFAULT_BODY}
                </p>
              </div>
            </Card>
          </div>

          {/* Room for the save bar, which sits above the mobile tab bar here. */}
          <div className="h-20 lg:h-16" aria-hidden="true" />
          <StickyActions aboveTabs>
            <Button type="submit" size="lg" loading={saving} className="w-full lg:w-56">
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </StickyActions>
        </>
      )}
    </form>
  );
}

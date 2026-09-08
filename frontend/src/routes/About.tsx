import { useEffect, useState } from "react";
import PublicLayout from "../components/PublicLayout";
import { getSettings } from "../api/settings";
import type { SiteSettings } from "../types";

const DEFAULT_HEADING = "About Casa Lilly";
const DEFAULT_BODY =
  "Casa Lilly brings fresh flowers, bouquets, plants and gift baskets for every occasion. Browse the collection and order in a tap over WhatsApp — no account, no hassle.";

export default function About() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    getSettings()
      .then(setSettings)
      .catch(() => setSettings(null));
  }, []);

  const heading = settings?.about_heading || DEFAULT_HEADING;
  const body = settings?.about_body || DEFAULT_BODY;

  return (
    <PublicLayout>
      <section className="bg-gradient-to-b from-rose-50 to-transparent px-4 py-16 text-center sm:py-20">
        <h1 className="font-serif text-4xl font-bold text-stone-800 sm:text-5xl">
          {heading}
        </h1>
      </section>

      <main className="mx-auto max-w-3xl px-4 pb-20">
        <p className="whitespace-pre-line text-lg leading-relaxed text-stone-600">
          {body}
        </p>
      </main>
    </PublicLayout>
  );
}

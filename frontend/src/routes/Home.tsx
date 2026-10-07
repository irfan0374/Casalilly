import { useEffect, useState } from "react";
import { getCatalogSummary, getCategories } from "../api/products";
import { getOccasions } from "../api/occasions";
import { getHeroSlides } from "../api/heroSlides";
import BestSellersSection from "../components/BestSellersSection";
import HeroSearchBar from "../components/HeroSearchBar";
import HeroSlideshow from "../components/HeroSlideshow";
import OurProductsSection from "../components/OurProductsSection";
import PublicLayout from "../components/PublicLayout";
import RotatingPlantShowcase from "../components/RotatingPlantShowcase";
import SearchOverlay from "../components/SearchOverlay";
import {
  CategoryRow,
  CategoryRowSkeleton,
  HomeSection,
  OccasionGrid,
  SearchChips,
  SectionHeader,
  StatsStrip,
  StoryCard,
  VisitBoutique,
} from "../components/storefront/HomeSections";
import storyImage from "../assets/image1.jpeg";
import personalizedImage from "../assets/personalized1.jpeg";
import type { CatalogSummary, HeroSlide, Occasion } from "../types";

export default function Home() {
  const [summary, setSummary] = useState<CatalogSummary | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    // Settled independently: one failing request (e.g. the summary endpoint
    // while the backend is mid-deploy) must not blank the hero and
    // categories along with it.
    Promise.allSettled([getCatalogSummary(), getCategories(), getHeroSlides(), getOccasions()])
      .then(([summaryResult, categoryResult, heroResult, occasionResult]) => {
        setSummary(summaryResult.status === "fulfilled" ? summaryResult.value : null);
        setCategories(categoryResult.status === "fulfilled" ? categoryResult.value : []);
        setHeroSlides(heroResult.status === "fulfilled" ? heroResult.value : []);
        setOccasions(occasionResult.status === "fulfilled" ? occasionResult.value : []);
      })
      .finally(() => setLoading(false));
  }, []);

  // Best Sellers should only offer tabs for categories that actually have
  // products — an empty category tab would just show "No products in this
  // category yet." every time, which isn't useful to click through to.
  // Without the summary, fall back to every category rather than hiding the
  // section entirely.
  const categoriesWithProducts = summary?.categories_with_products ?? categories;

  return (
    <PublicLayout>
      {loading ? (
        <section className="mx-auto w-full max-w-7xl px-4 pt-4 md:px-8 md:pt-6">
          <div className="aspect-[4/5] w-full animate-pulse rounded-3xl bg-stone-100 sm:aspect-[16/10] lg:aspect-[21/9]" />
        </section>
      ) : (
        <HeroSlideshow slides={heroSlides} />
      )}

      <StatsStrip categoryCount={categories.length} loading={loading} />

      <section className="mx-auto max-w-7xl px-4 pt-6 md:px-8 md:pt-10">
        <HeroSearchBar onOpen={() => setSearchOpen(true)} />
        <SearchChips />
      </section>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      {(loading || categories.length > 0) && (
        <HomeSection>
          <SectionHeader title="Shop by category" />
          {loading ? <CategoryRowSkeleton /> : <CategoryRow categories={categories} />}
        </HomeSection>
      )}

      {occasions.length > 0 && <HomeSection>
        <SectionHeader
          title="Shop by occasion"
          action={<span className="text-right text-xs text-stone-500">Celebrate moments</span>}
        />
        <OccasionGrid occasions={occasions} />
      </HomeSection>}

      <HomeSection>
        <StoryCard
          image={storyImage}
          imageAlt="Casa Lilly florist arranging a fresh bouquet"
          eyebrow="Our story"
          title="Flowers that tell beautiful stories"
          body="We source the finest blooms and design with heart to bring beauty, joy and meaning to every moment."
          cta="Our story"
          to="/about"
        />
      </HomeSection>

      <BestSellersSection categories={categoriesWithProducts} />

      <RotatingPlantShowcase />

      <OurProductsSection categories={categories} />

      <HomeSection>
        <StoryCard
          image={personalizedImage}
          imageAlt="Florist hand-finishing a personalized bouquet"
          eyebrow="Gifting"
          title="Add a personalized touch"
          body="Personalized gifts make every moment more meaningful."
          cta="Shop gifts"
          to="/shop"
          reverse
        />
      </HomeSection>

      <HomeSection>
        <SectionHeader eyebrow="Visit us" title="Our boutique" />
        <VisitBoutique />
      </HomeSection>
    </PublicLayout>
  );
}

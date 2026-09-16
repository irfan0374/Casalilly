import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Flower2, Package, Smile, Sparkles } from "lucide-react";
import { getCategories, getProducts } from "../api/products";
import { getHeroSlides } from "../api/heroSlides";
import BestSellersSection from "../components/BestSellersSection";
import HeroSlideshow from "../components/HeroSlideshow";
import OurProductsSection from "../components/OurProductsSection";
import PublicLayout from "../components/PublicLayout";
import RotatingPlantShowcase from "../components/RotatingPlantShowcase";
import { categoryIcon, categoryImage, formatCategory } from "../lib/categories";
import storyImage from "../assets/image1.jpeg";
import personalizedImage from "../assets/personalized1.jpeg";
import type { HeroSlide, Product } from "../types";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesStuck, setCategoriesStuck] = useState(false);
  const categoriesSentinelRef = useRef<HTMLDivElement>(null);

  // Shows a compact, single-line "mini bar" pinned to the top (mobile only)
  // once the normal 2-line category grid has scrolled out of view — driven
  // by a sentinel placed right after that grid. The mini bar is
  // position:fixed (out of flow), so toggling it never changes page height
  // or feeds back into the very scroll position that triggers it — the bug
  // a position:sticky version of this same toggle would have.
  useEffect(() => {
    const sentinel = categoriesSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setCategoriesStuck(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [categories.length]);

  useEffect(() => {
    Promise.all([getProducts(), getCategories(), getHeroSlides()])
      .then(([productData, categoryData, heroData]) => {
        setProducts(productData);
        setCategories(categoryData);
        setHeroSlides(heroData);
      })
      .catch(() => {
        setProducts([]);
        setCategories([]);
        setHeroSlides([]);
      })
      .finally(() => setLoading(false));
  }, []);

const stats = [
      { icon: Flower2, value: `${products.length}+`, label: "Products Available" },
      { icon: Package, value: `${categories.length}`, label: "Categories" },
      { icon: Smile, value: "1000+", label: "Happy customer" },
      { icon: Sparkles, value: "Fresh", label: "Handpicked Daily" },
    ];

  const heroVisible = heroSlides.length > 0;
  // Treat the loading state as if a hero will show, so the stats card
  // doesn't jump position once the real hero (or its absence) is known.
  const heroSpacing = loading || heroVisible;

  return (
    <PublicLayout>


      {/* Hero section */}
      {loading ? (
        <div className="mx-auto w-full max-w-7xl px-3 pt-4 sm:px-4 lg:px-1">
          <div className="aspect-[3/2] w-full animate-pulse rounded-2xl bg-rose-100 sm:aspect-[2/1] sm:rounded-3xl lg:aspect-[3/1]" />
        </div>
      ) : (
        heroVisible && <HeroSlideshow slides={heroSlides} />
      )}

      {/* Stats / value props — floats up over the bottom of the hero image
          when a hero is shown, otherwise sits with normal top spacing. Each
          stat is its own card rather than one shared box. */}
      <section
        className={`relative z-10 mx-auto max-w-6xl px-4 ${
          heroSpacing ? "-mt-8 sm:-mt-10" : "pt-8"
        }`}
      >
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center gap-0.5 rounded-2xl bg-white p-2 py-3 text-center shadow-xl shadow-black/10 sm:gap-1 sm:p-4 sm:py-5"
            >
              <s.icon
                className="h-4 w-4 text-rose-500 sm:h-6 sm:w-6"
                strokeWidth={2}
                aria-hidden="true"
              />
              {loading ? (
                <span className="h-3.5 w-10 animate-pulse rounded bg-rose-100 sm:h-5 sm:w-14" />
              ) : (
                <span className="text-sm font-bold text-stone-800 sm:text-xl">
                  {s.value}
                </span>
              )}
              <span className="text-[9px] font-medium leading-tight text-stone-500 sm:text-xs">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>



      {/* Categories */}
      {loading && (
        <section className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h2 className="font-serif text-2xl font-bold text-stone-800 sm:text-3xl">
            Our Categories
          </h2>
          <div className="scrollbar-none mt-8 grid auto-cols-max grid-flow-col grid-rows-2 justify-start gap-x-5 gap-y-6 overflow-x-auto px-1 pb-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-8 sm:overflow-visible sm:px-0 sm:pb-0">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex w-20 flex-col items-center gap-2 sm:w-24">
                <span className="h-20 w-20 animate-pulse rounded-full bg-rose-100" />
                <span className="h-3 w-12 animate-pulse rounded bg-rose-100" />
              </div>
            ))}
          </div>
        </section>
      )}

      {!loading && categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h2 className="font-serif text-2xl font-bold text-stone-800 sm:text-3xl">
            Our Categories
          </h2>
          <div className="scrollbar-none mt-8 grid auto-cols-max grid-flow-col grid-rows-2 justify-start gap-x-5 gap-y-6 overflow-x-auto px-1 pb-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-8 sm:overflow-visible sm:px-0 sm:pb-0">
            {categories.map((category) => {
              const image = categoryImage(category);
              const Icon = categoryIcon(category);
              return (
                <Link
                  key={category}
                  to={`/shop?category=${category}`}
                  className="group flex w-20 flex-col items-center gap-2 sm:w-24"
                >
                  <span className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-rose-50 ring-1 ring-rose-100 transition group-hover:ring-rose-300">
                    {image ? (
                      <img
                        src={image}
                        alt=""
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <Icon className="h-8 w-8 text-rose-500" strokeWidth={1.5} aria-hidden="true" />
                    )}
                  </span>
                  <span className="text-sm font-medium text-stone-600 group-hover:text-rose-600">
                    {formatCategory(category)}
                  </span>
                </Link>
              );
            })}
          </div>
          {/* Zero-height marker right after the normal category grid — once
              it scrolls out of view, the fixed mini bar below takes over. */}
          <div ref={categoriesSentinelRef} aria-hidden="true" />
        </section>
      )}

      {/* Compact single-line category bar — fixed (not sticky) so toggling
          it never resizes the page or feeds back into the scroll position
          that triggers it. Mobile only; fades/slides in once the normal
          2-line grid above has scrolled past. */}
      {!loading && categories.length > 0 && (
        <div
          className={`fixed inset-x-0 top-0 z-30 border-b border-rose-100 bg-stone-50/95 backdrop-blur transition-transform duration-200 ease-out sm:hidden ${
            categoriesStuck ? "translate-y-0" : "-translate-y-full"
          }`}
          aria-hidden={!categoriesStuck}
        >
          <div className="scrollbar-none flex gap-4 overflow-x-auto px-4 py-2.5">
            {categories.map((category) => {
              const image = categoryImage(category);
              const Icon = categoryIcon(category);
              return (
                <Link
                  key={category}
                  to={`/shop?category=${category}`}
                  tabIndex={categoriesStuck ? 0 : -1}
                  className="group flex flex-shrink-0 items-center gap-2 rounded-full border border-rose-100 bg-white py-1 pl-1 pr-3 transition hover:border-rose-300"
                >
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-rose-50">
                    {image ? (
                      <img src={image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Icon className="h-3.5 w-3.5 text-rose-500" strokeWidth={1.5} aria-hidden="true" />
                    )}
                  </span>
                  <span className="whitespace-nowrap text-xs font-medium text-stone-600 group-hover:text-rose-600">
                    {formatCategory(category)}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}



      {/* Our story banner */}
 <section className="w-full sm:py-2 px-4 sm:px-6 lg:px-2 max-w-7xl mx-auto">
  <div className="relative flex h-36 w-full items-stretch overflow-hidden bg-rose-50 sm:h-48 lg:h-72 xl:h-80 rounded-2xl">
    <div className="relative z-10 flex w-[44%] flex-col justify-center gap-1 px-3 py-2 sm:w-auto sm:max-w-sm sm:gap-3 sm:px-8 sm:py-6 lg:max-w-md lg:px-10">
      <h2 className="font-serif text-xs font-bold uppercase leading-tight tracking-tight text-gray-600 sm:text-2xl sm:leading-snug lg:text-2xl">
        Flowers That Tell Beautiful Stories
      </h2>
      <p className="hidden text-sm leading-relaxed text-stone-600 sm:block sm:text-base">
        We source the finest blooms and design with heart to bring
        beauty, joy and meaning to every moment.
      </p>
      <Link
        to="/about"
        className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full border border-stone-800 px-2.5 py-1 text-[9px] font-semibold text-stone-800 transition hover:bg-stone-800 hover:text-white sm:mt-2 sm:gap-2 sm:border-2 sm:px-6 sm:py-2.5 sm:text-sm"
      >
        Our Story
      </Link>
      
    </div>

    <div className="relative w-[56%] flex-1">
      <img
        src={storyImage}
        alt="Casa Lilly florist arranging a fresh bouquet"
        className="h-full w-full object-cover object-[center_35%] sm:object-[center_55%]"
      />
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-rose-50 to-transparent sm:w-24 lg:w-32"
        aria-hidden="true"
      />
    </div>
  </div>
</section>

    

      {/* Rotating plant showcase — scroll-scrubbed turntable animation */}
      <RotatingPlantShowcase />

      {/* Best sellers — tabbed by category */}
      <BestSellersSection categories={categories} />

      {/* Our Products — tabbed by category, 10 items */}
      <OurProductsSection categories={categories} />

        {/* Personalized touch banner  */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 sm:py-2 lg:px-2">
        <div className="relative flex h-36 w-full items-stretch overflow-hidden rounded-2xl bg-white ring-1 ring-rose-100 sm:h-48 lg:h-72 xl:h-80">
          
           <div className="relative w-[56%] flex-1">
            <img
              src={personalizedImage}
              alt="Florist hand-finishing a personalized bouquet"
              className="h-full w-full object-cover object-[center_30%] sm:object-[center_40%]"
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent sm:w-24 lg:w-32"
              aria-hidden="true"
            />
          </div>

          <div className="relative z-10 flex w-[44%] flex-col justify-center gap-1 px-3 py-2 text-right sm:w-auto sm:max-w-sm sm:gap-3 sm:px-8 sm:py-6 lg:max-w-md lg:px-10">
            <h2 className="font-serif text-xs font-bold uppercase leading-tight tracking-tight text-stone-700 sm:text-2xl sm:leading-snug lg:text-2xl">
              Add a Personalized Touch
            </h2>
            <p className="hidden text-sm leading-relaxed text-stone-600 sm:block sm:text-base">
              Personalized gifts make every moment more meaningful.
            </p>
            <Link
              to="/shop"
              className="mt-1 inline-flex w-fit items-center gap-1.5 self-end rounded-full border border-stone-800 px-2.5 py-1 text-[9px] font-semibold text-stone-800 transition hover:bg-stone-800 hover:text-white sm:mt-2 sm:gap-2 sm:self-end sm:border-2 sm:px-6 sm:py-2.5 sm:text-sm"
            >
              Shop Gifts
            </Link>
           
          </div>
          
         
        </div>
      </section>

    </PublicLayout>
  );
}

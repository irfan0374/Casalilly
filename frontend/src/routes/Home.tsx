import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Flower2, Package, Smile, Sparkles } from "lucide-react";
import { getCategories, getProducts } from "../api/products";
import { getHeroSlides } from "../api/heroSlides";
import BestSellerCarousel from "../components/BestSellerCarousel";
import HeroSlideshow from "../components/HeroSlideshow";
import PublicLayout from "../components/PublicLayout";
import { categoryIcon, categoryImage, formatCategory } from "../lib/categories";
import storyImage from "../assets/image1.jpeg";
import personalizedImage from "../assets/personalized1.jpeg";
import type { HeroSlide, Product } from "../types";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProducts(),
      getProducts(undefined, true),
      getCategories(),
      getHeroSlides(),
    ])
      .then(([productData, featuredData, categoryData, heroData]) => {
        setProducts(productData);
        setFeaturedProducts(featuredData);
        setCategories(categoryData);
        setHeroSlides(heroData);
      })
      .catch(() => {
        setProducts([]);
        setFeaturedProducts([]);
        setCategories([]);
        setHeroSlides([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Lead with admin-curated best sellers, then top up with a random pick of
  // other products so the carousel always has enough items to scroll through
  // even when only one or two have been marked as featured. Capped at 4.
  const BEST_SELLERS_COUNT = 4;
  const featured = useMemo(() => {
    if (featuredProducts.length >= BEST_SELLERS_COUNT) {
      return featuredProducts.slice(0, BEST_SELLERS_COUNT);
    }
    const featuredIds = new Set(featuredProducts.map((p) => p.id));
    const fillers = products
      .filter((p) => !featuredIds.has(p.id))
      .sort(() => Math.random() - 0.5);
    return [
      ...featuredProducts,
      ...fillers.slice(0, BEST_SELLERS_COUNT - featuredProducts.length),
    ];
  }, [featuredProducts, products]);

const stats = [
      { icon: Flower2, value: `${products.length}+`, label: "Products Available" },
      { icon: Package, value: `${categories.length}`, label: "Categories" },
      { icon: Smile, value: "1000+", label: "Happy customer" },
      { icon: Sparkles, value: "Fresh", label: "Handpicked Daily" },
    ];

  const heroVisible = heroSlides.length > 0;

  return (
    <PublicLayout>

      
      {/* Hero section */}
      {heroVisible && <HeroSlideshow slides={heroSlides} />}

      {/* Stats / value props — floats up over the bottom of the hero image
          when a hero is shown, otherwise sits with normal top spacing. */}
      <section
        className={`relative z-10 mx-auto max-w-6xl px-4 ${
          heroVisible ? "-mt-16 sm:-mt-20" : "pt-8"
        }`}
      >
        <div className="grid grid-cols-4 gap-1.5 rounded-2xl bg-white p-2.5 shadow-xl shadow-black/10 sm:gap-4 sm:p-6">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center gap-0.5 py-1 text-center sm:gap-1 sm:py-3"
            >
              <s.icon
                className="h-4 w-4 text-rose-500 sm:h-6 sm:w-6"
                strokeWidth={2}
                aria-hidden="true"
              />
              <span className="text-sm font-bold text-stone-800 sm:text-xl">
                {s.value}
              </span>
              <span className="text-[9px] font-medium leading-tight text-stone-500 sm:text-xs">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>



      {/* Categories */}
      {categories.length > 0 && (
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
        </section>
      )}



      {/* Our story banner */}
 <section className="w-full sm:py-2 px-4 sm:px-6 lg:px-2 max-w-7xl mx-auto">
  <div className="relative flex h-36 w-full items-stretch overflow-hidden bg-[#f4e1cd] sm:h-48 lg:h-72 xl:h-80 rounded-2xl">
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
        className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#f4e1cd] to-transparent sm:w-24 lg:w-32"
        aria-hidden="true"
      />
    </div>
  </div>
</section>

    

      {/* Best sellers preview */}
      <section className="mx-auto max-w-6xl py-16">
        <div className="mb-8 flex items-center justify-between px-4">
          <h2 className="font-serif text-2xl font-bold text-stone-800 sm:text-3xl">
            Best Sellers
          </h2>
          <Link
            to="/shop"
            className="text-sm font-semibold text-rose-600 hover:underline"
          >
            View All →
          </Link>
        </div>

        {loading && (
          <p className="py-12 text-center text-stone-400">Loading…</p>
        )}

        {!loading && featured.length === 0 && (
          <p className="py-12 text-center text-stone-400">
            Products are coming soon — check back shortly!
          </p>
        )}

        {!loading && featured.length > 0 && (
          <BestSellerCarousel products={featured} />
        )}
      </section>




        {/* Personalized touch banner  */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 sm:py-2 lg:px-2">
        <div className="relative flex h-36 w-full items-stretch overflow-hidden rounded-2xl bg-[#e3e9da] sm:h-48 lg:h-72 xl:h-80">
          
           <div className="relative w-[56%] flex-1">
            <img
              src={personalizedImage}
              alt="Florist hand-finishing a personalized bouquet"
              className="h-full w-full object-cover object-[center_30%] sm:object-[center_40%]"
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#e3e9da] to-transparent sm:w-24 lg:w-32"
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

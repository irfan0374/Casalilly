import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Headset, Leaf, RotateCcw, ShieldCheck, type LucideIcon } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FEATURES: {
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    icon: ShieldCheck,
    title: "Healthy Plants",
    description: "Hand-picked, healthy plants for your space.",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "Hassle-free returns & replacement.",
  },
  {
    icon: Leaf,
    title: "Eco Friendly",
    description: "Sustainable, eco-friendly packaging.",
  },
  {
    icon: Headset,
    title: "Expert Support",
    description: "Get expert care advice whenever you need.",
  },
];

function FeatureItem({
  icon: Icon,
  title,
  description,
  align,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  align: "left" | "right";
}) {
  return (
    <div
      className={`flex max-w-[90px] flex-col items-center gap-1.5 text-center sm:max-w-[190px] sm:flex-row sm:items-start sm:gap-3 sm:text-left ${
        align === "right" ? "sm:flex-row-reverse sm:text-right" : ""
      }`}
    >
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-rose-50 ring-1 ring-rose-100 sm:h-10 sm:w-10">
        <Icon className="h-4 w-4 text-rose-500 sm:h-5 sm:w-5" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <div>
        <p className="text-[11px] font-semibold leading-tight text-stone-800 sm:text-sm">
          {title}
        </p>
        <p className="mt-0.5 hidden text-xs text-stone-500 sm:block">{description}</p>
      </div>
    </div>
  );
}

// Every frame of the turntable sequence, in filename order — Vite inlines
// each as a built asset URL at build time.
const FRAME_MODULES = import.meta.glob("../assets/rotateimage/*.jpg", {
  eager: true,
  import: "default",
}) as Record<string, string>;
const FRAME_URLS = Object.keys(FRAME_MODULES)
  .sort()
  .map((key) => FRAME_MODULES[key]);

/** Scroll-scrubbed product turntable: a compact, contained card (not a
 * full-screen pinned section) whose frame advances as the card scrolls
 * through the viewport — the "spins as you scroll" effect, driven by GSAP
 * ScrollTrigger rather than swapping 120 <img> elements. */
export default function RotatingPlantShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);

  // Frames only start downloading once the section is getting close —
  // ~3.5MB across 120 frames isn't something every homepage visitor should
  // pay for on page load if they never scroll this far.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShouldLoad(true);
      },
      { rootMargin: "150px 0px" }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section || FRAME_URLS.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = { frame: 0 };
    let currentDrawn = -1;
    let images: HTMLImageElement[] = [];

    function draw(index: number) {
      const img = images[index];
      if (!img || !img.complete || !img.naturalWidth) return;
      currentDrawn = index;
      const canvasW = canvas!.clientWidth * devicePixelRatio;
      const canvasH = canvas!.clientHeight * devicePixelRatio;
      if (canvas!.width !== canvasW) canvas!.width = canvasW;
      if (canvas!.height !== canvasH) canvas!.height = canvasH;
      const scale = Math.max(canvasW / img.width, canvasH / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx!.clearRect(0, 0, canvasW, canvasH);
      ctx!.drawImage(img, (canvasW - w) / 2, (canvasH - h) / 2, w, h);
    }

    function render() {
      const target = Math.min(FRAME_URLS.length - 1, Math.round(state.frame));
      if (target !== currentDrawn) draw(target);
    }

    if (shouldLoad) {
      images = FRAME_URLS.map((src) => {
        const img = new Image();
        img.src = src;
        return img;
      });
      images[0].onload = () => {
        setReady(true);
        draw(0);
      };
      if (images[0].complete) {
        setReady(true);
        draw(0);
      }
    }

    // No pin — the card just sits in normal flow, and the frame advances
    // as it passes through the viewport's middle band.
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top 85%",
      end: "bottom 35%",
      scrub: 0.4,
      onUpdate: (self) => {
        state.frame = self.progress * (FRAME_URLS.length - 1);
        render();
      },
    });

    const onResize = () => render();
    window.addEventListener("resize", onResize);

    return () => {
      trigger.kill();
      window.removeEventListener("resize", onResize);
    };
  }, [shouldLoad]);

  if (FRAME_URLS.length === 0) return null;

  return (
    <section ref={sectionRef} className="mx-auto max-w-5xl px-4 py-16">
      <h2 className="text-center font-serif text-2xl font-bold text-stone-800 sm:text-3xl">
        Why Choose Casa Lilly?
      </h2>

      <div className="mt-10 flex items-center justify-center gap-3 sm:gap-8 lg:gap-14">
        <div className="flex flex-col gap-6 sm:gap-10 sm:items-end">
          <FeatureItem align="right" {...FEATURES[0]} />
          <FeatureItem align="right" {...FEATURES[1]} />
        </div>

        <div className="relative h-48 w-36 flex-shrink-0 overflow-hidden rounded-3xl bg-stone-50 sm:h-80 sm:w-60 lg:h-96 lg:w-72">
          {!ready && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-200 border-t-rose-500" />
            </div>
          )}
          <canvas ref={canvasRef} className="h-full w-full" />
        </div>

        <div className="flex flex-col gap-6 sm:gap-10 sm:items-start">
          <FeatureItem align="left" {...FEATURES[2]} />
          <FeatureItem align="left" {...FEATURES[3]} />
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          to="/shop?category=plants"
          className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
        >
          Shop Indoor Plants
        </Link>
      </div>
    </section>
  );
}

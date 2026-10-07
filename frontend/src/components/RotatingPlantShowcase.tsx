import { useEffect, useRef, useState } from "react";
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
    title: "Healthy plants",
    description: "Hand-picked, healthy plants for your space.",
  },
  {
    icon: Leaf,
    title: "Eco-friendly packaging",
    description: "Sustainable, eco-friendly packaging.",
  },
  {
    icon: RotateCcw,
    title: "Easy returns",
    description: "Hassle-free returns & replacement.",
  },
  {
    icon: Headset,
    title: "Expert care advice",
    description: "Get expert care advice whenever you need.",
  },
];

function FeatureItem({ icon: Icon, title, description }: (typeof FEATURES)[number]) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-stone-100">
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-rose-50">
        <Icon className="h-5 w-5 text-rose-600" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <div>
        <p className="text-[15px] font-semibold text-stone-900">{title}</p>
        <p className="mt-0.5 text-sm text-stone-500">{description}</p>
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
    <section ref={sectionRef} className="mx-auto max-w-7xl px-4 pt-14 md:px-8 md:pt-20">
      <div className="rounded-3xl bg-stone-100/70 px-5 py-10 md:px-12 md:py-14">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-rose-700">
          The Casa Lilly standard
        </p>
        <h2 className="mt-2 text-center font-serif text-[28px] font-medium leading-tight text-stone-900 md:text-4xl">
          Why choose Casa Lilly
        </h2>

        <div className="mt-8 grid items-center gap-3 md:mt-12 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-10">
          <div className="order-2 min-w-0 flex flex-col gap-3 lg:order-1 md:gap-4">
            <FeatureItem {...FEATURES[0]} />
            <FeatureItem {...FEATURES[1]} />
          </div>

          {/* Portrait box — the turntable frames are 9:16, so a wide box
              would crop the plant. */}
          <div className="relative order-1 mx-auto mb-3 aspect-[3/4] w-56 lg:mb-0 overflow-hidden rounded-3xl bg-white lg:order-2 md:w-72 lg:w-80">
            {!ready && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-200 border-t-rose-500" />
              </div>
            )}
            <canvas ref={canvasRef} className="h-full w-full" />
          </div>

          <div className="order-3 min-w-0 flex flex-col gap-3 md:gap-4">
            <FeatureItem {...FEATURES[2]} />
            <FeatureItem {...FEATURES[3]} />
          </div>
        </div>
      </div>
    </section>
  );
}

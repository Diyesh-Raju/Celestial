"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, CalendarDays } from "lucide-react";
import { CONTACT } from "@/lib/data";
import { createMonolith, type MonolithApi } from "@/components/hero/monolithScene";

// The hero: the orbit globe ringed by stars, hanging between the two halves
// of the headline, with smoke drifting through it all (see hero/monolithScene.ts). The headline is a real <h1>; once the
// scene is running its letters go transparent and the canvas draws them
// in the same place, so the smoke can bend them and fill the outlined word.

/** Frame-time watchdog: this many frames slower than SLOW_FRAME_S switch to the light path. */
const SLOW_FRAME_S = 0.05;
const SLOW_FRAMES = 8;

/**
 * Paint the headline into a mask the size of the drawing surface, each word
 * exactly where the browser laid it out: solid words into R, outlined words'
 * strokes into G and their insides into B.
 */
function paintHeadline(root: HTMLElement, heading: HTMLElement, dpr: number) {
  const box = root.getBoundingClientRect();
  const w = Math.max(1, Math.round(box.width * dpr));
  const h = Math.max(1, Math.round(box.height * dpr));
  const cnv = document.createElement("canvas");
  cnv.width = w;
  cnv.height = h;
  const c = cnv.getContext("2d");
  if (!c) return null;
  c.fillStyle = "#000";
  c.fillRect(0, 0, w, h);
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.globalCompositeOperation = "lighter";
  c.textBaseline = "alphabetic";
  heading.querySelectorAll<HTMLElement>("[data-ink]").forEach((span) => {
    const cs = getComputedStyle(span);
    const r = span.getBoundingClientRect();
    const raw = span.textContent ?? "";
    const text = cs.textTransform === "uppercase" ? raw.toUpperCase() : raw;
    const fontPx = parseFloat(cs.fontSize) || 64;
    c.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    // An inline box is as tall as the font's ascent plus descent, so its top
    // plus the ascent is the baseline.
    const x = r.left - box.left;
    const y = r.top - box.top + (c.measureText(text).fontBoundingBoxAscent || fontPx * 0.8);
    if (span.dataset.ink === "outline") {
      c.fillStyle = "#00f";
      c.fillText(text, x, y);
      c.strokeStyle = "#0f0";
      c.lineWidth = Math.max(1.5, fontPx * 0.014);
      c.strokeText(text, x, y);
    } else {
      c.fillStyle = "#f00";
      c.fillText(text, x, y);
    }
  });
  return cnv;
}

function OrbitChip({ label, dot }: { label: string; dot: string }) {
  return (
    <span className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-paper/15 bg-burgundy-deep/80 px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-paper/80 backdrop-blur">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

/* The site's original orbit globe, recoloured to the brand: a glowing core
   with two counter-turning rings, their chips kept upright as they orbit. */
function Globe() {
  return (
    <div className="relative aspect-square w-full">
      {/* Core */}
      <div className="absolute inset-[34%] rounded-full bg-gradient-to-tr from-burgundy via-[#8A2846] to-taupe opacity-90 blur-[1px]" />
      <div className="absolute inset-[30%] rounded-full bg-gradient-to-tr from-[#8A2846]/50 to-taupe/40 blur-2xl" />
      <div className="absolute inset-[34%] rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(232,224,216,0.4),transparent_55%)]" />

      <div className="absolute inset-[18%] animate-spin-slow rounded-full border border-paper/15">
        <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
          <span className="block animate-[spin_30s_linear_infinite_reverse]">
            <OrbitChip label="Websites" dot="bg-taupe-light shadow-[0_0_10px_#d3c7bc]" />
          </span>
        </span>
      </div>
      <div className="absolute inset-[6%] animate-spin-slower rounded-full border border-dashed border-paper/10">
        <span className="absolute bottom-[14%] left-[6%]">
          <span className="block animate-[spin_60s_linear_infinite]">
            <OrbitChip label="CRM" dot="bg-[#C2304F] shadow-[0_0_10px_#C2304F]" />
          </span>
        </span>
        <span className="absolute right-[2%] top-[22%]">
          <span className="block animate-[spin_60s_linear_infinite]">
            <OrbitChip label="Meta · Google Ads" dot="bg-paper" />
          </span>
        </span>
      </div>
      <div className="absolute -inset-[6%] rounded-full border border-paper/[0.06]" />
    </div>
  );
}

export function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const heading = titleRef.current;
    if (!root || !canvas || !heading) return;
    // Without WebGL2 the hero stays as it renders: solid type on the CSS gradient.
    const probe = document.createElement("canvas").getContext("webgl2");
    if (!probe) return;
    probe.getExtension("WEBGL_lose_context")?.loseContext();

    let api: MonolithApi;
    try {
      api = createMonolith(canvas);
    } catch {
      return;
    }

    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let raf = 0;
    let last = 0;
    let inView = true;
    let lite = false;
    let judged = 0;
    let slow = 0;
    let lastClick = -1e9;

    let built = "";
    const layout = () => {
      const dpr = lite ? 1 : Math.min(window.devicePixelRatio || 1, 1.75);
      api.resize(root.clientWidth, root.clientHeight, dpr, lite);
      const box = root.getBoundingClientRect();
      const hb = heading.getBoundingClientRect();
      const outline = heading.querySelector<HTMLElement>("[data-ink='outline']")?.getBoundingClientRect() ?? hb;
      const toUvY = (y: number) => 1 - (y - box.top) / box.height;
      api.setLayout(toUvY((hb.top + hb.bottom) / 2), toUvY((outline.top + outline.bottom) / 2));
      // Repainting the mask is the slow part; skip it when nothing it depends on moved.
      const key = [box.width, box.height, dpr, hb.left - box.left, hb.top - box.top, hb.width, hb.height, getComputedStyle(heading).font].join("|");
      if (key === built) return;
      built = key;
      const mask = paintHeadline(root, heading, Math.min(dpr, 1.5));
      if (mask) api.setHeadline(mask);
    };

    const motion = () => !reduceMq.matches;
    const frame = (now: number) => {
      raf = 0;
      if (disposed) return;
      const raw = (now - last) / 1000;
      last = now;
      const dt = Math.min(raw, 0.05);
      if (!lite && judged < 60) {
        judged += 1;
        if (judged > 5 && raw > SLOW_FRAME_S) slow += 1;
        if (slow >= SLOW_FRAMES) {
          lite = true;
          built = "";
          layout();
        }
      }
      const box = root.getBoundingClientRect();
      api.render({
        dt,
        scroll: Math.min(1, Math.max(0, -box.top / box.height)),
        motion: motion(),
      });
      if (!root.dataset.ready) root.dataset.ready = "true";
      // Keep drawing while on screen; under reduced motion only for a few
      // seconds after a click.
      if (inView && !document.hidden && (motion() || now - lastClick < 4000)) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (raf || disposed) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const toUv = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      return { x: (e.clientX - r.left) / r.width, y: 1 - (e.clientY - r.top) / r.height };
    };
    const onDown = (e: PointerEvent) => {
      if ((e.target as Element).closest("a,button")) return;
      const p = toUv(e);
      api.burst(p.x, p.y);
      lastClick = performance.now();
      kick();
    };
    root.addEventListener("pointerdown", onDown);

    const onLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const onRestored = () => setGeneration((g) => g + 1);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    layout();
    kick();

    // The hero resizing, or the display font arriving after first paint,
    // both move the words.
    let pending = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(pending);
      pending = requestAnimationFrame(() => {
        if (disposed) return;
        layout();
        kick();
      });
    });
    ro.observe(root);
    document.fonts?.ready.then(() => {
      if (disposed) return;
      built = "";
      layout();
    });
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      if (inView) kick();
    });
    io.observe(root);
    const onVisibility = () => !document.hidden && kick();
    document.addEventListener("visibilitychange", onVisibility);
    reduceMq.addEventListener("change", kick);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(pending);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      reduceMq.removeEventListener("change", kick);
      root.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      api.dispose();
      delete root.dataset.ready;
    };
  }, [generation]);

  return (
    <section
      ref={rootRef}
      id="top"
      className="group relative w-full touch-pan-y overflow-hidden text-paper"
      style={{
        height: "max(640px, 100svh)",
        background: "radial-gradient(60% 50% at 50% 50%, #4A0F22 0%, transparent 70%), #14040A",
      }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        className="absolute inset-0 block h-full w-full opacity-0 transition-opacity duration-1000 ease-out group-data-[ready=true]:opacity-100"
      />

      <div className="pointer-events-none relative z-[1] flex h-full flex-col px-5 pb-8 pt-28 @container md:px-0 md:pb-10 md:pt-32">
        {/* The rows above and below line up with the navbar; the headline runs wider. */}
        <div className="rise mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 md:px-8">
          <span className="inline-flex h-8 items-center rounded-full border border-paper/20 bg-paper/[0.06] px-4 text-[12px] font-medium uppercase tracking-[0.14em] text-paper/80 backdrop-blur-md">
            Websites · CRMs · Ads
          </span>
          <div className="ml-auto flex items-center gap-5">
            <span className="hidden text-[11px] uppercase tracking-[0.22em] text-paper/45 md:block">
              Click to ignite
            </span>
            <a
              href={CONTACT.walkthrough}
              target="_blank"
              rel="noopener noreferrer"
              className="border-sweep group/cal pointer-events-auto inline-flex rounded-full p-px shadow-[0_0_32px_-8px_rgba(196,121,139,0.6)] transition hover:-translate-y-0.5 hover:shadow-[0_0_40px_-4px_rgba(196,121,139,0.85)] active:scale-[0.97]"
            >
              <span className="flex h-10 items-center gap-2 rounded-full bg-[linear-gradient(135deg,#4A0F22,#22060E)] pl-3.5 pr-4 text-[14px] font-semibold text-paper">
                <CalendarDays className="h-4 w-4 text-rose" />
                Book a walkthrough
                <ArrowUpRight className="h-4 w-4 text-paper/70 transition-transform group-hover/cal:-translate-y-0.5 group-hover/cal:translate-x-0.5" />
              </span>
            </a>
          </div>
        </div>

        {/* Two halves of the headline either side of the globe: stacked above
            and below it on phones, staggered left and right of it on wider
            screens, sized so the longer word just fits its half beside the globe. */}
        <div className="relative flex flex-1 flex-col">
          <div
            aria-hidden
            className="rise absolute left-1/2 top-1/2 w-[min(26svh,72vw)] -translate-x-1/2 -translate-y-1/2 [--delay:150ms] md:w-[22vh]"
          >
            <Globe />
          </div>
          <h1
            ref={titleRef}
            className="relative flex flex-1 flex-col justify-center gap-[33svh] py-8 text-center font-condensed text-[clamp(3.25rem,16vw,6rem)] uppercase leading-[0.9] tracking-[0.005em] md:gap-[0.55em] md:px-10 md:text-[length:clamp(3.5rem,calc((50cqw-40px-12vh)/4.75),11rem)]"
          >
            <span className="block md:pr-[calc(50%+12vh)] md:text-right">
              <span
                data-ink="solid"
                className="text-paper transition-colors duration-1000 group-data-[ready=true]:text-transparent"
              >
                Growth,
              </span>
            </span>{" "}
            <span className="block md:pl-[calc(50%+12vh)] md:text-left">
              <span
                data-ink="outline"
                className="text-transparent transition-[-webkit-text-stroke-color] duration-1000 [-webkit-text-stroke:max(1.5px,0.014em)_var(--color-paper)] group-data-[ready=true]:[-webkit-text-stroke-color:transparent]"
              >
                engineered.
              </span>
            </span>
          </h1>
        </div>

        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:flex-row md:items-end md:justify-between md:px-8">
          <p className="rise max-w-md text-base leading-relaxed text-paper/75 [--delay:120ms] md:text-lg">
            High-performance websites, custom CRMs and ad systems that work as one engine — built to turn attention
            into revenue.
          </p>
          <div className="rise pointer-events-auto flex flex-wrap gap-3 [--delay:200ms]">
            <a
              href="/contact"
              className="group/btn inline-flex h-12 items-center gap-2 rounded-full bg-paper px-6 text-[15px] font-semibold text-burgundy transition hover:bg-cream active:scale-[0.97]"
            >
              Start a project
              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
            </a>
            <a
              href="/portfolio"
              className="inline-flex h-12 items-center rounded-full border border-paper/25 bg-paper/[0.07] px-6 text-[15px] font-semibold text-paper backdrop-blur-md transition hover:border-paper/40 hover:bg-paper/[0.13] active:scale-[0.97]"
            >
              View selected work
            </a>
          </div>
        </div>
      </div>

      <a
        href="#services"
        className="absolute inset-x-0 bottom-10 z-[2] mx-auto hidden w-fit items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-paper/50 transition hover:text-paper lg:flex"
      >
        <ArrowDown className="h-3.5 w-3.5 animate-bounce" /> Scroll
      </a>
    </section>
  );
}

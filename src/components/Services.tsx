"use client";

import Image from "next/image";
import { Bot, CodeXml, Globe, Handshake, Megaphone, Search, type LucideIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { MacBook } from "./MacBook";
import { Reveal, SectionLabel } from "./Reveal";
import { clamp01, easeOutCubic, range, smoothDamp, smoothstep, type Pt } from "./studio/motion";

// The six products on the home page, each titled "(icon) Title"
const items: { Icon: LucideIcon; title: string; text: string }[] = [
  {
    Icon: Globe,
    title: "Bespoke Website Development",
    text: "Fast, custom-built websites and storefronts designed to turn visitors into customers.",
  },
  {
    Icon: Handshake,
    title: "Custom CRM",
    text: "Your pipeline, contacts, quotes and follow-ups in one system shaped around your team.",
  },
  {
    Icon: Megaphone,
    title: "Meta Ads",
    text: "Facebook and Instagram campaigns tracked all the way to revenue, not just clicks.",
  },
  {
    Icon: Search,
    title: "SEO, AEO & GEO Services",
    text: "Get found on Google, in answer boxes and in AI search like ChatGPT and Gemini.",
  },
  {
    Icon: CodeXml,
    title: "Custom Software Development",
    text: "Internal tools and platforms built for the jobs off-the-shelf software can't do.",
  },
  {
    Icon: Bot,
    title: "Agentic AI Bots & Workflows",
    text: "AI agents that answer, qualify and act around the clock, wired into your workflows.",
  },
];

/* Scroll choreography, as shares of the pinned run (the track's height minus one screen) */
const ZOOM: Pt = [0.05, 0.42]; // the camera moves into the MacBook until its picture fills the screen
const BLUR: Pt = [0.47, 0.64]; // the picture blurs and dims
const BOXES = 0.6; // the boxes start coming down
const BOX_DUR = 0.22; // how long each box takes to land
const ROW_LAG = 0.04; // the top row follows the bottom one down...
const COL_LAG = 0.015; // ...and each column the one to its left
/** How long (s) the animation trails the scroll. */
const SMOOTH_TIME = 0.16;
/** The top of the MacBook's display that the notch sits in, as a share of its height;
    below it the display is 16:10. */
const NOTCH_STRIP = 0.033;

/** Where the sequence runs; must match the media query of the "Home page products" rules in globals.css. */
const DESKTOP = "(min-width: 64rem) and (orientation: landscape)";

type Parts = Record<"stage" | "head" | "mac" | "screen" | "shot" | "soft" | "blur" | "glare" | "dim" | "grid", HTMLElement> & {
  track: HTMLElement;
  cards: HTMLElement[];
};

/** Finds the pieces the sequence moves, by their class names. */
function findParts(track: HTMLElement): Parts | null {
  const sel = {
    stage: ".svc-stage",
    head: ".svc-head",
    mac: ".svc-mac",
    screen: ".mbp-screen",
    shot: ".svc-shot",
    soft: ".svc-soft",
    blur: ".svc-blur",
    glare: ".mbp-glare",
    dim: ".svc-dim",
    grid: ".svc-grid",
  } as const;
  const found: Partial<Parts> = { track, cards: [...track.querySelectorAll<HTMLElement>(".svc-grid > li")] };
  for (const [k, s] of Object.entries(sel) as [keyof typeof sel, string][]) {
    const el = track.querySelector<HTMLElement>(s);
    if (!el) return null;
    found[k] = el;
  }
  return found as Parts;
}

/**
 * Drives the desktop sequence and returns its cleanup. The stage pins with the
 * heading over the MacBook; scrolling on, the camera moves into the MacBook (one
 * straight zoom about the point that brings its screen to the stage's centre) until
 * the picture fills the screen, then the picture blurs and the six boxes come down
 * from the top and land. Everything moves by transform and opacity only.
 *
 * The camera aims at the display below the notch's strip, which is 16:10, so the
 * notch has left the stage by the end. The stage is usually wider than that, so the
 * display's top and bottom leave the stage before its sides. The photo is kept
 * covering just the part of the display still on the stage, so it fills the stage
 * exactly at the end (its lit top and bottom edges in view) while the bezel carries
 * on past the sides.
 */
function play(el: Parts) {
  const root = document.documentElement;
  let W = 0;
  let H = 0;
  let run = 1; // pinned scroll distance
  let mac0: Pt = [0, 0]; // the MacBook's top left at rest, on the stage
  let scr = { x: 0, y: 0, w: 1, h: 1 }; // its display at rest, on the stage
  let shot: Pt = [1, 1]; // the photo's box, in the screen's own pixels
  let sEnd = 1; // zoom at which the screen covers the stage
  let focus: Pt = [0, 0]; // the stage point the camera zooms about
  let drop = 0; // how far the boxes travel: from just above the stage into place
  let slots: { row: number; col: number }[] = [];
  let navHidden = false;

  const measure = () => {
    el.mac.style.transform = el.shot.style.transform = "";
    for (const c of el.cards) c.style.transform = "none";
    W = el.stage.clientWidth;
    H = el.stage.clientHeight;
    run = Math.max(1, el.track.offsetHeight - H);
    const st = el.stage.getBoundingClientRect();
    const m = el.mac.getBoundingClientRect();
    const s = el.screen.getBoundingClientRect();
    mac0 = [m.left - st.left, m.top - st.top];
    scr = { x: s.left - st.left, y: s.top - st.top, w: s.width, h: s.height };
    shot = [el.shot.offsetWidth, el.shot.offsetHeight];
    const th = scr.h * (1 - NOTCH_STRIP); // the 16:10 part under the notch's strip
    sEnd = Math.max(W / scr.w, H / th) * 1.004;
    const c: Pt = [scr.x + scr.w / 2, scr.y + scr.h - th / 2];
    focus = [(W / 2 - sEnd * c[0]) / (1 - sEnd), (H / 2 - sEnd * c[1]) / (1 - sEnd)];
    // The grid's rows and columns, from where each box sits once landed
    const g = el.grid.getBoundingClientRect();
    drop = g.bottom - st.top + 40;
    const lefts = [...new Set(el.cards.map((c) => Math.round(c.getBoundingClientRect().left)))].sort((a, b) => a - b);
    slots = el.cards.map((c) => {
      const r = c.getBoundingClientRect();
      return { row: r.top > g.top + g.height / 3 ? 1 : 0, col: lefts.indexOf(Math.round(r.left)) };
    });
  };

  const render = (y: number) => {
    const p = clamp01(y / run);
    const z = smoothstep(range(p, ZOOM[0], ZOOM[1]));

    // The heading drifts up and fades as the MacBook grows over it
    const h = smoothstep(range(z, 0, 0.3));
    el.head.style.opacity = String(1 - h);
    el.head.style.transform = h ? `translate(0,${(-h * H * 0.05).toFixed(2)}px)` : "";
    el.glare.style.opacity = String(1 - range(z, 0, 0.45));

    if (z <= 0) {
      el.mac.style.transform = el.shot.style.transform = "";
    } else {
      // Camera: scale eases geometrically so the move feels even all the way in
      const s = sEnd ** z;
      el.mac.style.transform = `translate(${((focus[0] - mac0[0]) * (1 - s)).toFixed(2)}px,${((focus[1] - mac0[1]) * (1 - s)).toFixed(2)}px) scale(${s.toFixed(5)})`;

      // The screen now, and the part of it still on the stage, in its own pixels
      const sx = focus[0] + (scr.x - focus[0]) * s;
      const sy = focus[1] + (scr.y - focus[1]) * s;
      const x0 = (Math.max(0, sx) - sx) / s;
      const y0 = (Math.max(0, sy) - sy) / s;
      const x1 = (Math.min(W, sx + scr.w * s) - sx) / s;
      const y1 = (Math.min(H, sy + scr.h * s) - sy) / s;
      // The photo covers that part, centred on it
      const k = Math.max((x1 - x0) / shot[0], (y1 - y0) / shot[1]);
      const dx = (x0 + x1) / 2 - scr.w / 2;
      const dy = (y0 + y1) / 2 - scr.h / 2;
      el.shot.style.transform = `translate(${dx.toFixed(2)}px,${dy.toFixed(2)}px) scale(${k.toFixed(5)})`;
    }

    // Blur: the sharp photo gives way to a soft copy, then a heavily blurred one
    const b = range(p, BLUR[0], BLUR[1]);
    el.soft.style.opacity = smoothstep(range(b, 0, 0.55)).toFixed(3);
    el.blur.style.opacity = smoothstep(range(b, 0.35, 1)).toFixed(3);
    el.dim.style.opacity = smoothstep(b).toFixed(3);

    // The boxes come down from above the screen and land, bottom row first
    el.cards.forEach((card, i) => {
      const { row, col } = slots[i];
      const a = BOXES + (1 - row) * ROW_LAG + col * COL_LAG;
      const q = range(p, a, a + BOX_DUR);
      card.style.visibility = q > 0 ? "visible" : "hidden";
      card.style.transform = q >= 1 ? "none" : `translate(0,${(-(1 - easeOutCubic(q)) * drop).toFixed(2)}px)`;
    });
  };

  // Spring-follow the scroll so the sequence glides rather than steps
  const read = () => Math.min(run, Math.max(-H, -el.track.getBoundingClientRect().top));
  let target = 0;
  let cur = 0;
  let vel = 0;
  let raf = 0;
  let last = 0;

  // The navbar steps aside while the stage is pinned (see .site-header in globals.css)
  const syncNav = () => {
    const r = el.track.getBoundingClientRect();
    const pinned = r.top <= 0.5 && r.bottom >= H - 0.5;
    if (pinned !== navHidden) {
      navHidden = pinned;
      root.toggleAttribute("data-nav-hidden", pinned);
    }
  };

  const tick = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    [cur, vel] = smoothDamp(cur, target, vel, dt, SMOOTH_TIME);
    if (Math.abs(target - cur) < 0.3 && Math.abs(vel) < 2) {
      cur = target;
      vel = 0;
      raf = 0;
    } else {
      raf = requestAnimationFrame(tick);
    }
    render(cur);
  };

  const onScroll = () => {
    syncNav();
    target = read();
    if (!raf && target !== cur) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  };

  const onResize = () => {
    measure();
    target = cur = read();
    vel = 0;
    render(cur);
    syncNav();
  };

  onResize();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);

  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    cancelAnimationFrame(raf);
    if (navHidden) root.removeAttribute("data-nav-hidden");
    for (const node of Object.values(el).flat()) {
      if (node === el.track) continue;
      node.style.transform = node.style.opacity = node.style.visibility = "";
    }
  };
}

/* The glyph's shading inside each glass tile: soft white at the top left warming to
   the wall's amber at the bottom right. userSpaceOnUse (the icons' 24×24 grid) so
   straight strokes, whose boxes have no width or height, still get painted. Not
   display:none, which would stop the gradient from rendering. */
function GlyphGradient() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <defs>
        <linearGradient id="glass-glyph" gradientUnits="userSpaceOnUse" x1="3" y1="2" x2="21" y2="22">
          <stop offset="0" stopColor="#fffaf4" />
          <stop offset="0.5" stopColor="#f4e2d0" />
          <stop offset="1" stopColor="#eaa970" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** A frosted-glass tile holding the product's line icon (styles: .glass-icon in globals.css) */
function GlassIcon({ Icon }: { Icon: LucideIcon }) {
  return (
    <span aria-hidden className="glass-icon size-11 shrink-0 xl:size-[clamp(2.5rem,3.25vw,5.25rem)]">
      <Icon color="url(#glass-glyph)" strokeWidth={1.6} />
    </span>
  );
}

/** Our products & services: the quote, a MacBook showing the sealed-envelope photo, and
    the six products on glass.

    On landscape screens from lg up the section pins (see play above and "Home page
    products" in globals.css): the camera moves into the MacBook until the photo fills
    the screen, the photo blurs, and the six boxes come down from the top and land
    in the middle of it, three across and two down. Elsewhere, and with reduced motion, it is a
    column: the heading, the MacBook, then the boxes on the blurred photo. */
export function Services() {
  const trackRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const parts = trackRef.current && findParts(trackRef.current);
    if (!parts) return;
    const desktop = window.matchMedia(DESKTOP);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let stop: (() => void) | undefined;
    const sync = () => {
      stop?.();
      stop = desktop.matches && !reduce.matches ? play(parts) : undefined;
    };
    sync();
    desktop.addEventListener("change", sync);
    reduce.addEventListener("change", sync);
    return () => {
      stop?.();
      desktop.removeEventListener("change", sync);
      reduce.removeEventListener("change", sync);
    };
  }, []);

  return (
    <section ref={trackRef} id="services" aria-labelledby="services-title" className="svc relative scroll-mt-24">
      <div className="svc-stage relative overflow-clip">
        <div className="pointer-events-none absolute -right-40 top-40 h-[460px] w-[640px] rounded-full bg-burgundy/[0.05] blur-[120px]" />

        <div className="svc-head relative px-6 pb-12 pt-24 md:pb-16 md:pt-32">
          <Reveal className="mx-auto max-w-6xl text-center">
            <SectionLabel>Our products &amp; services</SectionLabel>
            <h2
              id="services-title"
              className="svc-title mx-auto mt-5 max-w-4xl text-balance font-display text-4xl font-semibold leading-[1.08] tracking-[-0.03em] text-burgundy md:text-6xl"
            >
              Everything your business needs to lead, <span className="text-shine">crafted under one roof.</span>
            </h2>
            {/* The underline from the sketch, drawn in by hand */}
            <svg aria-hidden viewBox="0 0 320 18" className="svc-rule mx-auto mt-6 h-3 w-48 overflow-visible md:mt-8 md:w-72" fill="none">
              <path
                d="M4 12 C70 4 150 3 214 7 C252 9 288 11 316 6"
                pathLength={1}
                className="svc-draw stroke-burgundy-light"
                strokeWidth={3}
                strokeLinecap="round"
              />
            </svg>
            <p className="svc-hint mt-4 text-[13px] tracking-[0.02em] text-taupe-dark md:mt-5">Scroll to discover</p>
          </Reveal>
        </div>

        {/* The MacBook, its screen showing the envelope photo (public/products/envelope*.webp) */}
        <div className="svc-mac-area relative px-6 pb-16 md:pb-24">
          <div className="svc-mac relative mx-auto w-full max-w-3xl">
            <MacBook>
              <div className="svc-shot">
                <Image src="/products/envelope.webp" alt="" fill unoptimized sizes="100vw" className="object-cover" />
                <Image src="/products/envelope-soft.webp" alt="" fill unoptimized sizes="100vw" className="svc-soft object-cover" />
                <Image src="/products/envelope-blur.webp" alt="" fill unoptimized sizes="100vw" className="svc-blur object-cover" />
              </div>
            </MacBook>
          </div>
        </div>

        {/* The six products. In the column they sit on the blurred photo; on desktop this
            is a layer over the stage that they come down into. */}
        <div className="svc-panel relative isolate overflow-hidden px-6 pb-20 pt-20 sm:pb-24">
          <div aria-hidden className="svc-panel-bg absolute inset-0 -z-20 [mask-image:linear-gradient(to_bottom,transparent,#000_5rem)]">
            <Image src="/products/envelope-blur.webp" alt="" fill unoptimized sizes="100vw" className="object-cover" />
          </div>
          <div aria-hidden className="svc-dim absolute inset-0 -z-10 bg-[#2a0c14]/35 [mask-image:linear-gradient(to_bottom,transparent,#000_5rem)]" />
          <GlyphGradient />
          <ul className="svc-grid relative mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {items.map((item, i) => (
              <li key={item.title} className="flex">
                <Reveal delay={(i % 3) * 0.06 + Math.floor(i / 3) * 0.08} className="flex w-full">
                  <div className="flex w-full flex-col gap-3 rounded-[1.75rem] border border-paper/20 bg-[linear-gradient(145deg,rgba(232,224,216,0.17),rgba(232,224,216,0.05))] p-5 text-paper shadow-[inset_0_1px_0_rgba(232,224,216,0.28),0_24px_50px_-28px_rgba(20,4,10,0.75)] backdrop-blur-md transition-[background-color,border-color] duration-300 hover:border-paper/35 sm:p-6 xl:justify-between xl:gap-4 xl:rounded-[clamp(1.75rem,2.2vw,3.25rem)] xl:p-[clamp(1.25rem,1.9vw,3.25rem)]">
                    <h3 className="flex items-center gap-3 font-display text-lg font-semibold leading-tight tracking-[-0.015em] xl:gap-[clamp(0.625rem,0.9vw,1.5rem)] xl:text-[clamp(1.0625rem,1.35vw,2.25rem)]">
                      <GlassIcon Icon={item.Icon} />
                      {item.title}
                    </h3>
                    <p className="text-[14px] leading-relaxed text-paper/75 xl:text-[clamp(0.875rem,1.05vw,1.75rem)]">{item.text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

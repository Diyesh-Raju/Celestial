"use client";

import Image from "next/image";
import { Cpu, Network, Sparkles, TrendingUp } from "lucide-react";
import { useEffect, useRef } from "react";
import { LogoMark } from "./Navbar";
import {
  clamp01,
  easeOutCubic,
  easeOutQuint,
  lerp,
  range,
  rectToQuad,
  smoothDamp,
  smoothstep,
  type Pt,
  type Quad,
} from "./studio/motion";

// The standards every build ships with, shown on the banner before it zooms out
const points = [
  {
    icon: Sparkles,
    tag: "Motion",
    title: "Smooth animations",
    text: "Fluid, purposeful motion that makes your brand feel premium and keeps visitors scrolling.",
  },
  {
    icon: TrendingUp,
    tag: "Visibility",
    title: "Top-tier SEO",
    text: "Fast pages, clean structure and technical SEO so customers find you before your competitors.",
  },
  {
    icon: Network,
    tag: "Integration",
    title: "Connected systems",
    text: "Website, CRM, ads and tools talking to each other, so no lead or data point slips through.",
  },
  {
    icon: Cpu,
    tag: "Evolution",
    title: "Better technology",
    text: "We replace outdated tools with a modern stack your business can keep growing on.",
  },
];

/* The studio photo (public/studio/room.webp) and its monitor's screen, measured in
   the photo's own pixels. The file is stored at 2x (3200x1800) so it stays sharp on
   retina screens and through the zoom; these numbers are its 1x frame. The camera
   sees the monitor at a slight angle, so the screen is a trapezoid: its right edge
   is further away and shorter. */
const ROOM_W = 1600;
const ROOM_H = 900;
const SCREEN: Quad = [
  [543.5, 333.5],
  [1009.5, 339],
  [1009.5, 488.5],
  [543.5, 523.5],
];
const SCREEN_W = SCREEN[1][0] - SCREEN[0][0];
/* Where public/studio/screen.webp sits in the photo: this same screen once the
   banner has landed, pre-rendered at 3x so its small type stays sharp at rest */
const SCREEN_IMG = { x: 542, y: 332, w: 469, h: 193 };
const SCREEN_MID: Pt = [(SCREEN[0][0] + SCREEN[1][0]) / 2, (SCREEN[0][1] + SCREEN[1][1] + SCREEN[2][1] + SCREEN[3][1]) / 4];
/** Width-to-height of the banner once it is on the monitor. */
const SCREEN_ASPECT = 2.75;

/* Scroll choreography, as shares of the pinned run (the track's height minus one screen) */
const POINTS_OUT: Pt = [0.06, 0.24]; // the four points leave and the headline settles
const ZOOM: Pt = [0.27, 0.9]; // the camera pulls back from the banner to the whole room
const LAND = 0.45; // share of the zoom by which the banner has settled onto the screen
/** Where the headline block's centre sits on the bare banner, as a share of its height. */
const HEAD_REST = 0.48;
/* On the monitor the small type would shrink to a few pixels, so it grows as the
   banner lands, the way a banner made for an ultrawide screen is set. If these
   change, re-bake the monitor in room.webp and screen.webp. */
const GROW = { brand: 1.7, head: 1.4, signoff: 1.8, emblem: 1.2, rule: 3 };
/** Share of the zoom over which the live banner hands over to screen.webp. */
const HANDOFF: Pt = [0.82, 0.97];
/** How long (s) the animation trails the scroll. */
const SMOOTH_TIME = 0.16;

/** Where the sequence runs; must match the media queries of the "Studio banner" rules in globals.css. */
const DESKTOP = "(min-width: 64rem) and (orientation: landscape)";

type Parts = Record<
  | "stage"
  | "room"
  | "screen"
  | "banner"
  | "bg"
  | "glass"
  | "brand"
  | "rule"
  | "center"
  | "head"
  | "thread"
  | "cue"
  | "right"
  | "emblem"
  | "signoff",
  HTMLElement
> & { track: HTMLElement; cards: HTMLElement[] };

/** Finds the pieces the sequence moves, by their studio-* class names. */
function findParts(track: HTMLElement): Parts | null {
  const names = [
    "stage",
    "room",
    "screen",
    "banner",
    "bg",
    "glass",
    "brand",
    "rule",
    "center",
    "head",
    "thread",
    "cue",
    "right",
    "emblem",
    "signoff",
  ] as const;
  const found: Partial<Parts> = { track, cards: [...track.querySelectorAll<HTMLElement>(".studio-cards li")] };
  for (const n of names) {
    const el = track.querySelector<HTMLElement>(`.studio-${n}`);
    if (!el) return null;
    found[n] = el;
  }
  return found as Parts;
}

/**
 * Drives the desktop sequence and returns its cleanup. The banner starts as the
 * full screen; scrolling on, its points leave, then the room photo pulls back and
 * the banner settles onto the monitor. Everything moves by transform only.
 *
 * The banner keeps its full-screen layout box throughout. To end up as wide as
 * the monitor it is drawn as a wider virtual box: the background stretches, the
 * centre column shifts by half the extra width and the right column by all of it,
 * and the perspective transform then maps that virtual box onto the screen.
 */
function play(el: Parts) {
  const root = document.documentElement;
  let W = 0;
  let H = 0;
  let run = 1; // pinned scroll distance
  let headShift = 0; // how far the headline drops once the points have gone
  let s1 = 1; // room scale at the end: the photo covers the stage
  let o1: Pt = [0, 0]; // ...and its offset
  let zoom0 = 1; // how much closer the camera starts (the monitor spans the stage width)
  let focus: Pt = [0, 0]; // the screen point the camera pulls back from
  let fit = 1; // makes up for --u running under 1vh on narrower windows, so the landed banner matches screen.webp
  let navHidden = false;

  const measure = () => {
    W = el.stage.clientWidth;
    H = el.stage.clientHeight;
    run = Math.max(1, el.track.offsetHeight - H);
    headShift = H * HEAD_REST - (el.head.offsetTop + el.head.offsetHeight / 2);
    s1 = Math.max(W / ROOM_W, H / ROOM_H);
    o1 = [(W - ROOM_W * s1) / 2, (H - ROOM_H * s1) / 2];
    zoom0 = Math.max(1.001, W / (SCREEN_W * s1));
    fit = H / 100 / Math.min(H / 100, W * 0.006); // --u is min(1vh, 0.6vw)
    // Zoom about the one point that takes the monitor from the stage's centre to
    // its place in the final frame, so the pull-back is a straight camera move
    const end: Pt = [o1[0] + SCREEN_MID[0] * s1, o1[1] + SCREEN_MID[1] * s1];
    focus = [(W / 2 - zoom0 * end[0]) / (1 - zoom0), (H / 2 - zoom0 * end[1]) / (1 - zoom0)];
  };

  const render = (y: number) => {
    const enter = clamp01((y + H) / H); // 0 → 1 while the banner rises into view
    const p = clamp01(y / run); // 0 → 1 across the pinned run
    const z = smoothstep(range(p, ZOOM[0], ZOOM[1])); // camera pull-back
    // Banner settling onto the screen: a steep ease-out, so it closes the last few
    // pixels quickly and the monitor's bezel shows early
    const k = easeOutQuint(clamp01(z / LAND));

    // The headline and the points rise in with the banner, then the points leave
    // one after another and the headline drops to the banner's centre
    const headIn = easeOutCubic(range(enter, 0.3, 0.85));
    const out = range(p, POINTS_OUT[0], POINTS_OUT[1]);
    const headY = (1 - headIn) * 36 + smoothstep(out) * headShift;
    el.head.style.opacity = String(headIn);
    el.head.style.transform = `translate(0,${headY.toFixed(2)}px) scale(${lerp(1, GROW.head * fit, k).toFixed(4)})`;
    el.thread.style.opacity = String(Math.min(easeOutCubic(range(enter, 0.5, 1)), 1 - smoothstep(range(out, 0, 0.6))));
    // The scroll cue arrives last and stays on the bare banner, leaving as the camera starts to pull back
    el.cue.style.opacity = String(easeOutCubic(range(enter, 0.6, 1)) * (1 - smoothstep(range(p, ZOOM[0], ZOOM[0] + 0.04))));
    el.cards.forEach((card, i) => {
      const cin = easeOutCubic(range(enter, 0.4 + i * 0.06, 0.8 + i * 0.06));
      const cout = smoothstep(range(out, i * 0.1, 0.7 + i * 0.1));
      const o = cin * (1 - cout);
      card.style.opacity = String(o);
      card.style.visibility = o < 0.002 ? "hidden" : "";
      card.style.transform = `translate(0,${((1 - cin) * 48 + cout * 32).toFixed(2)}px) scale(${(1 - cout * 0.04).toFixed(4)})`;
    });

    if (z <= 0) {
      for (const n of ["banner", "bg", "glass", "center", "right", "brand", "rule", "emblem", "signoff"] as const) el[n].style.transform = "";
      el.glass.style.opacity = "0";
      el.banner.style.opacity = el.banner.style.visibility = "";
      el.room.style.visibility = "";
      return;
    }

    // Camera: scale eases geometrically so the pull-back feels even all the way
    const s = s1 * zoom0 ** (1 - z);
    const ox = focus[0] - (focus[0] - o1[0]) * (s / s1);
    const oy = focus[1] - (focus[1] - o1[1]) * (s / s1);
    el.room.style.visibility = "visible";
    el.room.style.transform = `translate3d(${ox.toFixed(2)}px,${oy.toFixed(2)}px,0) scale(${s.toFixed(5)})`;

    // Banner: its corners travel from the stage's corners to the screen's, landing
    // early in the zoom and riding the monitor from then on
    const corners: Quad = [
      [0, 0],
      [W, 0],
      [W, H],
      [0, H],
    ];
    const quad = corners.map(([cx, cy], i) => [
      lerp(cx, ox + SCREEN[i][0] * s, k),
      lerp(cy, oy + SCREEN[i][1] * s, k),
    ]) as unknown as Quad;
    const wide = H * lerp(W / H, SCREEN_ASPECT, k); // the virtual box's width
    el.banner.style.transform = rectToQuad(wide, H, quad);
    el.bg.style.transform = el.glass.style.transform = `scale(${(wide / W).toFixed(5)},1)`;
    // Flat 2D moves only inside the banner: Safari gives any 3D-transformed child
    // its own plane instead of flattening it into the banner's perspective
    el.center.style.transform = `translate(${((wide - W) / 2).toFixed(2)}px,0)`;
    el.right.style.transform = `translate(${(wide - W).toFixed(2)}px,0)`;
    el.glass.style.opacity = k.toFixed(3);
    el.brand.style.transform = `scale(${lerp(1, GROW.brand * fit, k).toFixed(4)})`;
    el.rule.style.transform = `scale(1,${lerp(1, GROW.rule, k).toFixed(3)})`;
    el.emblem.style.transform = `translateY(-50%) scale(${lerp(1, GROW.emblem * fit, k).toFixed(4)})`;
    el.signoff.style.transform = `translateY(-50%) scale(${lerp(1, GROW.signoff * fit, k).toFixed(4)})`;

    // Shrunk this far, live text turns to mush (Safari) or jags, so as the camera
    // comes to rest the banner fades out over the identical pre-rendered screen
    const handoff = smoothstep(range(z, HANDOFF[0], HANDOFF[1]));
    el.banner.style.opacity = (1 - handoff).toFixed(3);
    el.banner.style.visibility = handoff >= 1 ? "hidden" : "";
  };

  // Spring-follow the scroll so the sequence glides rather than steps
  const read = () => Math.min(run, Math.max(-H, -el.track.getBoundingClientRect().top));
  let target = 0;
  let cur = 0;
  let vel = 0;
  let raf = 0;
  let last = 0;

  // The navbar steps aside while the banner is pinned (see .site-header in globals.css)
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
    root.removeAttribute("data-nav-hidden");
    for (const node of Object.values(el).flat()) {
      if (node === el.track) continue;
      node.style.transform = node.style.opacity = node.style.visibility = "";
    }
  };
}

/**
 * After the About section: the "Growth, engineered." banner rises in like a
 * full-screen picture. On desktop it then pins: its four points leave, and the
 * camera pulls back to show the banner is on the monitor of a studio desk. Phones
 * (and reduced motion) get the banner as a plain section, with no pin or zoom.
 */
export function Studio() {
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
    <section ref={trackRef} id="studio" aria-labelledby="studio-title" className="studio relative bg-[#0b0203]">
      <div className="studio-stage relative">
        {/* Desktop only: the room the camera pulls back into. Its monitor already
            shows this banner, so nothing jumps if the overlay is a pixel off. */}
        <div aria-hidden className="studio-room hidden">
          <Image src="/studio/room.webp" alt="" width={ROOM_W} height={ROOM_H} unoptimized className="block h-full w-full" />
          <Image
            src="/studio/screen.webp"
            alt=""
            width={SCREEN_IMG.w * 3}
            height={SCREEN_IMG.h * 3}
            unoptimized
            className="studio-screen absolute max-w-none"
            style={{ left: SCREEN_IMG.x, top: SCREEN_IMG.y, width: SCREEN_IMG.w, height: SCREEN_IMG.h }}
          />
        </div>

        {/* The banner. Phones (and portrait tablets) lay it out as a normal column;
            landscape screens from lg up see one full-screen picture (see "Studio
            banner" in globals.css). */}
        <div className="studio-banner relative isolate flex min-h-svh flex-col overflow-hidden px-6 pb-12 pt-28 text-paper sm:px-10">
          <div aria-hidden className="studio-bg absolute inset-0 -z-10" />

          {/* Left: the brand, and a rule along the bottom */}
          <div className="studio-left">
            <div className="studio-brand flex items-center gap-3">
              <LogoMark className="studio-mark h-9 w-9 text-[#c4928f]" />
              <span className="studio-wordmark font-brand text-[11px] uppercase leading-none tracking-[0.32em] text-[#dcc7bb]">
                Celestial Developers
              </span>
            </div>
            <span aria-hidden className="studio-rule hidden" />
          </div>

          {/* Centre: the headline, with the four points under it */}
          <div className="studio-center relative z-[1] flex flex-1 flex-col justify-center py-16">
            <div className="studio-head text-center">
              <h2
                id="studio-title"
                className="studio-title font-brand text-[clamp(1.9rem,9.2vw,3.6rem)] font-light uppercase leading-[1.15] tracking-[0.16em]"
              >
                <span className="block">Growth,</span> <span className="block">engineered.</span>
              </h2>
              <p className="studio-sub mx-auto mt-5 font-brand text-[10px] uppercase leading-loose tracking-[0.3em] text-[#bfa79e]">
                <span className="block sm:inline">Bespoke technology</span>
                <span className="hidden sm:inline">
                  <span className="mx-[1.1em]">·</span>
                </span>
                <span className="block sm:inline">
                  AI<span className="mx-[1.1em]">·</span>Digital growth
                </span>
              </p>
            </div>

            <div className="studio-cards relative mx-auto mt-12 w-full max-w-xl">
              {/* Threads the four cards together on wide screens */}
              <span aria-hidden className="studio-thread hidden" />
              <ul className="relative grid gap-3 sm:grid-cols-2">
                {points.map((pt, i) => (
                  <li
                    key={pt.tag}
                    className="relative rounded-2xl border border-paper/[0.09] bg-[#1b1012]/85 p-5 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)] transition-colors duration-300 hover:border-rose/40 lg:p-6"
                  >
                    <div className="mb-6 flex items-center justify-between lg:mb-8">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-paper/45">
                        {String(i + 1).padStart(2, "0")} · {pt.tag}
                      </span>
                      <pt.icon className={`h-5 w-5 ${i % 2 ? "text-taupe" : "text-rose"}`} strokeWidth={1.5} />
                    </div>
                    <h3 className="font-display text-lg font-semibold tracking-[-0.015em] text-paper lg:text-xl">{pt.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-paper/55">{pt.text}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Scroll cue, under the points (desktop) */}
            <div aria-hidden className="studio-cue hidden flex-col items-center font-brand uppercase leading-none tracking-[0.32em] text-paper/55">
              {/* The tracking trails the last letter; matching it in front keeps the word centred over the line */}
              <span className="pl-[0.32em]">Scroll</span>
              <span className="studio-cue-track relative w-px overflow-hidden bg-paper/15">
                <span className="absolute inset-x-0 top-0 h-1/2 animate-scroll-cue bg-gradient-to-b from-transparent to-rose" />
              </span>
            </div>
          </div>

          {/* Right: the embossed mark running off the edge, and the sign-off */}
          <div className="studio-right">
            <Image
              src="/studio/emblem.webp"
              alt=""
              width={1040}
              height={1040}
              unoptimized
              className="studio-emblem pointer-events-none absolute -right-[42%] top-[12%] -z-[5] w-[92%] max-w-[34rem] opacity-60 sm:-right-[20%] sm:w-[60%]"
            />
            <p className="studio-signoff flex items-center justify-end gap-3 pt-6 font-brand text-[10px] uppercase leading-none tracking-[0.28em] text-paper/75">
              <span aria-hidden className="h-px w-8 bg-gradient-to-r from-transparent to-[#9a4652]" />
              We are Celestial Developers
            </p>
          </div>

          {/* Screen glass: a faint sheen and dimming, faded in as the banner lands on the monitor */}
          <div aria-hidden className="studio-glass hidden" />
        </div>
      </div>
    </section>
  );
}

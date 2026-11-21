"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import { queueGpuSetup } from "@/lib/gpuQueue";
import { deviceLayout, WIPE_RIM, type StepPalette } from "./theme";
import type { PaintScreen } from "./paint";
import type { SceneApi } from "./macbookScene";

// A pinned story: a MacBook and an iPhone take turns across the screen, one
// step at a time, each with its own copy, colour and screen (the why-us section).
//
// Everything on screen is a function of one position p: 0 = the closed laptop
// under the intro heading, 1…N = the steps, fractions = the transitions between.
// Scrolling drives only the opening, 0 → 1: the laptop opens on step 01, holds a
// moment, then the section scrolls away into the next one. Steps 02…N are reached
// with the arrow buttons (or the progress rail), which play the same transitions
// on a timer; scrolling back up into the opening rewinds to the closed laptop.
//
// Scroll is measured in "units" of UNIT_VH: one unit opens the laptop (ending in
// a short rest), then HOLD more keeps step 01 pinned before the stage leaves.
const UNIT_VH = 320; // scroll distance for the opening, in vh (higher = slower)
const REST = 0.12; // still stretch at the end of the opening, in units
const HOLD = 0.15; // extra pinned scroll on step 01 before the stage leaves, in units
const SPAN = 1 + HOLD; // units of pinned scroll

export type StoryStep = {
  num: string;
  short: string; // progress rail label
  title: string;
  desc: string;
  tags: readonly string[];
  Icon: LucideIcon;
};

type Props = {
  /** Section label + h2, shown over the closed laptop before the first step. */
  heading: ReactNode;
  /** Short paragraph beside the heading. */
  sub: ReactNode;
  steps: readonly StoryStep[];
  /** Background and text colours: index 0 is the intro, then one per step. */
  palettes: readonly StepPalette[];
  /** Word before each step's number, e.g. "Capability" → "Capability 01". */
  stepLabel: string;
  /** Top bar text once the steps begin (phones get the short one). */
  topbar: { short: string; long: string };
  /** Loads the painter for the devices' screens (kept out of the page bundle). */
  loadScreens: () => Promise<PaintScreen>;
};

/** Scroll units → position (0 = intro, 1…n = steps, fractions = in between); called with n = 1 for the opening. */
function positionAt(u: number, n: number) {
  if (u >= n) return n;
  const k = Math.floor(Math.max(0, u));
  const local = u - k;
  const start = k === 0 ? 0 : REST; // the intro starts moving on the very first scroll
  return k + Math.min(1, Math.max(0, (local - start) / (1 - REST - start)));
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
/** How long the buttons take to play `units` steps of transition, in ms. */
const stepDuration = (units: number) => Math.min(2600, 300 + 1100 * units);
const pad = (n: number) => String(n).padStart(2, "0");

function paletteVars(p: StepPalette) {
  return {
    "--fg": p.fg,
    "--body": p.body,
    "--muted": p.muted,
    "--line": p.line,
    "--accent": p.accent,
    "--chip": p.chip,
  } as Record<string, string>;
}

/** Static markup; the animation loop positions it via the data-* hooks. */
function Panel({ step, data, palette, label }: { step: number; data: StoryStep; palette: StepPalette; label: string }) {
  const { Icon } = data;
  return (
    <div
      data-panel={step}
      className="absolute inset-x-0 top-0 will-change-transform md:top-1/2 md:-translate-y-1/2"
      style={{ ...paletteVars(palette), visibility: "hidden" } as CSSProperties}
    >
      <div data-item className="flex items-center gap-3 will-change-transform">
        <span className="grid h-11 w-11 place-items-center rounded-xl border border-[color:var(--line)] bg-[color:var(--chip)] text-[color:var(--accent)]">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </span>
        <span className="text-xs uppercase tracking-[0.22em] text-[color:var(--muted)]">
          {label} {data.num}
        </span>
      </div>

      <h3 className="mt-5 font-display text-[1.85rem] font-semibold leading-[1.06] tracking-[-0.03em] text-[color:var(--fg)] sm:text-4xl md:mt-7 md:text-5xl lg:text-[3.5rem]">
        {data.title.split(" ").map((w, i) => (
          <span key={i} className="mr-[0.22em] inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-top">
            <span data-word className="inline-block origin-bottom-left will-change-transform">
              {w}
            </span>
          </span>
        ))}
      </h3>

      <p
        data-item
        className="mt-3 max-w-md text-sm leading-relaxed text-[color:var(--body)] will-change-transform md:mt-6 md:text-[1.05rem]"
      >
        {data.desc}
      </p>

      <ul data-item className="mt-7 hidden flex-wrap gap-2 will-change-transform sm:flex">
        {data.tags.map((t) => (
          <li
            key={t}
            className="rounded-full border border-[color:var(--line)] bg-[color:var(--chip)] px-3.5 py-1.5 text-xs text-[color:var(--fg)]"
          >
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** A 0–9 digit column; the loop slides it with translateY. */
function DigitColumn() {
  return (
    <span className="relative inline-block h-[1em] overflow-hidden leading-none">
      <span data-digit className="flex flex-col will-change-transform" style={{ transform: "translateY(-1em)" }}>
        {Array.from({ length: 10 }, (_, d) => (
          <span key={d} className="block h-[1em] leading-none">
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}

type PanelEls = { root: HTMLElement; words: HTMLElement[]; items: HTMLElement[]; shown: boolean };

export function DeviceStory({ heading, sub, steps, palettes, stepLabel, topbar, loadScreens }: Props) {
  const N = steps.length;
  const noun = stepLabel.toLowerCase();

  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const reduced = useReducedMotion() ?? false;
  const [gl, setGl] = useState<"loading" | "ready" | "failed">("loading");

  // The loop reads these through a ref, so a new array or loader from the
  // caller never restarts it (they don't change after the first render)
  const live = useRef({ palettes, loadScreens });
  useEffect(() => {
    live.current = { palettes, loadScreens };
  });

  // As the pinned stage scrolls away it settles back into the page like a card
  const { scrollYProgress: exit } = useScroll({ target: sectionRef, offset: ["end end", "end start"] });
  const stageScale = useTransform(exit, [0, 0.7], [1, reduced ? 1 : 0.92]);
  const stageRadius = useTransform(exit, [0, 0.35], [0, 44]);

  // The step the buttons have picked (1…N), and one picked from the rail before
  // the laptop has opened, applied once it has. Read by the animation loop.
  const picked = useRef({ step: 1, pending: 0 });

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const view = viewRef.current;
    const canvas = canvasRef.current;
    if (!section || !stage || !view || !canvas) return;
    const { palettes, loadScreens } = live.current;

    const q = (sel: string) => stage.querySelector<HTMLElement>(sel)!;
    const qa = (sel: string, root: ParentNode = stage) => [...root.querySelectorAll<HTMLElement>(sel)];
    const headingEl = q("[data-heading]");
    const subEl = q("[data-sub]");
    const cue = q("[data-cue]");
    const topbarEl = q("[data-topbar]");
    const digit = q("[data-digit]");
    const base = q("[data-wipe-base]");
    const rim = q("[data-wipe-rim]");
    const top = q("[data-wipe-top]");
    const bars = qa("[data-bar]");
    const railItems = qa("[data-rail]");
    const nav = q("[data-nav]");
    const navPrev = q("[data-nav-prev]") as HTMLButtonElement;
    const navNext = q("[data-nav-next]") as HTMLButtonElement;
    const fallback = q("[data-fallback]");
    const fallbackIcons = qa("[data-fallback-icon]", fallback);
    const panels: PanelEls[] = qa("[data-panel]").map((root) => ({
      root,
      words: qa("[data-word]", root),
      items: qa("[data-item]", root),
      shown: false,
    }));

    let scene: SceneApi | null = null;
    let cancelled = false;
    let raf = 0;
    let running = false;
    let smoothU = -1; // eased scroll position, in units
    let shown = -1; // the position on screen
    let tween: { from: number; to: number; t0: number; dur: number } | null = null; // a button transition
    let rewinding = false; // scrolled back into the opening from a later step
    let lastPicked = -1;
    let lastP = -1;
    let lastNear = -1;
    let lastWipeK = -1;
    let lastTime = 0;
    let vw = view.clientWidth;
    let vh = view.clientHeight;
    let sh = stage.clientHeight;

    const ro = new ResizeObserver(() => {
      vw = view.clientWidth;
      vh = view.clientHeight;
      sh = stage.clientHeight;
      lastP = -1; // repaint at the new size
      lastNear = -1;
    });
    ro.observe(view);

    const scrollUnits = () => {
      const travel = section.offsetHeight - window.innerHeight;
      return travel > 0 ? clamp01(-section.getBoundingClientRect().top / travel) * SPAN : 0;
    };

    /** Writes every DOM style for position p. Only runs when p changes. */
    const paint = (p: number) => {
      const k = Math.min(N - 1, Math.floor(p));
      const t = p - k;
      const near = t < 0.5 ? k : k + 1;

      // Background: the next colour pours out from where the device is heading,
      // led by a burgundy ring. Fully reversible — it shrinks back as you scroll up.
      if (k !== lastWipeK) {
        lastWipeK = k;
        base.style.background = palettes[k].bg;
        top.style.background = palettes[k + 1].bg;
      }
      if (reduced) {
        top.style.clipPath = "none";
        top.style.opacity = String(smooth(0.3, 0.7, t));
      } else {
        const L = deviceLayout(k + 1, vw);
        const ox = L.fx * vw;
        const oy = L.fy * vh;
        const R =
          Math.max(Math.hypot(ox, oy), Math.hypot(vw - ox, oy), Math.hypot(ox, sh - oy), Math.hypot(vw - ox, sh - oy)) + 4;
        const tc = clamp01(t / 0.8);
        rim.style.clipPath = `circle(${(R * easeInOut(Math.min(1, tc * 1.12))).toFixed(1)}px at ${ox}px ${oy}px)`;
        top.style.clipPath = `circle(${(R * easeInOut(tc)).toFixed(1)}px at ${ox}px ${oy}px)`;
      }

      // Intro heading and scroll cue leave during the first stretch
      const intro = k === 0 ? t : 1;
      const h = smooth(0, 0.45, intro);
      headingEl.style.opacity = String(1 - h);
      headingEl.style.transform = `translate3d(0, ${-50 * h}px, 0)`;
      const s = smooth(0, 0.35, intro);
      subEl.style.opacity = String(1 - s);
      subEl.style.transform = `translate3d(0, ${-36 * s}px, 0)`;
      cue.style.opacity = String(1 - smooth(0, 0.15, intro));
      const tb = smooth(0.5, 0.95, p);
      topbarEl.style.opacity = String(tb);
      topbarEl.style.transform = `translate3d(0, ${(1 - tb) * 10}px, 0)`;
      // Step buttons arrive with step 01, alongside the top bar, and work once it's open
      nav.style.opacity = String(tb);
      nav.style.transform = `translate3d(0, ${(1 - tb) * 10}px, 0)`;
      nav.style.visibility = tb > 0 ? "visible" : "hidden";
      nav.style.pointerEvents = p >= 0.999 ? "auto" : "none";

      // Counter rolls mid-transition
      const roll = Math.max(1, k + smooth(0.35, 0.65, t));
      digit.style.transform = `translate3d(0, ${-roll}em, 0)`;

      // Copy: the old step lifts away, then the new one rises in word by word
      panels.forEach((panel, i) => {
        const step = i + 1;
        const enter = clamp01((p - (step - 1) - 0.58) / 0.42);
        const leave = step === N ? 0 : clamp01((p - step) / 0.4);
        if (enter <= 0 || leave >= 1) {
          if (panel.shown) {
            panel.shown = false;
            panel.root.style.visibility = "hidden";
          }
          return;
        }
        if (!panel.shown) {
          panel.shown = true;
          panel.root.style.visibility = "visible";
        }
        const l = easeInOut(leave);
        panel.root.style.opacity = String(1 - l);
        panel.root.style.transform = `translate3d(0, ${-56 * l}px, 0)`;
        panel.words.forEach((w, j) => {
          const e = easeOut(clamp01(enter * 1.5 - j * 0.09));
          w.style.transform = `translate3d(0, ${(1 - e) * 115}%, 0) rotate(${(1 - e) * 7}deg)`;
        });
        panel.items.forEach((it, j) => {
          const e = easeOut(clamp01(enter * 1.6 - 0.25 - j * 0.12));
          it.style.opacity = String(e);
          it.style.transform = `translate3d(0, ${(1 - e) * 26}px, 0)`;
        });
      });

      // Progress rail
      bars.forEach((bar, i) => {
        bar.style.transform = `scaleX(${clamp01(p - i)})`;
      });

      // Colours of the persistent UI (top bar, rail) follow the nearest step
      if (near !== lastNear) {
        lastNear = near;
        const vars = paletteVars(palettes[near]);
        for (const key in vars) stage.style.setProperty(key, vars[key]);
        railItems.forEach((el, i) => el.toggleAttribute("data-active", i + 1 === near));
        // Positioned even while hidden, so it's in place the moment WebGL turns out to be missing
        const show = Math.max(1, near);
        const F = deviceLayout(show, vw);
        fallback.style.left = `${F.fx * 100}%`;
        fallback.style.top = `${F.fy * 100}%`;
        fallback.style.opacity = near === 0 ? "0" : "1";
        fallbackIcons.forEach((icon, i) => {
          icon.style.opacity = i + 1 === show ? "1" : "0";
        });
      }
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = lastTime ? Math.min(0.1, (now - lastTime) / 1000) : 1 / 60;
      lastTime = now;

      // Ease towards the real scroll position (Lenis-style), so wheel notches
      // glide instead of jump — but always settle exactly where scrolling stopped.
      const target = scrollUnits();
      if (smoothU < 0) smoothU = target;
      smoothU += (target - smoothU) * (1 - Math.exp(-dt * 5));
      if (Math.abs(target - smoothU) < 0.0004) smoothU = target;
      const opening = positionAt(smoothU, 1);
      const pick = picked.current;
      if (shown < 0) shown = opening < 1 ? opening : pick.step; // (re)entering: no transition

      if (opening < 1) {
        // In the opening, scroll is in charge and the steps start over from 01.
        // Coming back from a later step, ease back to the scroll position first.
        pick.step = 1;
        tween = null;
        if (rewinding || Math.abs(shown - opening) > 0.02) {
          rewinding = true;
          shown += (opening - shown) * (1 - Math.exp(-dt * 6));
          if (Math.abs(shown - opening) < 0.002) rewinding = false;
        }
        if (!rewinding) shown = opening;
      } else {
        // Open: the buttons are in charge. Play the way to the picked step.
        rewinding = false;
        if (pick.pending) {
          pick.step = pick.pending;
          pick.pending = 0;
        }
        if (reduced) {
          shown = pick.step;
        } else if (Math.abs(shown - pick.step) > 1e-4 && (!tween || tween.to !== pick.step)) {
          // A new pick, or another click mid-transition: carry on from here
          tween = { from: shown, to: pick.step, t0: now, dur: stepDuration(Math.abs(pick.step - shown)) };
        }
        if (tween) {
          const t = clamp01((now - tween.t0) / tween.dur);
          // Ease-out: moving from the first frame, settling gently on the step
          shown = tween.from + (tween.to - tween.from) * Math.sin((Math.PI / 2) * t);
          if (t >= 1) tween = null;
        }
      }
      if (pick.step !== lastPicked) {
        lastPicked = pick.step;
        navPrev.disabled = pick.step <= 1;
        navNext.disabled = pick.step >= N;
      }

      const p = shown;
      if (p !== lastP) {
        lastP = p;
        paint(p);
      }
      scene?.render(p, now);
    };

    const start = () => {
      if (running) return;
      running = true;
      lastTime = 0;
      smoothU = -1; // jump straight to the current position when re-entering
      shown = -1;
      tween = null;
      rewinding = false;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // Paint the initial state right away (covers a reload mid-section)
    paint(positionAt(scrollUnits(), 1));

    let requested = false;
    const load = () => {
      if (requested) return;
      requested = true;
      queueGpuSetup(async () => {
        if (cancelled) throw new Error("Section left before its turn");
        // three.js needs WebGL2; without it, skip the download and show the icon tile.
        // The context is created here, with the attributes three.js would ask for, and handed over.
        const context = canvas.getContext("webgl2", {
          alpha: true,
          antialias: true,
          depth: true,
          stencil: false,
          powerPreference: "high-performance",
        });
        if (!context) throw new Error("WebGL2 unavailable");
        const [{ createMacbookScene }, paintScreen] = await Promise.all([import("./macbookScene"), loadScreens()]);
        return createMacbookScene({ canvas, context, reduced, steps: N, paint: paintScreen });
      })
        .then((built) => {
          if (cancelled) return built.dispose();
          scene = built;
          scene.render(shown < 0 ? positionAt(scrollUnits(), 1) : shown, performance.now());
          setGl("ready");
        })
        .catch(() => {
          if (!cancelled) setGl("failed");
        });
    };

    // Load the 3D scene shortly before the section arrives; animate only while it's on screen
    const nearby = new IntersectionObserver(([e]) => e.isIntersecting && load(), { rootMargin: "100% 0px" });
    const onScreen = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
    nearby.observe(section);
    onScreen.observe(section);

    return () => {
      cancelled = true;
      stop();
      nearby.disconnect();
      onScreen.disconnect();
      ro.disconnect();
      scene?.dispose();
    };
  }, [reduced, N]);

  /** Picks step k (1…N). Before the laptop is open (a rail click during the intro),
   * jump the page to step 01's hold: the loop eases the opening through, then
   * carries on to k. */
  const goTo = (k: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const travel = section.offsetHeight - window.innerHeight;
    const u = travel > 0 ? clamp01((window.scrollY - top) / travel) * SPAN : 0;
    if (positionAt(u, 1) < 1) {
      picked.current.pending = k;
      window.scrollTo({ top: top + travel / SPAN, behavior: "instant" });
    } else {
      picked.current.step = k;
    }
  };

  /** Previous / next buttons: step through 01…N. */
  const step = (dir: 1 | -1) => goTo(Math.min(N, Math.max(1, picked.current.step + dir)));

  return (
    <div ref={sectionRef} className="relative" style={{ height: `calc(${SPAN * UNIT_VH}vh + 100lvh)` }}>
      {/* Full list for screen readers and search engines */}
      <ul className="sr-only">
        {steps.map((s) => (
          <li key={s.num}>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
          </li>
        ))}
      </ul>

      <motion.div
        ref={stageRef}
        className="sticky top-0 h-lvh overflow-hidden"
        style={{ ...paletteVars(palettes[0]), scale: stageScale, borderRadius: stageRadius }}
      >
        {/* Background: current colour + the next one pouring in */}
        <div aria-hidden className="absolute inset-0">
          <div data-wipe-base className="absolute inset-0" style={{ background: palettes[0].bg }} />
          <div data-wipe-rim className="absolute inset-0" style={{ background: WIPE_RIM, clipPath: "circle(0px at 0 0)" }} />
          <div data-wipe-top className="absolute inset-0" style={{ background: palettes[1].bg, clipPath: "circle(0px at 0 0)" }} />
        </div>

        {/* Everything else stays inside the small viewport so mobile browser bars never cover it */}
        <div ref={viewRef} className="relative h-svh">
          <canvas
            ref={canvasRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-1000"
            style={{ opacity: gl === "ready" ? 1 : 0 }}
          />

          {/* No WebGL: a simple icon tile where the device would be */}
          <div
            data-fallback
            aria-hidden
            className={`absolute h-40 w-40 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--chip)] text-[color:var(--accent)] transition-all duration-700 max-md:left-1/2! max-md:top-[36%]! ${
              gl === "failed" ? "grid" : "hidden"
            }`}
            style={{ opacity: 0 }}
          >
            {steps.map(({ num, Icon }) => (
              <Icon
                key={num}
                data-fallback-icon
                className="absolute h-16 w-16 opacity-0 transition-opacity duration-500"
                strokeWidth={1.2}
              />
            ))}
          </div>

          {/* Intro heading */}
          <div className="absolute inset-x-0 top-0 px-6 pt-28 md:pt-36">
            <div className="mx-auto flex max-w-6xl flex-col justify-between gap-5 md:flex-row md:items-end">
              <div data-heading className="will-change-transform">
                {heading}
              </div>
              <p data-sub className="max-w-sm shrink-0 text-sm leading-relaxed text-taupe-dark will-change-transform">
                {sub}
              </p>
            </div>
          </div>

          {/* Scroll cue */}
          <div
            data-cue
            aria-hidden
            className="absolute inset-x-0 bottom-20 flex flex-col items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-taupe-dark md:bottom-24"
          >
            Scroll to explore
            <span className="relative h-10 w-px overflow-hidden bg-taupe/30">
              <span className="absolute inset-x-0 top-0 h-1/2 animate-scroll-cue bg-burgundy" />
            </span>
          </div>

          {/* Top bar: label + counter */}
          <div
            data-topbar
            aria-hidden
            className="absolute inset-x-0 top-24 px-6 will-change-transform md:top-28"
            style={{ opacity: 0 }}
          >
            <div className="mx-auto flex max-w-6xl items-center justify-between text-xs uppercase tracking-[0.22em] text-[color:var(--muted)] transition-colors duration-500">
              <span className="inline-flex items-center gap-2">
                <span className="h-px w-6 bg-[color:var(--accent)] transition-colors duration-500" />
                <span className="md:hidden">{topbar.short}</span>
                <span className="hidden md:inline">{topbar.long}</span>
              </span>
              <span className="inline-flex items-center gap-[0.5em] whitespace-nowrap leading-none tabular-nums text-[color:var(--fg)] transition-colors duration-500">
                <span className="inline-flex leading-none">
                  0<DigitColumn />
                </span>
                <span className="text-[color:var(--muted)]">/ {pad(N)}</span>
              </span>
            </div>
          </div>

          {/* Step buttons: the way through steps 01…N, centred above the progress rail */}
          <div className="pointer-events-none absolute inset-x-0 bottom-12 z-10 flex justify-center md:bottom-24">
            <div
              data-nav
              className="flex gap-4 will-change-transform"
              style={{ opacity: 0, visibility: "hidden", pointerEvents: "none" }}
            >
              {[
                { dir: -1 as const, label: `Previous ${noun}`, Icon: ChevronLeft, attr: { "data-nav-prev": "" } },
                { dir: 1 as const, label: `Next ${noun}`, Icon: ChevronRight, attr: { "data-nav-next": "" } },
              ].map(({ dir, label, Icon, attr }) => (
                <button
                  key={dir}
                  type="button"
                  aria-label={label}
                  onClick={() => step(dir)}
                  {...attr}
                  className="grid h-12 w-12 place-items-center rounded-full border border-[color:var(--line)] bg-[color:var(--chip)] text-[color:var(--fg)] backdrop-blur-sm transition duration-300 hover:scale-105 hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] active:scale-95 disabled:pointer-events-none disabled:opacity-30 md:h-14 md:w-14"
                >
                  <Icon className="h-6 w-6" strokeWidth={1.5} />
                </button>
              ))}
            </div>
          </div>

          {/* Step copy: odd steps sit left (device right), even steps right */}
          <div aria-hidden className="pointer-events-none absolute inset-0 mx-auto max-w-6xl">
            {steps.map((s, i) => (
              <div
                key={s.num}
                className={`absolute inset-x-6 top-[57%] bottom-28 md:inset-x-auto md:top-0 md:bottom-auto md:h-full md:w-[42%] ${
                  i % 2 === 0 ? "md:left-6" : "md:right-6"
                }`}
              >
                <Panel step={i + 1} data={s} palette={palettes[i + 1]} label={stepLabel} />
              </div>
            ))}
          </div>

          {/* Progress rail */}
          <div aria-hidden className="absolute inset-x-0 bottom-6 px-6 md:bottom-9">
            <div
              className="mx-auto grid max-w-6xl gap-2 md:gap-5"
              style={{ gridTemplateColumns: `repeat(${N}, minmax(0, 1fr))` }}
            >
              {steps.map((s, i) => (
                <button
                  key={s.num}
                  type="button"
                  tabIndex={-1}
                  data-rail
                  onClick={() => goTo(i + 1)}
                  className="group flex flex-col gap-2 text-left"
                >
                  <span className="hidden items-baseline gap-2 text-[11px] uppercase tracking-[0.16em] text-[color:var(--muted)] opacity-70 transition duration-500 group-hover:opacity-100 group-data-active:text-[color:var(--fg)] group-data-active:opacity-100 md:flex">
                    <span className="tabular-nums">{s.num}</span>
                    <span className="truncate">{s.short}</span>
                  </span>
                  <span className="relative block h-[2px] w-full overflow-hidden rounded-full bg-[color:var(--line)] transition-colors duration-500">
                    <span
                      data-bar
                      className="absolute inset-0 origin-left rounded-full bg-[color:var(--accent)] transition-colors duration-500 will-change-transform"
                      style={{ transform: "scaleX(0)" }}
                    />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

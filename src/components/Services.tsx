"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ChevronDown, ChevronUp, Code2, Cpu, Database, Layers, TrendingUp, Workflow } from "lucide-react";
import { services } from "@/lib/data";
import { deviceLayout, palettes, WIPE_RIM } from "./capabilities/theme";
import type { SceneApi } from "./capabilities/macbookScene";
import { SectionLabel } from "./Reveal";

const icons = {
  web: Code2,
  crm: Database,
  ads: TrendingUp,
  automation: Workflow,
  api: Layers,
  cto: Cpu,
};

// Everything in this section is driven directly by scroll position — no timed
// transitions. Scroll a little and it moves a little; stop and it stops.
//
// Scroll is measured in "units": unit k is the stretch between stop k and
// stop k+1 (stop 0 = intro, stops 1–6 = capabilities). Each stop has a short
// rest zone so a capability sits still for a moment before the next begins.
const N = services.length;
const SPAN = N + 0.4; // units of pinned scroll (a little extra rest on the last one)
const UNIT_VH = 320; // scroll distance per unit, in vh (higher = slower)
const REST = 0.12; // rest zone either side of a stop, in units

/** Scroll units → position (0 = intro, 1–6 = capabilities, fractions = in between). */
function positionAt(u: number) {
  if (u >= N) return N;
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
const pad = (n: number) => String(n).padStart(2, "0");

function paletteVars(i: number) {
  const p = palettes[i];
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
function Panel({ step }: { step: number }) {
  const s = services[step - 1];
  const Icon = icons[s.icon];
  return (
    <div
      data-panel={step}
      className="absolute inset-x-0 top-0 will-change-transform md:top-1/2 md:-translate-y-1/2"
      style={{ ...paletteVars(step), visibility: "hidden" } as CSSProperties}
    >
      <div data-item className="flex items-center gap-3 will-change-transform">
        <span className="grid h-11 w-11 place-items-center rounded-xl border border-[color:var(--line)] bg-[color:var(--chip)] text-[color:var(--accent)]">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </span>
        <span className="text-xs uppercase tracking-[0.22em] text-[color:var(--muted)]">Capability {s.num}</span>
      </div>

      <h3 className="mt-5 font-display text-[1.85rem] font-semibold leading-[1.06] tracking-[-0.03em] text-[color:var(--fg)] sm:text-4xl md:mt-7 md:text-5xl lg:text-[3.5rem]">
        {s.title.split(" ").map((w, i) => (
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
        {s.desc}
      </p>

      <ul data-item className="mt-7 hidden flex-wrap gap-2 will-change-transform sm:flex">
        {s.tags.map((t) => (
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

export function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const reduced = useReducedMotion() ?? false;
  const [gl, setGl] = useState<"loading" | "ready" | "failed">("loading");

  // As the pinned stage scrolls away it settles back into the page like a card
  const { scrollYProgress: exit } = useScroll({ target: sectionRef, offset: ["end end", "end start"] });
  const stageScale = useTransform(exit, [0, 0.7], [1, reduced ? 1 : 0.92]);
  const stageRadius = useTransform(exit, [0, 0.35], [0, 44]);

  // Arrow and rail clicks glide through the section on a timer rather than
  // snapping, so the visitor sees the same transition they'd get by scrolling.
  const glide = useRef({ raf: 0, stop: -1, active: false });
  useEffect(() => () => cancelAnimationFrame(glide.current.raf), []);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const view = viewRef.current;
    const canvas = canvasRef.current;
    if (!section || !stage || !view || !canvas) return;

    const q = (sel: string) => stage.querySelector<HTMLElement>(sel)!;
    const qa = (sel: string, root: ParentNode = stage) => [...root.querySelectorAll<HTMLElement>(sel)];
    const heading = q("[data-heading]");
    const sub = q("[data-sub]");
    const cue = q("[data-cue]");
    const topbar = q("[data-topbar]");
    const digit = q("[data-digit]");
    const base = q("[data-wipe-base]");
    const rim = q("[data-wipe-rim]");
    const top = q("[data-wipe-top]");
    const bars = qa("[data-bar]");
    const railItems = qa("[data-rail]");
    const nav = q("[data-nav]");
    const navUp = q("[data-nav-up]") as HTMLButtonElement;
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
      heading.style.opacity = String(1 - h);
      heading.style.transform = `translate3d(0, ${-50 * h}px, 0)`;
      const s = smooth(0, 0.35, intro);
      sub.style.opacity = String(1 - s);
      sub.style.transform = `translate3d(0, ${-36 * s}px, 0)`;
      cue.style.opacity = String(1 - smooth(0, 0.15, intro));
      const tb = smooth(0.5, 0.95, p);
      topbar.style.opacity = String(tb);
      topbar.style.transform = `translate3d(0, ${(1 - tb) * 10}px, 0)`;
      // Step buttons arrive with capability 01, alongside the top bar
      nav.style.opacity = String(tb);
      nav.style.transform = `translate3d(0, ${(1 - tb) * 10}px, 0)`;
      nav.style.visibility = tb > 0 ? "visible" : "hidden";
      nav.style.pointerEvents = tb > 0.5 ? "auto" : "none";

      // Counter rolls mid-transition
      const roll = Math.max(1, k + smooth(0.35, 0.65, t));
      digit.style.transform = `translate3d(0, ${-roll}em, 0)`;

      // Copy: the old capability lifts away, then the new one rises in word by word
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
        const vars = paletteVars(near);
        for (const key in vars) stage.style.setProperty(key, vars[key]);
        railItems.forEach((el, i) => el.toggleAttribute("data-active", i + 1 === near));
        navUp.disabled = near <= 1;
        const fallback = stage.querySelector<HTMLElement>("[data-fallback]");
        if (fallback) {
          const show = Math.max(1, near);
          const F = deviceLayout(show, vw);
          fallback.style.left = `${F.fx * 100}%`;
          fallback.style.top = `${F.fy * 100}%`;
          fallback.style.opacity = near === 0 ? "0" : "1";
          qa("[data-fallback-icon]", fallback).forEach((icon, i) => {
            icon.style.opacity = i + 1 === show ? "1" : "0";
          });
        }
      }
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = lastTime ? Math.min(0.1, (now - lastTime) / 1000) : 1 / 60;
      lastTime = now;

      // Ease towards the real scroll position (Lenis-style), so wheel notches
      // glide instead of jump — but always settle exactly where scrolling stopped.
      const target = scrollUnits();
      // A button glide is already eased, so follow it exactly (no extra lag)
      if (smoothU < 0 || glide.current.active) smoothU = target;
      smoothU += (target - smoothU) * (1 - Math.exp(-dt * 5));
      if (Math.abs(target - smoothU) < 0.0004) smoothU = target;

      const p = positionAt(smoothU);
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
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // Paint the initial state right away (covers a reload mid-section)
    paint(positionAt(scrollUnits()));

    let requested = false;
    const load = () => {
      if (requested) return;
      requested = true;
      import("./capabilities/macbookScene")
        .then(({ createMacbookScene }) => {
          if (cancelled) return;
          scene = createMacbookScene({ canvas, reduced });
          scene.render(positionAt(smoothU < 0 ? scrollUnits() : smoothU), performance.now());
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
  }, [reduced]);

  /** Jumps to `from` (only ever within a still rest zone, so nothing visibly
   * snaps), glides to `to`, then settles on `end`. */
  const glideTo = (from: number, to: number, end: number, stop: number) => {
    const g = glide.current;
    cancelAnimationFrame(g.raf);
    if (reduced) {
      g.stop = -1;
      g.active = false;
      window.scrollTo({ top: end, behavior: "instant" });
      return;
    }
    const units = Math.abs(to - from) / ((UNIT_VH / 100) * window.innerHeight);
    const duration = Math.min(3800, 450 + 1500 * units); // ~1.6s per capability
    let t0 = 0;
    let last = from;
    g.stop = stop;
    g.active = true;
    window.scrollTo({ top: from, behavior: "instant" });
    const finish = () => {
      g.stop = -1;
      g.active = false;
    };
    const tick = (now: number) => {
      // The visitor scrolled or dragged the scrollbar themselves: hand control back
      if (Math.abs(window.scrollY - last) > 3) return finish();
      if (!t0) t0 = now;
      const t = Math.min(1, (now - t0) / duration);
      // Ease-out: moving from the very first frame, settling gently at the end
      last = from + (to - from) * Math.sin((Math.PI / 2) * t);
      window.scrollTo({ top: t < 1 ? last : end, behavior: "instant" });
      if (t < 1) g.raf = requestAnimationFrame(tick);
      else finish();
    };
    g.raf = requestAnimationFrame(tick);
  };

  const goTo = (k: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const travel = section.offsetHeight - window.innerHeight;
    const yAt = (u: number) => top + (travel * u) / SPAN;
    const u = travel > 0 ? clamp01((window.scrollY - top) / travel) * SPAN : 0;
    if (Math.abs(k - u) < 1e-3) return;
    const dir = Math.sign(k - u);
    // Skip the rest zones at both ends — scrolling through them changes nothing on screen
    const s0 = Math.round(u);
    const fromU = s0 >= 1 && s0 !== k && Math.abs(u - s0) <= REST && (s0 + dir * REST - u) * dir > 0 ? s0 + dir * REST : u;
    const toU = k >= 1 ? k - dir * REST : k;
    glideTo(yAt(fromU), yAt(toU), yAt(k), k);
  };

  /** Up/down buttons: jump between capabilities 01–06 (past the last one, on to the next section). */
  const step = (dir: 1 | -1) => {
    const section = sectionRef.current;
    if (!section) return;
    const travel = section.offsetHeight - window.innerHeight;
    let target: number;
    if (glide.current.stop >= 0) {
      // Clicked again mid-glide: carry on from where that glide is heading
      target = glide.current.stop + dir;
    } else {
      const u = travel > 0 ? clamp01(-section.getBoundingClientRect().top / travel) * SPAN : 0;
      // Anything inside a stop's rest zone counts as being on that stop
      target = dir > 0 ? Math.floor(u + REST + 0.01) + 1 : Math.ceil(u - REST - 0.01) - 1;
    }
    if (target > N) {
      const top = section.getBoundingClientRect().top + window.scrollY;
      const end = top + section.offsetHeight;
      // Everything past the last stop is still until the stage starts to leave
      glideTo(Math.max(window.scrollY, top + travel), end, end, N + 1);
      return;
    }
    goTo(Math.max(1, target));
  };

  return (
    <section
      id="services"
      ref={sectionRef}
      aria-labelledby="capabilities-title"
      className="relative"
      style={{ height: `calc(${SPAN * UNIT_VH}vh + 100lvh)` }}
    >
      {/* Full list for screen readers and search engines */}
      <ul className="sr-only">
        {services.map((s) => (
          <li key={s.num}>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
          </li>
        ))}
      </ul>

      <motion.div
        ref={stageRef}
        className="sticky top-0 h-lvh overflow-hidden"
        style={{ ...paletteVars(0), scale: stageScale, borderRadius: stageRadius }}
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
          {gl === "failed" && (
            <div
              data-fallback
              aria-hidden
              className="absolute grid h-40 w-40 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--chip)] text-[color:var(--accent)] transition-all duration-700 max-md:left-1/2! max-md:top-[36%]!"
              style={{ opacity: 0 }}
            >
              {services.map((s) => {
                const Icon = icons[s.icon];
                return (
                  <Icon
                    key={s.num}
                    data-fallback-icon
                    className="absolute h-16 w-16 opacity-0 transition-opacity duration-500"
                    strokeWidth={1.2}
                  />
                );
              })}
            </div>
          )}

          {/* Intro heading */}
          <div className="absolute inset-x-0 top-0 px-6 pt-28 md:pt-36">
            <div className="mx-auto flex max-w-6xl flex-col justify-between gap-5 md:flex-row md:items-end">
              <div data-heading className="will-change-transform">
                <SectionLabel>Celestial’s capabilities</SectionLabel>
                <h2
                  id="capabilities-title"
                  className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.025em] text-burgundy md:text-6xl"
                >
                  What we bring <span className="text-shine">to the table</span>
                </h2>
              </div>
              <p data-sub className="max-w-sm text-sm leading-relaxed text-taupe-dark will-change-transform">
                Six disciplines, one team. Pick a single service or let us run the whole stack end to end.
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
                <span className="md:hidden">Capabilities</span>
                <span className="hidden md:inline">What we bring to the table</span>
              </span>
              <span className="inline-flex items-center gap-[0.5em] whitespace-nowrap leading-none tabular-nums text-[color:var(--fg)] transition-colors duration-500">
                <span className="inline-flex leading-none">
                  0<DigitColumn />
                </span>
                <span className="text-[color:var(--muted)]">/ {pad(N)}</span>
              </span>
            </div>
          </div>

          {/* Step buttons: an alternative to scrolling */}
          <div
            data-nav
            className="absolute right-4 top-40 z-10 flex flex-col gap-3 will-change-transform md:right-8 md:top-44"
            style={{ opacity: 0, visibility: "hidden" }}
          >
            {[
              { dir: -1 as const, label: "Previous capability", Icon: ChevronUp, attr: { "data-nav-up": "" } },
              { dir: 1 as const, label: "Next capability", Icon: ChevronDown, attr: {} },
            ].map(({ dir, label, Icon, attr }) => (
              <button
                key={dir}
                type="button"
                aria-label={label}
                onClick={() => step(dir)}
                {...attr}
                className="grid h-11 w-11 place-items-center rounded-full border border-[color:var(--line)] bg-[color:var(--chip)] text-[color:var(--fg)] backdrop-blur-sm transition duration-300 hover:scale-105 hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)] active:scale-95 disabled:pointer-events-none disabled:opacity-30"
              >
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </button>
            ))}
          </div>

          {/* Capability copy: odd steps sit left (device right), even steps right */}
          <div aria-hidden className="pointer-events-none absolute inset-0 mx-auto max-w-6xl">
            {services.map((s, i) => (
              <div
                key={s.num}
                className={`absolute inset-x-6 top-[57%] bottom-16 md:inset-x-auto md:top-0 md:bottom-auto md:h-full md:w-[42%] ${
                  i % 2 === 0 ? "md:left-6" : "md:right-6"
                }`}
              >
                <Panel step={i + 1} />
              </div>
            ))}
          </div>

          {/* Progress rail */}
          <div aria-hidden className="absolute inset-x-0 bottom-6 px-6 md:bottom-9">
            <div className="mx-auto grid max-w-6xl grid-cols-6 gap-2 md:gap-5">
              {services.map((s, i) => (
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
    </section>
  );
}

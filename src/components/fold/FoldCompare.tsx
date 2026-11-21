"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { comparison } from "@/lib/data";
import { queueGpuSetup } from "@/lib/gpuQueue";
import { Reveal } from "../Reveal";
import type { FoldSceneApi } from "./foldScene";

// "Unfold the difference": a foldable phone that swivels down into view the
// first time you reach it (after the iPhone 18 Pro page), then opens and
// closes with a slider (after the iPhone Duo viewer). Open, its one inner
// screen sets a typical agency's box beside Celestial's burgundy one; closed,
// the cover shows only ours.
//
// The points fade away slowly as it folds (following the slider, so dragging
// back brings them straight back); once gone, they cascade in afresh, line by
// line, when it next comes to rest. The status bar shows the live time in
// India, and when the minute turns its changed digits roll over.
//
// The slider copies Apple's detent slider: the thumb follows the finger
// exactly, sticks to each end like a magnet (stretching like rubber as you
// pull, then letting go), snaps into an end with a squash, and springs back.
//
// One rAF loop drives everything and only runs while something moves; nothing
// re-renders through React.

const HOLD = 0.3; // seconds lying flat before it swivels
const SWIVEL = 1.6; // seconds to swivel down
const STEP = 0.1; // arrow-key step
const THUMB = 60; // thumb width, px
const SNAP = 9; // px from an end at which the thumb snaps into it
const BREAK = 16; // px to pull away from an end before the thumb lets go
const STRETCH = 15; // most the thumb stretches while held at an end, px
const REVEAL_IN = 1.0; // seconds for the points to cascade in
const FADE_OUT = 0.4; // time constant of the points fading as it folds, seconds
const FADE_IN = 0.16; // and of them coming back when it's unfolded again
const CLOCK_ROLL = 0.6; // seconds for the clock's digits to roll over

// The status bar time: India Standard Time, 12-hour without am/pm, like an iPhone
const istFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Kolkata",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});
function istNow() {
  const parts = istFormat.formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("hour")}:${get("minute")}`;
}

/** CSS-style cubic-bezier easing. */
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 6; i++) {
      const e = sx(t) - x;
      const d = dx(t);
      if (Math.abs(e) < 1e-6) return sy(t);
      if (Math.abs(d) < 1e-6) break;
      t -= e / d;
    }
    let lo = 0;
    let hi = 1;
    t = x;
    for (let i = 0; i < 24; i++) {
      if (sx(t) < x) lo = t;
      else hi = t;
      t = (lo + hi) / 2;
    }
    return sy(t);
  };
}

// Slow to tip, quick through the middle, soft landing (Apple's swivel, a touch faster)
const swivelEase = cubicBezier(0.62, 0, 0.22, 1);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
/** Resistance that grows with the pull, like rubber. */
const rubber = (d: number) => Math.sign(d) * STRETCH * (1 - Math.exp(-Math.abs(d) / 22));

/** One exact step of a critically damped spring (frame-rate independent). */
function spring(x: number, v: number, target: number, w: number, dt: number): [number, number] {
  const d = x - target;
  const e = Math.exp(-w * dt);
  const c = v + w * d;
  return [target + (d + c * dt) * e, (v - w * c * dt) * e];
}

const valueText = (v: number) =>
  v > 0.98 ? "Open: a typical agency beside Celestial" : v < 0.02 ? "Closed: Celestial only" : "Partly open";

export function FoldCompare({ fallback }: { fallback: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const moverRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const iconRef = useRef<SVGSVGElement>(null);
  const reduced = useReducedMotion() ?? false;
  const [gl, setGl] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const track = trackRef.current;
    const mover = moverRef.current;
    const thumb = thumbRef.current;
    const pill = pillRef.current;
    const icon = iconRef.current;
    if (!stage || !canvas || !track || !mover || !thumb || !pill || !icon) return;

    const st = {
      target: 1, // where the slider is (1 open, 0 closed)
      fold: 1, // what the phone shows
      foldV: 0,
      thumb: 1, // where the thumb is drawn
      thumbV: 0,
      stretch: 0, // px; + grows rightwards from the left edge, − leftwards from the right
      stretchV: 0,
      stretchTo: 0,
      stuck: null as 0 | 1 | null, // the end the held thumb is stuck to
      fall: reduced ? 1 : 0,
      phase: (reduced ? "done" : "armed") as "armed" | "playing" | "done",
      want: false, // reached the trigger point before the scene was ready
      t0: 0,
      innerReveal: 0, // cascade progress
      coverReveal: 0,
      innerFade: 1, // visibility while folding
      coverFade: 0,
      clockFrom: istNow(),
      clockTo: "",
      clockP: 1, // roll-over progress
      visible: false,
      drawnThumb: NaN,
      drawnStretch: NaN,
      ariaValue: "1",
    };
    let drag: { id: number; offset: number; direct: boolean; left: number; travel: number } | null = null;
    let scene: FoldSceneApi | null = null;
    let cancelled = false;
    let raf = 0;
    let running = false;
    let last = 0;

    const drawThumb = () => {
      if (st.thumb !== st.drawnThumb) {
        st.drawnThumb = st.thumb;
        mover.style.transform = `translate3d(${((st.thumb - 1) * 100).toFixed(3)}%, 0, 0)`;
      }
      const s = Math.abs(st.stretch) < 0.01 ? 0 : st.stretch;
      if (s === st.drawnStretch) return;
      st.drawnStretch = s;
      const a = Math.abs(s);
      // Grows from the edge opposite the pull, thinning slightly as it stretches
      pill.style.width = `${THUMB + a}px`;
      pill.style.left = s >= 0 ? "0px" : "auto";
      pill.style.right = s >= 0 ? "auto" : "0px";
      pill.style.transform = `scaleY(${(1 - a * 0.0022).toFixed(4)})`;
      icon.style.transform = `translate3d(${(s * 0.2).toFixed(2)}px, 0, 0)`;
    };
    const syncAria = () => {
      const v = st.target.toFixed(2);
      if (v === st.ariaValue) return;
      st.ariaValue = v;
      thumb.setAttribute("aria-valuenow", v);
      thumb.setAttribute("aria-valuetext", valueText(st.target));
    };
    /** The thumb is about to jump `px`: stretch so its trailing edge stays put, then let it spring back. */
    const jump = (px: number) => {
      st.stretch = Math.max(-40, Math.min(40, -px));
      st.stretchV = 0;
    };

    const frame = (now: number) => {
      raf = 0;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      let active = false;

      // Entrance: lie flat a moment, then swivel down from the top edge
      if (st.phase === "playing") {
        const t = (now - st.t0) / 1000;
        const p = clamp01((t - HOLD) / SWIVEL);
        st.fall = swivelEase(p);
        if (p >= 1) st.phase = "done";
        active = st.phase === "playing";
      }

      // Thumb: glued to the finger when it's held; otherwise it glides
      if (drag?.direct) {
        st.thumb = st.target;
        st.thumbV = 0;
      } else if (st.thumb !== st.target) {
        [st.thumb, st.thumbV] = spring(st.thumb, st.thumbV, st.target, drag ? 34 : 15, dt);
        if (Math.abs(st.thumb - st.target) < 2e-4 && Math.abs(st.thumbV) < 2e-3) {
          st.thumb = st.target;
          st.thumbV = 0;
        } else active = true;
      }
      // Stretch: tight while pulled against an end, a soft spring back otherwise
      if (st.stretch !== st.stretchTo || st.stretchV !== 0) {
        [st.stretch, st.stretchV] = spring(st.stretch, st.stretchV, st.stretchTo, st.stuck !== null ? 40 : 24, dt);
        if (Math.abs(st.stretch - st.stretchTo) < 0.01 && Math.abs(st.stretchV) < 0.05) {
          st.stretch = st.stretchTo;
          st.stretchV = 0;
        } else active = true;
      }
      // Phone: follows the thumb, closely while dragging, gently after a click
      if (st.fold !== st.target || st.foldV !== 0) {
        [st.fold, st.foldV] = spring(st.fold, st.foldV, st.target, drag ? 22 : 11, dt);
        if (Math.abs(st.fold - st.target) < 1e-4 && Math.abs(st.foldV) < 1e-3) {
          st.fold = st.target;
          st.foldV = 0;
        } else active = true;
      }

      // Points: a screen's points fade slowly as it leaves rest, gone by
      // half-way; once gone, they cascade in afresh when it comes to rest
      const innerTo = 1 - smoothstep(0, 0.5, 1 - st.fold);
      const coverTo = 1 - smoothstep(0, 0.5, st.fold);
      const ease = (cur: number, to: number) => {
        if (reduced) return to;
        const next = cur + (to - cur) * (1 - Math.exp(-dt / (to < cur ? FADE_OUT : FADE_IN)));
        return Math.abs(to - next) < 0.002 ? to : next;
      };
      st.innerFade = ease(st.innerFade, innerTo);
      st.coverFade = ease(st.coverFade, coverTo);
      if (st.innerFade < 0.02) st.innerReveal = 0;
      if (st.coverFade < 0.02) st.coverReveal = 0;
      const innerRest = st.fall >= 0.999 && st.fold >= 0.985;
      const coverRest = st.fold <= 0.015;
      const grow = (cur: number, rest: boolean) => (rest && cur < 1 ? (reduced ? 1 : Math.min(1, cur + dt / REVEAL_IN)) : cur);
      st.innerReveal = grow(st.innerReveal, innerRest);
      st.coverReveal = grow(st.coverReveal, coverRest);
      if (st.innerFade !== innerTo || st.coverFade !== coverTo) active = true;
      if ((innerRest && st.innerReveal < 1) || (coverRest && st.coverReveal < 1)) active = true;

      // Clock: roll the changed digits over
      if (st.clockP < 1) {
        st.clockP = reduced ? 1 : Math.min(1, st.clockP + dt / CLOCK_ROLL);
        active = true;
      }
      if (drag) active = true;

      drawThumb();
      syncAria();
      draw();

      if (active && st.visible) raf = requestAnimationFrame(frame);
      else {
        running = false;
        last = 0;
      }
    };
    const draw = () =>
      scene?.render({
        fold: st.fold,
        fall: st.fall,
        innerReveal: st.innerReveal,
        coverReveal: st.coverReveal,
        innerFade: st.innerFade,
        coverFade: st.coverFade,
        clockFrom: st.clockFrom,
        clockTo: st.clockTo || st.clockFrom,
        clockT: easeInOut(st.clockP),
      });
    const kick = () => {
      if (running) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    };

    const play = () => {
      if (st.phase !== "armed") return;
      if (!scene) {
        st.want = true;
        return;
      }
      st.want = false;
      st.phase = "playing";
      st.t0 = performance.now();
      kick();
    };

    /* ── Slider ── */
    /** Where a press on the track sends the thumb: the finger's spot, or an end if it's close. */
    const trackValue = (px: number, travel: number) => (px >= travel - SNAP ? 1 : px <= SNAP ? 0 : px / travel);

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || drag) return;
      e.preventDefault();
      const rect = track.getBoundingClientRect();
      const travel = Math.max(1, rect.width - THUMB);
      const thumbLeft = rect.left + st.thumb * travel;
      const onThumb = e.clientX >= thumbLeft - 4 && e.clientX <= thumbLeft + THUMB + 4;
      // Grabbing the thumb keeps it under the finger where it was picked up;
      // pressing the track sends the thumb gliding there, centred on the finger
      drag = {
        id: e.pointerId,
        offset: onThumb ? e.clientX - thumbLeft : THUMB / 2,
        direct: onThumb,
        left: rect.left,
        travel,
      };
      st.stuck = onThumb && (st.thumb === 0 || st.thumb === 1) ? (st.thumb as 0 | 1) : null;
      track.setPointerCapture(e.pointerId);
      if (!onThumb) st.target = trackValue(e.clientX - rect.left - THUMB / 2, travel);
      kick();
    };
    const onMove = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const { travel } = drag;
      const px = e.clientX - drag.left - drag.offset; // where the thumb's left edge would be
      if (!drag.direct) {
        st.target = trackValue(px, travel);
      } else if (st.stuck !== null) {
        const end = st.stuck * travel;
        const d = px - end;
        if ((st.stuck === 1 ? -d : d) > BREAK) {
          // Pulled far enough: it lets go and catches up with the finger
          const v = clamp01(px / travel);
          jump(v * travel - end);
          st.stuck = null;
          st.stretchTo = 0;
          st.target = v;
        } else {
          st.stretchTo = rubber(d);
        }
      } else if (px >= travel - SNAP || px <= SNAP) {
        // Close to an end: it snaps in, squashing against it
        const to = px >= travel - SNAP ? 1 : 0;
        jump(to * travel - st.thumb * travel);
        st.stuck = to;
        st.stretchTo = rubber(px - to * travel);
        st.target = to;
      } else {
        st.target = px / travel;
        st.stretchTo = 0;
      }
      kick();
    };
    const onUp = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      drag = null;
      st.stuck = null;
      st.stretchTo = 0;
      if (track.hasPointerCapture(e.pointerId)) track.releasePointerCapture(e.pointerId);
      kick();
    };
    const onKey = (e: KeyboardEvent) => {
      let v = st.target;
      if (e.key === "ArrowRight" || e.key === "ArrowUp") v += STEP;
      else if (e.key === "ArrowLeft" || e.key === "ArrowDown") v -= STEP;
      else if (e.key === "PageUp") v += 0.25;
      else if (e.key === "PageDown") v -= 0.25;
      else if (e.key === "Home") v = 0;
      else if (e.key === "End") v = 1;
      else if (e.key === "Enter" || e.key === " ") v = st.target > 0.5 ? 0 : 1;
      else return;
      e.preventDefault();
      st.target = clamp01(Math.round(v * 100) / 100);
      syncAria();
      kick();
    };
    track.addEventListener("pointerdown", onDown);
    track.addEventListener("pointermove", onMove);
    track.addEventListener("pointerup", onUp);
    track.addEventListener("pointercancel", onUp);
    track.addEventListener("lostpointercapture", onUp);
    thumb.addEventListener("keydown", onKey);

    /* ── Clock ── */
    let clockTimer = 0;
    const tick = () => {
      clearTimeout(clockTimer);
      const now = istNow();
      const shown = st.clockTo || st.clockFrom;
      if (now !== shown) {
        // Roll over if someone's watching; otherwise just show the new time
        st.clockFrom = shown;
        st.clockTo = now;
        st.clockP = st.visible && !document.hidden && !reduced ? 0 : 1;
        kick();
      }
      // IST is a whole number of minutes from UTC, so minutes turn on the UTC minute
      clockTimer = window.setTimeout(tick, 60_000 - (Date.now() % 60_000) + 40);
    };
    const onVisibility = () => !document.hidden && tick();
    document.addEventListener("visibilitychange", onVisibility);
    tick();

    /* ── Scene ── */
    let requested = false;
    const load = () => {
      if (requested) return;
      requested = true;
      queueGpuSetup(async () => {
        if (cancelled) throw new Error("Left before its turn");
        const context = canvas.getContext("webgl2", {
          alpha: true,
          antialias: true,
          depth: true,
          stencil: false,
          powerPreference: "high-performance",
        });
        if (!context) throw new Error("WebGL2 unavailable");
        const { createFoldScene } = await import("./foldScene");
        return createFoldScene({ canvas, context, reduced });
      })
        .then((built) => {
          if (cancelled) return built.dispose();
          scene = built;
          setGl("ready");
          if (st.want && st.visible) play();
          kick();
        })
        .catch(() => {
          if (!cancelled) setGl("failed");
        });
    };

    // Build the scene well before it's reached
    const nearby = new IntersectionObserver(([e]) => e.isIntersecting && load(), { rootMargin: "200% 0px" });
    nearby.observe(stage);
    // Play once most of the stage is in view; animate only while it's on screen
    const view = new IntersectionObserver(
      ([e]) => {
        st.visible = e.isIntersecting;
        if (!e.isIntersecting) return;
        const enough = e.intersectionRatio >= 0.45 || e.intersectionRect.height >= window.innerHeight * 0.42;
        if (enough) play();
        kick();
      },
      { threshold: [0, 0.15, 0.3, 0.45, 0.6, 0.8, 1] },
    );
    view.observe(stage);
    // Scrolled well back up above it: set it up to fall again next time (like Apple's)
    const rearm = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting || e.boundingClientRect.top < 0 || st.phase !== "done" || reduced) return;
        st.phase = "armed";
        st.fall = 0;
        st.innerReveal = 0;
        draw();
      },
      { rootMargin: "0px 0px 100% 0px" },
    );
    rearm.observe(stage);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(clockTimer);
      document.removeEventListener("visibilitychange", onVisibility);
      nearby.disconnect();
      view.disconnect();
      rearm.disconnect();
      track.removeEventListener("pointerdown", onDown);
      track.removeEventListener("pointermove", onMove);
      track.removeEventListener("pointerup", onUp);
      track.removeEventListener("pointercancel", onUp);
      track.removeEventListener("lostpointercapture", onUp);
      thumb.removeEventListener("keydown", onKey);
      scene?.dispose();
    };
  }, [reduced]);

  return (
    <div className="relative px-6 pb-24 pt-16 md:pb-32 md:pt-24">
      <div className="pointer-events-none absolute -right-40 top-40 h-[420px] w-[620px] rounded-full bg-burgundy/[0.05] blur-[120px]" />

      <Reveal className="relative mx-auto max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-taupe-dark">Celestial vs. a typical agency</p>
        <h3 className="mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.025em] text-burgundy md:text-5xl">
          Unfold the <span className="text-shine">difference.</span>
        </h3>
      </Reveal>

      {gl === "failed" ? (
        <div className="relative mx-auto mt-14 max-w-6xl">{fallback}</div>
      ) : (
        <>
          {/* The phone (decorative; the comparison is in the table below for assistive tech).
              Sized so the phone and its slider fit on one screen. Above the slider card,
              so the half that swings out towards you passes in front of it. */}
          <div
            ref={stageRef}
            aria-hidden
            className="relative z-20 mx-auto mt-8 h-[clamp(420px,calc(100svh-300px),540px)] max-w-6xl md:mt-7 md:h-[clamp(440px,calc(100svh-345px),620px)]"
          >
            <canvas
              ref={canvasRef}
              className="pointer-events-none absolute inset-x-0 top-[-24%] h-[148%] w-full transition-opacity duration-700"
              style={{ opacity: gl === "ready" ? 1 : 0 }}
            />
          </div>

          {/* Open / close, after Apple's detent slider */}
          <div className="relative z-10 mx-auto mt-2 max-w-[440px] rounded-[28px] border border-taupe-light bg-cream/45 px-6 pb-5 pt-4 md:mt-3 md:px-7">
            <p className="text-[14px] leading-snug text-ink/75">
              <strong className="font-semibold text-ink">Side by side.</strong> Open it to see us next to a typical agency.
              Close it, and what you get with us is all that’s left.
            </p>
            <p id="fold-slider-caption" className="mt-2.5 text-xs text-taupe-dark">
              Move slider to open and close.
            </p>
            <div ref={trackRef} className="relative mt-2 h-10 cursor-pointer touch-pan-y select-none">
              <div className="absolute inset-x-0 top-1/2 h-[17px] -translate-y-1/2 rounded-full border-[0.5px] border-ink/10 bg-taupe-light" />
              {/* The mover spans the thumb's travel; translating it by a percentage needs no measuring */}
              <div ref={moverRef} className="absolute inset-y-0 left-0 w-[calc(100%-60px)] will-change-transform">
                <div
                  ref={thumbRef}
                  role="slider"
                  tabIndex={0}
                  aria-valuemin={0}
                  aria-valuemax={1}
                  aria-valuenow={1}
                  aria-valuetext={valueText(1)}
                  aria-labelledby="fold-slider-caption"
                  className="group absolute left-full top-0 h-10 w-[60px] touch-none outline-none"
                >
                  <span
                    ref={pillRef}
                    className="absolute left-0 top-0 flex h-10 w-[60px] items-center justify-center rounded-[22px] border-[0.5px] border-black/10 bg-burgundy text-paper shadow-[0_2px_7px_rgba(54,10,22,0.35)] will-change-transform group-focus-visible:outline-2 group-focus-visible:outline-offset-4 group-focus-visible:outline-burgundy/60"
                  >
                    <svg ref={iconRef} viewBox="0 0 17.36 12.29" className="h-[12px] w-[17px]" aria-hidden>
                      <path
                        fill="currentColor"
                        d="M11.77 12.02l5.26-5.14c.23-.23.33-.46.33-.74s-.11-.53-.33-.74L11.77.27a.85.85 0 00-.64-.27.918.918 0 00-.63 1.59l4.68 4.55-4.68 4.56a.918.918 0 00.63 1.59c.25 0 .46-.1.64-.27m-6.18 0c.18.18.39.27.64.27.51 0 .93-.41.93-.92 0-.25-.11-.49-.29-.67L2.19 6.14l4.68-4.55c.18-.18.29-.42.29-.67 0-.51-.42-.92-.93-.92a.87.87 0 00-.64.27L.33 5.41c-.23.21-.33.46-.33.74s.1.51.33.74l5.26 5.14z"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <Reveal className="relative mt-10 flex justify-center">
        <Link
          href="/contact"
          className="group inline-flex items-center gap-2 text-sm font-medium text-burgundy transition-colors hover:text-burgundy-light"
        >
          See what one system could do for you
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
        </Link>
      </Reveal>

      {/* The comparison as a table, for screen readers and search engines */}
      <table className="sr-only">
        <caption>Celestial Developers compared with a typical agency</caption>
        <thead>
          <tr>
            <th scope="col">Topic</th>
            <th scope="col">Typical agency</th>
            <th scope="col">Celestial Developers</th>
          </tr>
        </thead>
        <tbody>
          {comparison.map((r) => (
            <tr key={r.topic}>
              <th scope="row">{r.topic}</th>
              <td>{r.them}</td>
              <td>{r.us}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

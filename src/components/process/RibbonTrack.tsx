"use client";

import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

/** `ys[i]` is the path's y at fraction `i / (ys.length - 1)` of its length. */
type Geometry = { w: number; h: number; d: string; stroke: number; ys: Float32Array };

type Point = { x: number; y: number };

/** Points per curve segment when measuring the path. */
const STEPS = 96;
/** Entries in the length → y table. */
const SAMPLES = 400;

/**
 * Measures the ribbon in plain JS, straight from its cubic segments (asking the
 * SVG for 400 points along a long path blocks the main thread for a frame or more).
 * Returns the y at evenly spaced fractions of the path's length.
 */
function sampleYs(pts: Point[], k: (a: Point, b: Point) => number) {
  const lens = [0];
  const yAt = [pts[0].y];
  let len = 0;
  let px = pts[0].x;
  let py = pts[0].y;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const c = k(a, b);
    for (let s = 1; s <= STEPS; s++) {
      const t = s / STEPS;
      const u = 1 - t;
      // Control points (a.x, a.y + c) and (b.x, b.y - c), as in the path's C commands
      const x = u * u * u * a.x + 3 * u * u * t * a.x + 3 * u * t * t * b.x + t * t * t * b.x;
      const y = u * u * u * a.y + 3 * u * u * t * (a.y + c) + 3 * u * t * t * (b.y - c) + t * t * t * b.y;
      len += Math.hypot(x - px, y - py);
      lens.push(len);
      yAt.push(y);
      px = x;
      py = y;
    }
  }
  const ys = new Float32Array(SAMPLES + 1);
  let j = 0;
  let max = -Infinity;
  for (let i = 0; i <= SAMPLES; i++) {
    const target = (len * i) / SAMPLES;
    while (j < lens.length - 2 && lens[j + 1] < target) j++;
    const span = lens[j + 1] - lens[j] || 1;
    const y = yAt[j] + ((yAt[j + 1] - yAt[j]) * (target - lens[j])) / span;
    // Running max keeps the lookup monotonic even if a curve dips slightly.
    max = Math.max(max, y);
    ys[i] = max;
  }
  return ys;
}

/** Top/left of `node` measured from `root`, ignoring transforms (Reveal shifts content while hidden). */
function offsetWithin(node: HTMLElement, root: HTMLElement) {
  let x = 0;
  let y = 0;
  let el: HTMLElement | null = node;
  while (el && el !== root) {
    x += el.offsetLeft;
    y += el.offsetTop;
    el = el.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

/**
 * A thick burgundy ribbon that draws itself behind the content as you scroll.
 *
 * The path weaves through every child marked `data-ribbon-stop` (alternating
 * sides) and ends at the element marked `data-ribbon-end`. The ribbon's tip
 * tracks the middle of the viewport.
 */
export function RibbonTrack({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<Geometry | null>(null);
  const reduced = useReducedMotion();

  const draw = useMotionValue(0);
  const opacity = useTransform(draw, (v) => (v > 0.002 ? 1 : 0));
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start center", "end center"] });

  // Scroll progress → the path length whose point sits at the viewport's centre line.
  const update = useCallback(() => {
    const s = geo?.ys;
    const h = ref.current?.offsetHeight;
    if (!s || !h) return;
    if (reduced) return draw.set(1);
    const y = scrollYProgress.get() * h;
    if (y <= s[0]) return draw.set(0);
    let i = 1;
    while (i <= SAMPLES && s[i] < y) i++;
    if (i > SAMPLES) return draw.set(1);
    const t = (y - s[i - 1]) / Math.max(s[i] - s[i - 1], 0.0001);
    draw.set((i - 1 + t) / SAMPLES);
  }, [draw, geo, reduced, scrollYProgress]);

  useMotionValueEvent(scrollYProgress, "change", update);

  // Build the path from the measured layout; rebuild whenever it changes size.
  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const build = () => {
      const w = root.offsetWidth;
      const h = root.offsetHeight;
      const mobile = w < 640;
      const stops = Array.from(root.querySelectorAll<HTMLElement>("[data-ribbon-stop]"));
      const end = root.querySelector<HTMLElement>("[data-ribbon-end]");

      const pts = [{ x: w * 0.5, y: 0 }];
      stops.forEach((s, i) => {
        const { y } = offsetWithin(s, root);
        const right = i % 2 === 0;
        // Swing just past the content edges so the loops show beside each row.
        const x = mobile ? (right ? w * 1.02 : w * -0.02) : right ? w * 1.03 : w * -0.03;
        pts.push({ x, y: y + s.offsetHeight / 2 });
      });
      pts.push({ x: w * 0.5, y: end ? offsetWithin(end, root).y : h });

      // Vertical tangents at every stop give a smooth, sweeping S between rows.
      const k = (a: Point, b: Point) => (b.y - a.y) * 0.55;
      let d = `M${pts[0].x} ${pts[0].y}`;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1];
        const b = pts[i];
        d += ` C${a.x} ${a.y + k(a, b)} ${b.x} ${b.y - k(a, b)} ${b.x} ${b.y}`;
      }

      const stroke = mobile ? 40 : Math.min(140, Math.max(72, w * 0.11));
      setGeo((g) => (g && g.d === d && g.w === w && g.h === h ? g : { w, h, d, stroke, ys: sampleYs(pts, k) }));
    };

    build();
    const ro = new ResizeObserver(build);
    ro.observe(root);
    return () => ro.disconnect();
  }, []);

  // Sync the drawn length with the current scroll whenever the geometry changes.
  useLayoutEffect(update, [update]);

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      {geo && (
        <svg
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 overflow-visible"
          width={geo.w}
          height={geo.h}
          viewBox={`0 0 ${geo.w} ${geo.h}`}
          fill="none"
        >
          <defs>
            <linearGradient id="ribbon-fill" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={geo.w * 0.3} y2={geo.h}>
              <stop offset="0%" stopColor="#7a2340" />
              <stop offset="45%" stopColor="#561226" />
              <stop offset="100%" stopColor="#360a16" />
            </linearGradient>
          </defs>
          <motion.path
            d={geo.d}
            stroke="url(#ribbon-fill)"
            strokeWidth={geo.stroke}
            strokeLinecap="round"
            style={{ pathLength: draw, opacity }}
          />
        </svg>
      )}
      {children}
    </div>
  );
}

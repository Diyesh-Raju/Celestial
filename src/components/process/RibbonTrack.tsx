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

type Geometry = { w: number; h: number; d: string; stroke: number };

const SAMPLES = 400;

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
  const pathRef = useRef<SVGPathElement>(null);
  const ys = useRef<Float32Array | null>(null);
  const [geo, setGeo] = useState<Geometry | null>(null);
  const reduced = useReducedMotion();

  const draw = useMotionValue(0);
  const opacity = useTransform(draw, (v) => (v > 0.002 ? 1 : 0));
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start center", "end center"] });

  // Scroll progress → the path length whose point sits at the viewport's centre line.
  const update = useCallback(() => {
    const s = ys.current;
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
  }, [draw, reduced, scrollYProgress]);

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
      let d = `M${pts[0].x} ${pts[0].y}`;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1];
        const b = pts[i];
        const k = (b.y - a.y) * 0.55;
        d += ` C${a.x} ${a.y + k} ${b.x} ${b.y - k} ${b.x} ${b.y}`;
      }

      const stroke = mobile ? 40 : Math.min(140, Math.max(72, w * 0.11));
      setGeo((g) => (g && g.d === d && g.w === w && g.h === h ? g : { w, h, d, stroke }));
    };

    build();
    const ro = new ResizeObserver(build);
    ro.observe(root);
    return () => ro.disconnect();
  }, []);

  // Sample the rendered path once per geometry so scroll → length is a cheap lookup.
  useLayoutEffect(() => {
    const p = pathRef.current;
    if (!p || !geo) return;
    const total = p.getTotalLength();
    const s = new Float32Array(SAMPLES + 1);
    let max = -Infinity;
    for (let i = 0; i <= SAMPLES; i++) {
      // Running max keeps the lookup monotonic even if a curve dips slightly.
      max = Math.max(max, p.getPointAtLength((total * i) / SAMPLES).y);
      s[i] = max;
    }
    ys.current = s;
    update();
  }, [geo, update]);

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
            ref={pathRef}
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

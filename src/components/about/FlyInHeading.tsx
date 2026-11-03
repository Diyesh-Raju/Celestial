"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** How far off to the side each line starts, as a share of the viewport width. */
const TRAVEL = 0.55;
/** How long (s) the lines trail behind the scroll. Bigger is floatier and slower. */
const SMOOTH_TIME = 0.35;
/** The fly-in runs while the heading's top rises from START to END (shares of viewport height). */
const START = 0.98;
const END = 0.42;
/** Each line's slice of that run: the left line leads, the right one follows. */
const SLICES = { left: [0, 0.82], right: [0.18, 1] } as const;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Critically damped spring step (as in Unity's SmoothDamp): eases out of rest and into the target. */
function smoothDamp(cur: number, target: number, vel: number, dt: number): [number, number] {
  const omega = 2 / SMOOTH_TIME;
  const x = omega * dt;
  const decay = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const change = cur - target;
  const temp = (vel + omega * change) * dt;
  return [target + (change + temp) * decay, (vel - omega * temp) * decay];
}

/**
 * A heading whose `data-fly="left"` / `data-fly="right"` children glide in from
 * their side as it scrolls into view, trailing the scroll on a spring so even a
 * quick flick shows the motion. Everything else inside stays still.
 *
 * Lines sit in place until this hydrates (and with reduced motion), so the
 * heading is never stuck off-screen.
 */
export function FlyInHeading({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const heading = ref.current;
    if (!heading || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lines = [...heading.querySelectorAll<HTMLElement>("[data-fly]")].map((el) => {
      const side = el.dataset.fly === "right" ? "right" : "left";
      return { el, dir: side === "right" ? 1 : -1, slice: SLICES[side] };
    });

    const progressFor = () => {
      const vh = window.innerHeight;
      return clamp01((vh * START - heading.getBoundingClientRect().top) / (vh * (START - END)));
    };

    const paint = (p: number) => {
      const vw = window.innerWidth;
      for (const { el, dir, slice } of lines) {
        const t = clamp01((p - slice[0]) / (slice[1] - slice[0]));
        if (t >= 1) {
          el.style.transform = "";
          el.style.opacity = "";
          continue;
        }
        const eased = 1 - (1 - t) * (1 - t); // ease-out, so it settles softly
        el.style.transform = `translate3d(${(dir * (1 - eased) * TRAVEL * vw).toFixed(1)}px,0,0)`;
        el.style.opacity = String(clamp01(t / 0.35));
      }
    };

    let target = progressFor();
    let cur = target;
    let vel = 0;
    let raf = 0;
    let last = 0;
    paint(cur);

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      [cur, vel] = smoothDamp(cur, target, vel, dt);
      if (Math.abs(target - cur) < 1e-4 && Math.abs(vel) < 1e-4) {
        cur = target;
        paint(cur);
        raf = 0;
        return;
      }
      paint(cur);
      raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      target = progressFor();
      if (!raf && target !== cur) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
      for (const { el } of lines) {
        el.style.transform = "";
        el.style.opacity = "";
      }
    };
  }, []);

  return (
    <h2 ref={ref} className={className}>
      {children}
    </h2>
  );
}

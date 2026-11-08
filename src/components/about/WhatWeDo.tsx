"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { clamp01, lerp, smoothDamp } from "../studio/motion";
import { Laptop } from "./Laptop";
import { SalesCard } from "./SalesCard";

/** Extrusion slices behind each title word (phones draw half of them, see globals.css). */
const TITLE_LAYERS = 12;
const EYEBROW_LAYERS = 4;
/** How long (s) the tilt trails the scroll and the cursor. */
const SMOOTH_TIME = 0.5;
/** Lean (deg) while the heading enters at the bottom of the screen, and as it leaves at the top. */
const LEAN_LOW = 16;
const LEAN_HIGH = -6;
/** How far (deg) a mouse can turn the heading. */
const TURN_X = 7;
const TURN_Y = 13;

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => {
  const [x, y] = [hex(a), hex(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(",")})`;
};

// Side walls: a lit lip right behind the face, then the colour sinking into the dark
const TONES = {
  burgundy: { lip: "#8e2c4b", near: "#5c1529", far: "#1d050c" },
  taupe: { lip: "#9a8a80", near: "#5e524b", far: "#2c2522" },
};
type Tone = keyof typeof TONES;

function sideColor(k: number, n: number, tone: Tone) {
  const { lip, near, far } = TONES[tone];
  return k === 1 ? lip : mix(near, far, (k - 2) / Math.max(1, n - 2));
}

/**
 * One extruded word: the real text on the front face, with slices of the same
 * word stacked behind it in depth. The slices draw their text from CSS (--t) so
 * the heading's text content stays the plain words for search and screen readers.
 */
function Word({
  text,
  i,
  layers = TITLE_LAYERS,
  tone = "burgundy",
}: {
  text: string;
  i: number;
  layers?: number;
  tone?: Tone;
}) {
  return (
    <span className="w3d-word" style={{ "--i": i, "--n": layers, "--t": JSON.stringify(text) } as CSSProperties}>
      {Array.from({ length: layers }, (_, j) => (
        <span
          key={j}
          aria-hidden
          className="w3d-side"
          style={{ "--k": j + 1, color: sideColor(j + 1, layers, tone) } as CSSProperties}
        />
      ))}
      <span aria-hidden className="w3d-cast" />
      <span className="w3d-face">{text}</span>
    </span>
  );
}

/**
 * "What we do" and the studio's one-line answer, set as solid 3D lettering.
 * The words stand up one by one as the heading scrolls in, the laptop opens and
 * the sales chart draws itself. Afterwards the whole heading leans with the
 * scroll and, with a mouse, turns toward the cursor.
 *
 * Everything rests in place until this hydrates (and with reduced motion).
 */
export function WhatWeDo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.classList.add("is-in");
      return;
    }

    // Entrance: once the heading is a fifth of the way up the screen
    const enter = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        root.classList.add("is-in");
        enter.disconnect();
      },
      { rootMargin: "0px 0px -20% 0px" },
    );
    enter.observe(root);

    // Tilt
    const mouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let px = 0; // cursor offset from the heading's centre, -1..1 of half the screen
    let py = 0;
    let inView = false;
    let raf = 0;
    let last = 0;

    const target = (): [number, number] => {
      const r = root.getBoundingClientRect();
      const p = clamp01((r.top + r.height / 2) / window.innerHeight); // 1 at the bottom of the screen
      return [lerp(LEAN_HIGH, LEAN_LOW, p) - py * TURN_X, px * TURN_Y];
    };
    const paint = (x: number, y: number) => {
      stage.style.transform = `rotateX(${x.toFixed(2)}deg) rotateY(${y.toFixed(2)}deg)`;
    };

    let [rx, ry] = target();
    let vx = 0;
    let vy = 0;
    paint(rx, ry);

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const [tx, ty] = target();
      [rx, vx] = smoothDamp(rx, tx, vx, dt, SMOOTH_TIME);
      [ry, vy] = smoothDamp(ry, ty, vy, dt, SMOOTH_TIME);
      paint(rx, ry);
      const settled =
        Math.abs(tx - rx) < 0.02 && Math.abs(ty - ry) < 0.02 && Math.abs(vx) < 0.02 && Math.abs(vy) < 0.02;
      raf = settled ? 0 : requestAnimationFrame(tick);
    };
    const wake = () => {
      if (raf || !inView) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const visible = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      wake();
    });
    visible.observe(root);

    const onPointer = (e: PointerEvent) => {
      if (!inView) return;
      const r = root.getBoundingClientRect();
      px = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)));
      py = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)));
      wake();
    };
    const onLeave = () => {
      px = 0;
      py = 0;
      wake();
    };

    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", wake);
    if (mouse) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }
    return () => {
      enter.disconnect();
      visible.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", wake);
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      stage.style.transform = "";
    };
  }, []);

  return (
    <div ref={rootRef} className="w3d">
      <div ref={stageRef} className="w3d-stage">
        <p className="w3d-eyebrow flex items-center justify-center gap-3 text-[11px] font-medium uppercase tracking-[0.24em] text-taupe-dark">
          <span aria-hidden className="w3d-dash h-px w-8 bg-taupe" />
          <Word text="What we do" i={0} layers={EYEBROW_LAYERS} tone="taupe" />
        </p>
        <h2 className="w3d-title mt-6 text-balance text-center font-display text-[clamp(2.25rem,5.4vw,4.125rem)] font-semibold leading-[1.12] tracking-[-0.035em]">
          <Word text="Bespoke" i={1} />{" "}
          <span className="w3d-keep">
            <Word text="Software" i={2} /> <Laptop />
          </span>{" "}
          <Word text="Development" i={3} />
          <br className="hidden md:inline" />{" "}
          <span className="w3d-keep">
            <Word text="&" i={4} /> <Word text="Growth" i={5} />
          </span>{" "}
          <span className="w3d-keep">
            <Word text="Studio" i={6} /> <SalesCard />
          </span>
        </h2>
      </div>
    </div>
  );
}

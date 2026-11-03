/* Maths for the Studio section (components/Studio.tsx): easing, a scroll spring,
   and the perspective transform that lays the banner onto the monitor. */

export type Pt = readonly [number, number];
/** Corners in order: top-left, top-right, bottom-right, bottom-left. */
export type Quad = readonly [Pt, Pt, Pt, Pt];

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** Where v sits between a and b, clamped to 0..1. */
export const range = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (t: number) => t * t * (3 - 2 * t);
export const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
export const easeOutQuint = (t: number) => 1 - (1 - t) ** 5;

/** Critically damped spring step (Unity's SmoothDamp): eases out of rest and into the target. */
export function smoothDamp(cur: number, target: number, vel: number, dt: number, smoothTime: number): [number, number] {
  const omega = 2 / smoothTime;
  const x = omega * dt;
  const decay = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const change = cur - target;
  const temp = (vel + omega * change) * dt;
  return [target + (change + temp) * decay, (vel - omega * temp) * decay];
}

/**
 * CSS matrix3d that maps the rectangle (0,0)–(w,h) onto any four-cornered shape,
 * perspective included (Heckbert's square-to-quad projection). Use with
 * `transform-origin: 0 0`.
 */
export function rectToQuad(w: number, h: number, [[x0, y0], [x1, y1], [x2, y2], [x3, y3]]: Quad): string {
  const dx1 = x1 - x2;
  const dx2 = x3 - x2;
  const dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2;
  const dy2 = y3 - y2;
  const dy3 = y0 - y1 + y2 - y3;
  const det = dx1 * dy2 - dx2 * dy1;
  // Projective terms (both zero when the shape is a parallelogram)
  const g = det ? (dx3 * dy2 - dx2 * dy3) / det : 0;
  const k = det ? (dx1 * dy3 - dx3 * dy1) / det : 0;
  const a = x1 - x0 + g * x1;
  const b = x3 - x0 + k * x3;
  const d = y1 - y0 + g * y1;
  const e = y3 - y0 + k * y3;
  const m = [a / w, d / w, 0, g / w, b / h, e / h, 0, k / h, 0, 0, 1, 0, x0, y0, 0, 1];
  return `matrix3d(${m.map((v) => +v.toFixed(8)).join(",")})`;
}

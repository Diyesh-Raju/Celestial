import * as THREE from "three";
import { LOGO_PATH } from "@/lib/logo";

// Small pieces shared by the WebGL device scenes (the capabilities MacBook and
// iPhone, and the why-us foldable).

/** Waits until the browser is idle, so setup runs between frames instead of stalling the page. */
export const whenIdle = () =>
  new Promise<void>((resolve) =>
    "requestIdleCallback" in window
      ? requestIdleCallback(() => resolve(), { timeout: 300 })
      : requestAnimationFrame(() => setTimeout(resolve, 0)),
  );

/** A faint diagonal glare band, baked so the screen glass can never wash out the display. */
export function sheenTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 256, 256);
  g.addColorStop(0, "rgba(255,255,255,0.10)");
  g.addColorStop(0.32, "rgba(255,255,255,0.05)");
  g.addColorStop(0.38, "rgba(255,255,255,0.09)");
  g.addColorStop(0.46, "rgba(255,255,255,0.02)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** The Celestial Developers mark as an alpha mask. */
export function logoTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, 512, 512);
  ctx.scale(512 / 48, 512 / 48);
  ctx.fillStyle = "#fff";
  ctx.fill(new Path2D(LOGO_PATH));
  return new THREE.CanvasTexture(c);
}

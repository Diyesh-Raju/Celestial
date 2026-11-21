import type { Device } from "./theme";

// Shared drawing kit for the devices' displays: each screen is a small product
// UI drawn into a 2D canvas that the 3D scene uses as the screen texture.
// screens.ts (capabilities) and whyScreens.ts (why us) draw with it.

export const SCREEN_W = 1280;
export const SCREEN_H = 832;
export const PHONE_W = 720;
export const PHONE_H = 1578;
export const BAR = 52; // window title bar height

/** Paints the display for one step (1-based) into `canvas`, sized for that step's device. */
export type PaintScreen = (step: number, canvas?: HTMLCanvasElement) => HTMLCanvasElement;

export type UI = {
  bg: string;
  panel: string;
  panel2: string;
  line: string;
  text: string;
  muted: string;
  accent: string;
  accent2: string;
  soft: string;
  good: string;
  code: string;
};

// The UI theme contrasts with the section background: dark UI on light steps.
export const darkUI: UI = {
  bg: "#17110f",
  panel: "#211917",
  panel2: "#2b211d",
  line: "rgba(255, 238, 226, 0.09)",
  text: "#f3ebe3",
  muted: "rgba(243, 235, 227, 0.52)",
  accent: "#d4637f",
  accent2: "#d9b8a3",
  soft: "rgba(212, 99, 127, 0.16)",
  good: "#8cc09a",
  code: "#0f0b0a",
};

export const lightUI: UI = {
  bg: "#f4eee7",
  panel: "#fbf8f4",
  panel2: "#ebe2d8",
  line: "rgba(47, 43, 41, 0.1)",
  text: "#2f2b29",
  muted: "rgba(47, 43, 41, 0.55)",
  accent: "#7a2340",
  accent2: "#a8968a",
  soft: "rgba(122, 35, 64, 0.1)",
  good: "#4f8a5f",
  code: "#241a17",
};

export const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

export const easeInOut = (v: number) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export class Painter {
  constructor(
    readonly ctx: CanvasRenderingContext2D,
    readonly ui: UI,
    readonly sans: string,
  ) {}

  rr(x: number, y: number, w: number, h: number, r: number) {
    const c = this.ctx;
    c.beginPath();
    c.roundRect(x, y, w, h, r);
  }

  fill(x: number, y: number, w: number, h: number, r: number, color: string | CanvasGradient) {
    this.rr(x, y, w, h, r);
    this.ctx.fillStyle = color;
    this.ctx.fill();
  }

  stroke(x: number, y: number, w: number, h: number, r: number, color: string, width = 1.5) {
    this.rr(x, y, w, h, r);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.stroke();
  }

  card(x: number, y: number, w: number, h: number, r = 18) {
    this.fill(x, y, w, h, r, this.ui.panel);
    this.stroke(x + 0.75, y + 0.75, w - 1.5, h - 1.5, r, this.ui.line);
  }

  dot(x: number, y: number, r: number, color: string) {
    const c = this.ctx;
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.fillStyle = color;
    c.fill();
  }

  text(
    str: string,
    x: number,
    y: number,
    size: number,
    color: string,
    weight = 500,
    align: CanvasTextAlign = "left",
    mono = false,
  ) {
    const c = this.ctx;
    c.font = `${weight} ${size}px ${mono ? MONO : this.sans}`;
    c.fillStyle = color;
    c.textAlign = align;
    c.textBaseline = "alphabetic";
    c.fillText(str, x, y);
  }

  /** Splits `str` into lines no wider than `maxW` at the given size. */
  wrap(str: string, maxW: number, size: number, weight = 500) {
    const c = this.ctx;
    c.font = `${weight} ${size}px ${this.sans}`;
    const lines: string[] = [];
    let line = "";
    for (const word of str.split(" ")) {
      const next = line ? `${line} ${word}` : word;
      if (line && c.measureText(next).width > maxW) {
        lines.push(line);
        line = word;
      } else line = next;
    }
    if (line) lines.push(line);
    return lines;
  }

  /** Width of the widest of `lines` at the given size. */
  measure(lines: string[], size: number, weight = 500) {
    const c = this.ctx;
    c.font = `${weight} ${size}px ${this.sans}`;
    return Math.max(...lines.map((l) => c.measureText(l).width));
  }

  gradient(x0: number, y0: number, x1: number, y1: number, stops: [number, string][]) {
    const g = this.ctx.createLinearGradient(x0, y0, x1, y1);
    for (const [o, col] of stops) g.addColorStop(o, col);
    return g;
  }

  chrome(title: string) {
    const { ctx: c, ui } = this;
    c.fillStyle = ui.bg;
    c.fillRect(0, 0, SCREEN_W, SCREEN_H);
    c.fillStyle = ui.panel;
    c.fillRect(0, 0, SCREEN_W, BAR);
    c.fillStyle = ui.line;
    c.fillRect(0, BAR - 1, SCREEN_W, 1);
    for (let i = 0; i < 3; i++) this.dot(30 + i * 22, BAR / 2, 6.5, ui.line);
    this.fill(SCREEN_W / 2 - 230, 11, 460, 30, 15, ui.bg);
    this.text(title, SCREEN_W / 2, 32, 15, ui.muted, 500, "center");
  }

  pillWidth(label: string, size = 14) {
    this.ctx.font = `600 ${size}px ${this.sans}`;
    return this.ctx.measureText(label).width + size * 1.6;
  }

  pill(x: number, y: number, label: string, color: string, bg: string, size = 14) {
    const w = this.pillWidth(label, size);
    const h = size * 2.1;
    this.fill(x, y, w, h, h / 2, bg);
    this.text(label, x + w / 2, y + h / 2 + size * 0.36, size, color, 600, "center");
    return w;
  }

  /** Smooth line through points (path only; the caller strokes or fills it). Returns the last point. */
  curve(pts: [number, number][]) {
    const c = this.ctx;
    c.beginPath();
    c.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const mx = (x0 + x1) / 2;
      c.bezierCurveTo(mx, y0, mx, y1, x1, y1);
    }
    return pts[pts.length - 1];
  }
}

/* ── Phone screens ───────────────────────────────────────────────────── */
export const PM = 40; // side margin
export const PCW = PHONE_W - PM * 2; // content width
export const TAB_Y = 1432; // top of the tab bar

/** Status bar, tab bar and home indicator. The 3D Dynamic Island sits in the status bar's gap. */
export function phoneFrame(p: Painter, tabs: string[]) {
  const { ctx: c, ui } = p;
  c.fillStyle = ui.bg;
  c.fillRect(0, 0, PHONE_W, PHONE_H);
  p.text("9:41", 96, 66, 30, ui.text, 600, "center");
  for (let i = 0; i < 4; i++) p.fill(532 + i * 12, 66 - 8 - i * 5, 8, 8 + i * 5, 2, ui.text);
  p.stroke(592, 45, 52, 24, 7, ui.muted, 2);
  p.fill(597, 50, 38, 14, 4, ui.text);
  p.fill(647, 52, 4, 10, 2, ui.muted);

  c.fillStyle = ui.panel;
  c.fillRect(0, TAB_Y, PHONE_W, PHONE_H - TAB_Y);
  c.fillStyle = ui.line;
  c.fillRect(0, TAB_Y, PHONE_W, 1);
  tabs.forEach((label, i) => {
    const x = (PHONE_W / tabs.length) * (i + 0.5);
    p.fill(x - 17, TAB_Y + 22, 34, 34, 10, i === 0 ? ui.accent : ui.line);
    p.text(label, x, TAB_Y + 88, 19, i === 0 ? ui.accent : ui.muted, 600, "center");
  });
  p.fill(PHONE_W / 2 - 120, PHONE_H - 30, 240, 9, 5, ui.muted);
}

export function phoneHeader(p: Painter, kicker: string, title: string) {
  const { ui } = p;
  p.text(kicker, PM, 150, 24, ui.muted, 500);
  p.text(title, PM - 2, 218, 64, ui.text, 700);
  p.dot(PHONE_W - PM - 32, 190, 32, ui.accent2);
  p.dot(PHONE_W - PM - 32, 190, 13, ui.panel);
}

/**
 * Sizes `canvas` for the device, clears it and hands `draw` a painter themed
 * against the step's background (`dark` = dark background, so a light UI).
 */
export function paintDevice(
  device: Device,
  dark: boolean,
  draw: (p: Painter) => void,
  canvas = document.createElement("canvas"),
) {
  const phone = device === "phone";
  const w = phone ? PHONE_W : SCREEN_W;
  const h = phone ? PHONE_H : SCREEN_H;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  // The page's resolved font stack (includes next/font's generated Inter family)
  const sans = getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
  ctx.save();
  ctx.clearRect(0, 0, w, h);
  draw(new Painter(ctx, dark ? lightUI : darkUI, sans));
  ctx.restore();
  return canvas;
}

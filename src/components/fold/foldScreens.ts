import { comparison } from "@/lib/data";
import { LOGO_PATH } from "@/lib/logo";

// The foldable's two displays, painted into canvases that the 3D scene uses
// as screen textures. Sizes come in CSS pixels as the display appears on the
// page at rest, and `scale` is the device pixel ratio, so one texel lands on
// one screen pixel and the text is as sharp as the page's own.
//
//   inner  the big display, seen when open: ONE screen (one background,
//          status bar and title across the hinge) holding two boxes, a
//          plain one for a typical agency and a burgundy one for Celestial,
//          rows lined up across the fold. On phones the device is held
//          upright, so the boxes stack top and bottom instead.
//   cover  the outer display, seen when closed: Celestial's box only.
//
// Each display is painted in two layers so the scene can animate it:
//   base  background, status bar, title and the boxes with their headers
//   rows  the points themselves, on transparent (they cascade in and fade out)
// The status bar's clock is painted on its own (paintClock), small, so the
// live time can tick over without repainting the whole screen.
//
// The scene paints these at several times the on-screen pixel density, so
// they hold up when the folding half swings towards the camera.

export type FoldFonts = { sans: string; brand: string };
export type ScreenLayers = { base: HTMLCanvasElement; rows: HTMLCanvasElement };
/** Where the clock sits on a display, in CSS px of that display (screen orientation). */
export type ClockSpot = { x: number; y: number; w: number; h: number; size: number; baseline: number; pad: number };
/** The clock in three layers: digits that stay, digits leaving, digits arriving. */
export type ClockLayers = { still: HTMLCanvasElement; from: HTMLCanvasElement; to: HTMLCanvasElement };

const canvas = () => document.createElement("canvas");
export const createLayers = (): ScreenLayers => ({ base: canvas(), rows: canvas() });
export const createClockLayers = (): ClockLayers => ({ still: canvas(), from: canvas(), to: canvas() });

/** The page's resolved font stacks (next/font generates the family names). */
export function readFonts(): FoldFonts {
  const sans = getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
  const brandEl = document.querySelector(".font-brand");
  const brand = (brandEl && getComputedStyle(brandEl).fontFamily) || "Montserrat, sans-serif";
  return { sans, brand };
}

type Side = "them" | "us";

const SCREEN = {
  top: "#f1ebe4",
  bottom: "#e6ddd3",
  status: "#2f2b29",
  title: "#7d6e65",
};

const THEM = {
  card: "#fbf8f4",
  border: "rgba(47, 43, 41, 0.1)",
  text: "#5f524b",
  topic: "#9a8a7f",
  icon: "#a8968a",
  line: "rgba(47, 43, 41, 0.09)",
  head: "#6e6058",
};

const US = {
  text: "#fbf6f0",
  topic: "rgba(240, 201, 205, 0.8)",
  line: "rgba(251, 246, 240, 0.14)",
  chip: "rgba(251, 246, 240, 0.16)",
  head: "#fbf6f0",
};

/** The site's layered burgundy (bg-burgundy-rich): a lit corner fading to oxblood. */
function burgundy(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  c.fillStyle = "#561226";
  c.fillRect(x, y, w, h);
  const r = Math.max(w, h);
  const lit = c.createRadialGradient(x, y, 0, x, y, r * 1.05);
  lit.addColorStop(0, "rgba(122, 35, 64, 0.9)");
  lit.addColorStop(0.55, "rgba(122, 35, 64, 0)");
  c.fillStyle = lit;
  c.fillRect(x, y, w, h);
  const dark = c.createRadialGradient(x + w, y + h, 0, x + w, y + h, r * 0.85);
  dark.addColorStop(0, "rgba(30, 5, 12, 0.85)");
  dark.addColorStop(0.6, "rgba(30, 5, 12, 0)");
  c.fillStyle = dark;
  c.fillRect(x, y, w, h);
}

/** One background for the whole display, with a soft light across the middle. */
function screenBg(c: CanvasRenderingContext2D, w: number, h: number) {
  const g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, SCREEN.top);
  g.addColorStop(1, SCREEN.bottom);
  c.fillStyle = g;
  c.fillRect(0, 0, w, h);
  const glow = c.createRadialGradient(w / 2, 0, 0, w / 2, 0, Math.max(w, h) * 0.75);
  glow.addColorStop(0, "rgba(255, 255, 255, 0.55)");
  glow.addColorStop(1, "rgba(255, 255, 255, 0)");
  c.fillStyle = glow;
  c.fillRect(0, 0, w, h);
}

/** A box on the screen: plain for them, burgundy for us. */
function card(c: CanvasRenderingContext2D, side: Side, x: number, y: number, w: number, h: number, r: number) {
  c.save();
  if (side === "them") {
    c.beginPath();
    c.roundRect(x, y, w, h, r);
    c.fillStyle = THEM.card;
    c.fill();
    c.strokeStyle = THEM.border;
    c.lineWidth = 1;
    c.stroke();
  } else {
    // Lifted off the screen like the site's burgundy card: a soft shadow in
    // layers (canvas shadows ignore the transform, and this one may be rotated)
    for (let i = 10; i >= 1; i--) {
      const k = i / 10;
      c.beginPath();
      c.roundRect(x - r * 0.5 * k, y + r * 0.7 * k, w + r * k, h + r * 0.4 * k, r * (1 + 0.6 * k));
      c.fillStyle = `rgba(54, 10, 22, ${(0.05 * (1 - k * 0.6)).toFixed(3)})`;
      c.fill();
    }
    c.beginPath();
    c.roundRect(x, y, w, h, r);
    c.clip();
    burgundy(c, x, y, w, h);
  }
  c.restore();
}

/** Letter-spaced caps, drawn glyph by glyph (canvas letterSpacing isn't everywhere yet). */
function spaced(c: CanvasRenderingContext2D, str: string, x: number, y: number, spacing: number) {
  let cx = x;
  for (const ch of str) {
    c.fillText(ch, cx, y);
    cx += c.measureText(ch).width + spacing;
  }
  return cx - spacing - x;
}

function spacedWidth(c: CanvasRenderingContext2D, str: string, spacing: number) {
  let w = 0;
  for (const ch of str) w += c.measureText(ch).width + spacing;
  return w - spacing;
}

function wrap(c: CanvasRenderingContext2D, str: string, maxW: number) {
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

type Layout = {
  f: number; // statement size
  lh: number; // statement line height
  topicF: number;
  topics: boolean;
  headH: number;
  iconBox: number; // icon column width (icon + gap)
  rows: { h: number; padTop: number; lines: Record<Side, string[]> }[];
};

/**
 * Finds the largest type that fits every row of the given sides into a
 * column, rows sharing heights so both boxes line up across the fold.
 * Topic labels go first if space runs out, then size, then row padding.
 */
function fit(
  c: CanvasRenderingContext2D,
  fonts: FoldFonts,
  colW: number,
  colH: number,
  sides: Side[],
  base: number,
  allowTopics = true,
): Layout {
  let last: Layout | null = null;
  for (const topics of allowTopics ? [true, false] : [false]) {
    for (let f = base; f >= 8.5; f -= 0.25) {
      for (const pad of [0.78, 0.58, 0.4]) {
        const lh = f * 1.38;
        const topicF = Math.max(8, f * 0.68);
        const topicH = topics ? topicF * 1.75 : 0;
        const headH = f * (pad < 0.5 ? 2.7 : 3.2);
        const iconBox = f * 1.75;
        const padV = f * pad;
        c.font = `400 ${f}px ${fonts.sans}`;
        const rows = comparison.map((r) => {
          const lines = { them: [] as string[], us: [] as string[] };
          for (const s of sides) lines[s] = wrap(c, s === "them" ? r.them : r.us, colW - iconBox);
          const n = Math.max(...sides.map((s) => lines[s].length));
          return { h: padV * 2 + topicH + n * lh, padTop: padV, lines };
        });
        const total = headH + rows.reduce((a, r) => a + r.h, 0);
        last = { f, lh, topicF, topics, headH, iconBox, rows };
        if (total <= colH) {
          // Share out the spare room as breathing space, within reason
          const extra = Math.min((colH - total) / rows.length, f * 1.5);
          for (const r of rows) {
            r.h += extra;
            r.padTop += extra / 2;
          }
          return last;
        }
        // Tighter padding is only worth trying once topics are gone
        if (topics) break;
      }
    }
  }
  return last!;
}

function cross(c: CanvasRenderingContext2D, cx: number, cy: number, f: number) {
  const a = f * 0.34;
  c.beginPath();
  c.moveTo(cx - a, cy - a);
  c.lineTo(cx + a, cy + a);
  c.moveTo(cx + a, cy - a);
  c.lineTo(cx - a, cy + a);
  c.strokeStyle = THEM.icon;
  c.lineWidth = Math.max(1, f * 0.1);
  c.lineCap = "round";
  c.stroke();
}

function tick(c: CanvasRenderingContext2D, cx: number, cy: number, f: number) {
  const r = f * 0.56;
  c.beginPath();
  c.arc(cx, cy, r, 0, Math.PI * 2);
  c.fillStyle = US.chip;
  c.fill();
  c.beginPath();
  c.moveTo(cx - r * 0.42, cy + r * 0.02);
  c.lineTo(cx - r * 0.12, cy + r * 0.32);
  c.lineTo(cx + r * 0.44, cy - r * 0.3);
  c.strokeStyle = US.text;
  c.lineWidth = Math.max(1, f * 0.12);
  c.lineCap = "round";
  c.lineJoin = "round";
  c.stroke();
}

function logo(c: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  c.save();
  c.translate(x, y);
  c.scale(size / 48, size / 48);
  c.fillStyle = color;
  c.fill(new Path2D(LOGO_PATH));
  c.restore();
}

/** A box's header (base layer). */
function header(c: CanvasRenderingContext2D, fonts: FoldFonts, side: Side, x: number, y: number, L: Layout) {
  const { f } = L;
  const mid = y + L.headH * 0.5;
  c.textBaseline = "alphabetic";
  c.textAlign = "left";
  if (side === "them") {
    c.font = `500 ${f * 0.78}px ${fonts.sans}`;
    c.fillStyle = THEM.head;
    spaced(c, "TYPICAL AGENCY", x, mid + f * 0.28, f * 0.17);
  } else {
    const size = f * 1.6;
    logo(c, x, mid - size / 2, size, US.head);
    c.font = `400 ${f * 0.98}px ${fonts.brand}`;
    c.fillStyle = US.head;
    spaced(c, "CELESTIAL DEVELOPERS", x + size + f * 0.6, mid + f * 0.35, f * 0.06);
  }
}

/** A box's points (rows layer). */
function points(c: CanvasRenderingContext2D, fonts: FoldFonts, side: Side, x: number, y: number, w: number, L: Layout) {
  const { f, lh } = L;
  const ink = side === "them" ? THEM : US;
  c.textBaseline = "alphabetic";
  c.textAlign = "left";
  let ry = y + L.headH;
  for (let i = 0; i < L.rows.length; i++) {
    const row = L.rows[i];
    c.fillStyle = ink.line;
    c.fillRect(x, ry, w, Math.max(1, f * 0.07));
    let ty = ry + row.padTop;
    const tx = x + L.iconBox;
    if (L.topics) {
      c.font = `500 ${L.topicF}px ${fonts.sans}`;
      c.fillStyle = ink.topic;
      spaced(c, comparison[i].topic.toUpperCase(), tx, ty + L.topicF * 0.95, L.topicF * 0.14);
      ty += L.topicF * 1.75;
    }
    const iconY = ty + lh * 0.5;
    if (side === "them") cross(c, x + f * 0.5, iconY, f);
    else tick(c, x + f * 0.56, iconY, f);
    c.font = `400 ${f}px ${fonts.sans}`;
    c.fillStyle = ink.text;
    row.lines[side].forEach((line, j) => c.fillText(line, tx, ty + lh * (j + 0.5) + f * 0.34));
    ry += row.h;
  }
}

function battery(c: CanvasRenderingContext2D, right: number, cy: number, h: number, color: string) {
  const w = h * 2.05;
  const x = right - w - h * 0.16;
  c.strokeStyle = color;
  c.globalAlpha = 0.45;
  c.lineWidth = Math.max(1, h * 0.09);
  c.beginPath();
  c.roundRect(x, cy - h / 2, w, h, h * 0.28);
  c.stroke();
  c.fillStyle = color;
  c.beginPath();
  c.roundRect(right - h * 0.12, cy - h * 0.18, h * 0.12, h * 0.36, h * 0.06);
  c.fill();
  c.globalAlpha = 1;
  c.beginPath();
  c.roundRect(x + h * 0.17, cy - h / 2 + h * 0.17, (w - h * 0.34) * 0.8, h - h * 0.34, h * 0.14);
  c.fill();
  return x;
}

function bars(c: CanvasRenderingContext2D, right: number, cy: number, h: number, color: string) {
  c.fillStyle = color;
  const bw = h * 0.22;
  for (let i = 0; i < 4; i++) {
    const bh = h * (0.35 + i * 0.22);
    c.beginPath();
    c.roundRect(right - (4 - i) * bw * 1.6, cy + h / 2 - bh, bw, bh, bw * 0.3);
    c.fill();
  }
}

/** Signal and battery on the right; the time on the left is left blank for the live clock. */
function statusBar(c: CanvasRenderingContext2D, w: number, sb: number, pad: number, rightInset = 0): ClockSpot {
  const cy = sb * 0.6;
  const bx = battery(c, w - pad - rightInset, cy, sb * 0.42, SCREEN.status);
  bars(c, bx - sb * 0.5, cy, sb * 0.42, SCREEN.status);
  const inset = sb * 0.3;
  return { x: pad - inset, y: 0, w: sb * 3.4, h: sb * 1.05, size: sb * 0.5, baseline: cy + sb * 0.18, pad: inset };
}

/**
 * The clock, digit by digit in fixed-width slots (so unchanged digits never
 * move). With `from` ≠ `to`, the digits that differ go on the leaving and
 * arriving layers and the rest stay still; the scene rolls them over.
 */
export function paintClock(layers: ClockLayers, spot: ClockSpot, scale: number, fonts: FoldFonts, from: string, to: string) {
  const w = Math.max(1, Math.round(spot.w * scale));
  const h = Math.max(1, Math.round(spot.h * scale));
  const ctx = (cv: HTMLCanvasElement) => {
    if (cv.width !== w) cv.width = w;
    if (cv.height !== h) cv.height = h;
    const c = cv.getContext("2d")!;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, w, h);
    c.setTransform(w / spot.w, 0, 0, h / spot.h, 0, 0);
    c.font = `600 ${spot.size}px ${fonts.sans}`;
    c.fillStyle = SCREEN.status;
    c.textAlign = "center";
    c.textBaseline = "alphabetic";
    return c;
  };
  const still = ctx(layers.still);
  const leaving = ctx(layers.from);
  const arriving = ctx(layers.to);
  let digit = 0;
  for (const d of "0123456789") digit = Math.max(digit, still.measureText(d).width);
  const colon = still.measureText(":").width + spot.size * 0.06;
  const slots = (str: string) => {
    let x = spot.pad;
    return [...str].map((ch) => {
      const cw = ch === ":" ? colon : digit;
      const at = x + cw / 2;
      x += cw;
      return at;
    });
  };
  const y = spot.baseline - spot.y;
  const xs = slots(to);
  const sameShape = from.length === to.length;
  [...to].forEach((ch, i) => {
    const changed = !sameShape || from[i] !== ch;
    (changed ? arriving : still).fillText(ch, xs[i], y);
  });
  const fx = slots(from);
  [...from].forEach((ch, i) => {
    if (!sameShape || to[i] !== ch) leaving.fillText(ch, fx[i], y);
  });
}

/** Small caps title centred across the whole display, hinge and all. */
function title(c: CanvasRenderingContext2D, fonts: FoldFonts, w: number, y: number, size: number) {
  const str = "CELESTIAL VS. A TYPICAL AGENCY";
  c.font = `500 ${size}px ${fonts.sans}`;
  c.fillStyle = SCREEN.title;
  c.textBaseline = "alphabetic";
  c.textAlign = "left";
  const sp = size * 0.22;
  spaced(c, str, w / 2 - spacedWidth(c, str, sp) / 2, y, sp);
}

function prepare(canvas: HTMLCanvasElement, cssW: number, cssH: number, scale: number, rotate: boolean) {
  const w = Math.max(1, Math.round((rotate ? cssH : cssW) * scale));
  const h = Math.max(1, Math.round((rotate ? cssW : cssH) * scale));
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  const c = canvas.getContext("2d")!;
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, w, h);
  // Upright on the page while the device is turned a quarter clockwise:
  // the screen's top runs along the texture's left edge.
  if (rotate) c.setTransform(0, -h / cssW, w / cssH, 0, 0, h);
  else c.setTransform(w / cssW, 0, 0, h / cssH, 0, 0);
  return c;
}

/**
 * The inner display, `cssW` × `cssH` as it appears on the page. `upright`
 * (phones): boxes stacked top/bottom, painted rotated into the texture.
 */
export function paintInner(
  layers: ScreenLayers,
  cssW: number,
  cssH: number,
  scale: number,
  upright: boolean,
  fonts: FoldFonts,
): ClockSpot {
  const b = prepare(layers.base, cssW, cssH, scale, upright);
  const r = prepare(layers.rows, cssW, cssH, scale, upright);
  screenBg(b, cssW, cssH);
  let clock: ClockSpot;

  if (!upright) {
    const sb = Math.min(28, Math.max(16, cssH * 0.046));
    const pad = Math.min(24, Math.max(10, cssW * 0.021));
    clock = statusBar(b, cssW, sb, pad * 1.8);
    // The faint under-display camera on the right half
    b.beginPath();
    b.arc(cssW * 0.71, sb * 0.6, sb * 0.17, 0, Math.PI * 2);
    b.fillStyle = "rgba(0, 0, 0, 0.22)";
    b.fill();
    const titleSize = Math.max(8, sb * 0.4);
    title(b, fonts, cssW, sb + titleSize * 1.5, titleSize);

    // Two boxes, the hinge running down the gap between them
    const gap = Math.min(28, Math.max(12, cssW * 0.026));
    const top = sb + titleSize * 2.7;
    const cw = cssW / 2 - gap / 2 - pad;
    const ch = cssH - top - pad;
    const radius = Math.min(20, Math.max(10, cssW * 0.018));
    const inset = Math.min(24, Math.max(11, cw * 0.055));
    const colW = cw - inset * 2;
    const L = fit(b, fonts, colW, ch - inset * 1.2, ["them", "us"], Math.min(15, Math.max(10, colW / 20)));
    const xs: [Side, number][] = [
      ["them", pad],
      ["us", cssW / 2 + gap / 2],
    ];
    for (const [side, x] of xs) {
      card(b, side, x, top, cw, ch, radius);
      header(b, fonts, side, x + inset, top + inset * 0.55, L);
      points(r, fonts, side, x + inset, top + inset * 0.55, colW, L);
    }
  } else {
    const sb = Math.min(28, Math.max(15, cssW * 0.05));
    const pad = Math.min(20, Math.max(10, cssW * 0.035));
    clock = statusBar(b, cssW, sb, pad * 1.6);
    const gap = Math.min(24, Math.max(12, cssH * 0.026));
    const cw = cssW - pad * 2;
    const radius = Math.min(18, Math.max(10, cssW * 0.035));
    const inset = Math.min(20, Math.max(10, cw * 0.05));
    const colW = cw - inset * 2;
    const topA = sb + pad * 0.2;
    const hA = cssH / 2 - gap / 2 - topA;
    const topB = cssH / 2 + gap / 2;
    const hB = cssH - pad - topB;
    // Stacked boxes needn't line up row for row; each gets its own rows at a shared size
    const base = Math.min(14, Math.max(10, colW / 22));
    const innerH = Math.min(hA, hB) - inset * 1.2;
    const a = fit(b, fonts, colW, innerH, ["them"], base);
    const z = fit(b, fonts, colW, innerH, ["us"], base);
    const topics = a.topics && z.topics;
    const f = Math.min(a.f, z.f);
    const La = fit(b, fonts, colW, innerH, ["them"], f, topics);
    const Lb = fit(b, fonts, colW, innerH, ["us"], f, topics);
    card(b, "them", pad, topA, cw, hA, radius);
    header(b, fonts, "them", pad + inset, topA + inset * 0.5, La);
    points(r, fonts, "them", pad + inset, topA + inset * 0.5, colW, La);
    card(b, "us", pad, topB, cw, hB, radius);
    header(b, fonts, "us", pad + inset, topB + inset * 0.5, Lb);
    points(r, fonts, "us", pad + inset, topB + inset * 0.5, colW, Lb);
  }
  return clock;
}

/**
 * The cover display, seen when closed: Celestial's box only, with the selfie
 * camera top right. `sideways` (phones): the closed device lies landscape,
 * so the cover is wide and painted rotated into the texture.
 */
export function paintCover(
  layers: ScreenLayers,
  cssW: number,
  cssH: number,
  scale: number,
  sideways: boolean,
  fonts: FoldFonts,
): ClockSpot {
  const b = prepare(layers.base, cssW, cssH, scale, sideways);
  const r = prepare(layers.rows, cssW, cssH, scale, sideways);
  screenBg(b, cssW, cssH);
  const sb = Math.min(28, Math.max(13, Math.min(cssW, cssH) * 0.065));
  const pad = Math.min(24, Math.max(10, Math.min(cssW, cssH) * 0.045));

  const hole = sb * 0.34;
  const hx = cssW - pad * 1.6 - hole * 0.4;
  const clock = statusBar(b, cssW, sb, pad * 1.6, hole * 3);
  b.beginPath();
  b.arc(hx, sb * 0.6, hole, 0, Math.PI * 2);
  b.fillStyle = "#050304";
  b.fill();
  b.beginPath();
  b.arc(hx - hole * 0.25, sb * 0.6 - hole * 0.25, hole * 0.28, 0, Math.PI * 2);
  b.fillStyle = "rgba(90, 110, 160, 0.35)";
  b.fill();

  const top = sb + pad * 0.25;
  const cw = cssW - pad * 2;
  const ch = cssH - top - pad;
  const radius = Math.min(20, Math.max(10, Math.min(cssW, cssH) * 0.035));
  const inset = Math.min(26, Math.max(10, cw * 0.06));
  const colW = cw - inset * 2;
  const L = fit(b, fonts, colW, ch - inset * 1.2, ["us"], Math.min(15, Math.max(10, colW / 20)));
  card(b, "us", pad, top, cw, ch, radius);
  header(b, fonts, "us", pad + inset, top + inset * 0.5, L);
  points(r, fonts, "us", pad + inset, top + inset * 0.5, colW, L);
  return clock;
}

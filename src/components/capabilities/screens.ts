import { services } from "@/lib/data";
import { deviceFor, palettes } from "./theme";

// Paints the devices' displays: one small product UI per capability, drawn
// into a 2D canvas that the 3D scene uses as the screen texture. Laptop
// capabilities get a desktop app, phone capabilities a mobile one.

const SCREEN_W = 1280;
const SCREEN_H = 832;
export const PHONE_W = 720;
export const PHONE_H = 1578;
const BAR = 52; // window title bar height

type UI = {
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
const darkUI: UI = {
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

const lightUI: UI = {
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

const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

const easeInOut = (v: number) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

class Painter {
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

/* ── Website & e-commerce ───────────────────────────────────────── */
function web(p: Painter) {
  const { ui, ctx: c } = p;
  p.chrome("yourbrand.com");

  p.text("yourbrand", 64, 106, 24, ui.text, 700);
  ["Shop", "Collections", "Journal", "About"].forEach((l, i) => p.text(l, 470 + i * 112, 104, 16, ui.muted, 500));
  p.fill(1110, 80, 106, 38, 19, ui.panel2);
  p.text("Cart · 2", 1163, 105, 15, ui.text, 600, "center");

  p.pill(64, 160, "New collection", ui.accent, ui.soft);
  p.text("Built for speed.", 62, 262, 62, ui.text, 700);
  p.text("Made to convert.", 62, 334, 62, ui.accent, 700);
  p.text("Storefronts, portals and checkouts that feel instant.", 64, 384, 20, ui.muted, 400);
  p.fill(64, 418, 176, 54, 27, ui.accent);
  p.text("Shop now", 152, 452, 18, ui.bg, 600, "center");
  p.stroke(256, 419, 156, 52, 26, ui.line, 2);
  p.text("Explore", 334, 452, 18, ui.text, 600, "center");

  // Hero image
  p.fill(700, 150, 516, 330, 26, p.gradient(700, 150, 1216, 480, [[0, ui.accent], [1, ui.accent2]]));
  const g = c.createRadialGradient(990, 280, 10, 990, 280, 220);
  g.addColorStop(0, "rgba(255,255,255,0.38)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  p.fill(700, 150, 516, 330, 26, g);
  p.dot(958, 300, 86, "rgba(255,255,255,0.22)");
  p.dot(958, 300, 54, "rgba(255,255,255,0.3)");

  // Floating "order placed" card
  p.card(668, 404, 262, 66, 16);
  p.dot(696, 437, 8, ui.good);
  p.text("Order placed", 716, 432, 16, ui.text, 600);
  p.text("just now · checkout 1.2s", 716, 454, 13, ui.muted, 400);

  // Speed score badge
  p.card(1010, 404, 230, 84, 18);
  c.save();
  c.lineWidth = 7;
  c.lineCap = "round";
  c.strokeStyle = ui.line;
  c.beginPath();
  c.arc(1056, 446, 26, 0, Math.PI * 2);
  c.stroke();
  c.strokeStyle = ui.good;
  c.beginPath();
  c.arc(1056, 446, 26, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.98);
  c.stroke();
  c.restore();
  p.text("98", 1056, 453, 18, ui.text, 700, "center");
  p.text("Performance", 1096, 440, 16, ui.text, 600);
  p.text("page speed score", 1096, 462, 13, ui.muted, 400);

  // Product grid
  const tones: [number, string][][] = [
    [[0, ui.accent2], [1, ui.panel2]],
    [[0, ui.panel2], [1, ui.accent]],
    [[0, ui.soft], [1, ui.accent2]],
    [[0, ui.accent], [1, ui.panel2]],
  ];
  ["Linen Shirt", "Clay Vase", "Oak Stool", "Wool Throw"].forEach((name, i) => {
    const x = 64 + i * 293;
    p.card(x, 520, 273, 276, 20);
    p.fill(x + 12, 532, 249, 164, 14, p.gradient(x, 532, x + 249, 696, tones[i]));
    p.text(name, x + 18, 728, 17, ui.text, 600);
    p.text("In stock · ships today", x + 18, 752, 13, ui.muted, 400);
    p.fill(x + 18, 764, 104, 22, 11, ui.soft);
    p.text("Add to cart", x + 70, 779, 12, ui.accent, 600, "center");
  });
}

/* ── Automation & custom software ───────────────────────────────── */
function automation(p: Painter) {
  const { ui, ctx: c } = p;
  p.chrome("Workflow · new lead → follow-up");

  c.fillStyle = ui.line;
  for (let x = 24; x < SCREEN_W; x += 32) for (let y = BAR + 24; y < SCREEN_H; y += 32) c.fillRect(x, y, 2, 2);

  p.text("Lead follow-up", 48, 112, 28, ui.text, 700);
  p.dot(1000, 101, 6, ui.good);
  const w = p.pill(1014, 86, "Live", ui.good, ui.panel2);
  p.text("1,284 runs today", 1014 + w + 12, 110, 15, ui.muted, 500);

  const NW = 250, NH = 88;
  const nodes = [
    { x: 48, y: 170, title: "New form lead", sub: "Website · WhatsApp", kind: "trigger" },
    { x: 360, y: 170, title: "Enrich contact", sub: "Company, source, intent" },
    { x: 672, y: 170, title: "High intent?", sub: "Score ≥ 70", kind: "if" },
    { x: 984, y: 170, title: "Assign sales rep", sub: "Round robin" },
    { x: 672, y: 400, title: "Nurture sequence", sub: "5 emails · 3 weeks" },
    { x: 984, y: 400, title: "Send follow-up", sub: "WhatsApp + email" },
    { x: 984, y: 630, title: "Update CRM", sub: "Deal created" },
  ];
  const links: [number, number, string?][] = [
    [0, 1],
    [1, 2],
    [2, 3, "Yes"],
    [2, 4, "No"],
    [3, 5],
    [5, 6],
  ];

  links.forEach(([from, to, label]) => {
    const A = nodes[from], B = nodes[to];
    const horizontal = A.y === B.y;
    const [x0, y0] = horizontal ? [A.x + NW, A.y + NH / 2] : [A.x + NW / 2, A.y + NH];
    const [x1, y1] = horizontal ? [B.x, B.y + NH / 2] : [B.x + NW / 2, B.y];
    c.save();
    c.strokeStyle = ui.accent;
    c.globalAlpha *= 0.75;
    c.lineWidth = 2.5;
    c.beginPath();
    c.moveTo(x0, y0);
    if (horizontal) c.bezierCurveTo((x0 + x1) / 2, y0, (x0 + x1) / 2, y1, x1, y1);
    else c.bezierCurveTo(x0, (y0 + y1) / 2, x1, (y0 + y1) / 2, x1, y1);
    c.stroke();
    c.restore();
    p.dot(x1, y1, 5, ui.accent);
    if (label) {
      const lx = horizontal ? (x0 + x1) / 2 - 20 : x0 + 12;
      const ly = horizontal ? y0 - 34 : (y0 + y1) / 2 - 14;
      p.pill(lx, ly, label, label === "Yes" ? ui.good : ui.muted, ui.panel2, 12);
    }
  });

  nodes.forEach((n) => {
    p.card(n.x, n.y, NW, NH, 18);
    if (n.kind === "if") p.stroke(n.x + 1, n.y + 1, NW - 2, NH - 2, 17, ui.accent, 2);
    p.fill(n.x + 16, n.y + 22, 44, 44, 12, n.kind === "trigger" ? ui.accent : ui.soft);
    p.text(n.kind === "if" ? "?" : n.kind === "trigger" ? "⚡" : "✓", n.x + 38, n.y + 51, 20, n.kind === "trigger" ? ui.bg : ui.accent, 700, "center");
    p.text(n.title, n.x + 76, n.y + 42, 17, ui.text, 600);
    p.text(n.sub, n.x + 76, n.y + 64, 13, ui.muted, 400);
  });

  // Run log
  p.card(48, 400, 560, 400, 20);
  p.text("Recent runs", 72, 442, 18, ui.text, 600);
  p.text("Saved 46 hrs this week", 584, 442, 14, ui.muted, 500, "right");
  [
    ["Lead #2481 → assigned to sales", "2s"],
    ["Lead #2480 → nurture sequence", "1m"],
    ["Quote #318 → follow-up sent", "4m"],
    ["Lead #2479 → assigned to sales", "9m"],
    ["Invoice #902 → reminder sent", "12m"],
  ].forEach(([t, ago], i) => {
    const y = 474 + i * 62;
    p.fill(64, y, 528, 50, 12, ui.panel2);
    p.dot(88, y + 25, 9, ui.good);
    p.text("✓", 88, y + 30, 12, ui.bg, 700, "center");
    p.text(t, 110, y + 31, 15, ui.text, 500);
    p.text(ago, 576, y + 31, 13, ui.muted, 500, "right");
  });
}

/* ── API & data systems ─────────────────────────────────────────── */
const JSON_LINES: [string, string][] = [
  ["{", "p"],
  ['  "source": "storefront",', "s"],
  ['  "target": "crm",', "s"],
  ['  "records": 2481,', "n"],
  ['  "dedupe": true,', "n"],
  ['  "mode": "realtime"', "s"],
  ["}", "p"],
];

function api(p: Painter) {
  const { ui, ctx: c } = p;
  p.chrome("Integrations · data sync");

  // Hub
  p.text("Connected systems", 40, 112, 28, ui.text, 700);
  const cx = 370, cy = 470;
  const sats = ["Website", "CRM", "Payments", "Inventory", "Email", "Analytics"];
  sats.forEach((name, i) => {
    const ang = -Math.PI / 2 + (i / sats.length) * Math.PI * 2;
    const sx = cx + Math.cos(ang) * 270;
    const sy = cy + Math.sin(ang) * 255;
    c.save();
    c.strokeStyle = ui.accent;
    c.globalAlpha *= 0.55;
    c.lineWidth = 2;
    c.setLineDash([6, 8]);
    c.beginPath();
    c.moveTo(cx, cy);
    c.lineTo(sx, sy);
    c.stroke();
    c.restore();
    // Data packets on their way in from the last three systems
    const k = 1.25 - i * 0.1;
    if (k < 1) p.dot(lerp(sx, cx, easeInOut(k)), lerp(sy, cy, easeInOut(k)), 6, ui.accent);
    p.card(sx - 82, sy - 30, 164, 60, 16);
    p.dot(sx - 56, sy, 8, i % 2 ? ui.accent2 : ui.accent);
    p.text(name, sx - 38, sy + 6, 16, ui.text, 600);
  });
  p.dot(cx, cy, 96, ui.soft);
  p.dot(cx, cy, 70, ui.accent);
  p.text("Core", cx, cy + 2, 24, ui.bg, 700, "center");
  p.text("one source of truth", cx, cy + 24, 11, ui.bg, 500, "center");

  // Request panel
  const X = 760, Y = 84;
  p.fill(X, Y, 480, 716, 20, ui.code);
  p.pill(X + 24, Y + 24, "POST", "#17110f", "#d9b8a3", 13);
  p.text("/v1/sync", X + 96, Y + 47, 17, "#f3ebe3", 500, "left", true);
  c.fillStyle = "rgba(255,238,226,0.08)";
  c.fillRect(X, Y + 80, 480, 1);
  const colors: Record<string, string> = { p: "#f3ebe3", s: "#e7a3b4", n: "#b9d6c0" };
  JSON_LINES.forEach(([line, kind], i) => {
    const [key, ...rest] = line.split(":");
    const y = Y + 130 + i * 34;
    if (rest.length) {
      p.text(`${key}:`, X + 28, y, 17, "#d9b8a3", 500, "left", true);
      c.font = `500 17px ${MONO}`;
      p.text(rest.join(":"), X + 28 + c.measureText(`${key}:`).width, y, 17, colors[kind], 500, "left", true);
    } else p.text(line, X + 28, y, 17, colors[kind], 500, "left", true);
  });

  c.fillStyle = "rgba(255,238,226,0.08)";
  c.fillRect(X, Y + 400, 480, 1);
  p.dot(X + 34, Y + 446, 8, "#8cc09a");
  p.text("200 OK", X + 54, Y + 452, 18, "#f3ebe3", 700, "left", true);
  p.text("84 ms", X + 456, Y + 452, 15, "rgba(243,235,227,0.5)", 500, "right", true);
  [
    ["records synced", "2,481"],
    ["duplicates merged", "37"],
    ["systems updated", "6"],
  ].forEach(([k, v], i) => {
    const y = Y + 510 + i * 54;
    p.fill(X + 24, y - 30, 432, 44, 10, "rgba(255,238,226,0.05)");
    p.text(k, X + 42, y - 2, 15, "rgba(243,235,227,0.6)", 500, "left", true);
    p.text(v, X + 438, y - 2, 15, "#f3ebe3", 700, "right", true);
  });
}

/* ── Phone screens ───────────────────────────────────────────────────── */
const PM = 40; // side margin
const PCW = PHONE_W - PM * 2; // content width
const TAB_Y = 1432; // top of the tab bar

/** Status bar, tab bar and home indicator. The 3D Dynamic Island sits in the status bar's gap. */
function phoneFrame(p: Painter, tabs: string[]) {
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

function phoneHeader(p: Painter, kicker: string, title: string) {
  const { ui } = p;
  p.text(kicker, PM, 150, 24, ui.muted, 500);
  p.text(title, PM - 2, 218, 64, ui.text, 700);
  p.dot(PHONE_W - PM - 32, 190, 32, ui.accent2);
  p.dot(PHONE_W - PM - 32, 190, 13, ui.panel);
}

/* ── CRM & business systems ─────────────────────────────────────── */
function crmPhone(p: Painter) {
  const { ui } = p;
  phoneFrame(p, ["Deals", "Contacts", "Quotes", "Reports"]);
  phoneHeader(p, "Pipeline", "Deals");

  let x = PM;
  x += p.pill(x, 252, "48 open", ui.text, ui.panel2, 22) + 12;
  x += p.pill(x, 252, "Win rate 42%", ui.good, ui.panel2, 22) + 12;
  p.pill(x, 252, "12 today", ui.accent, ui.soft, 22);

  // Pipeline value + stage split
  p.card(PM, 330, PCW, 196, 28);
  p.text("Pipeline value", PM + 28, 378, 22, ui.muted, 500);
  p.text("$248,600", PM + 26, 446, 56, ui.text, 700);
  p.pill(PM + PCW - 28 - p.pillWidth("+18%", 20), 352, "+18%", ui.good, ui.panel2, 20);
  const split: [number, string][] = [
    [0.32, ui.accent2],
    [0.26, ui.accent],
    [0.22, ui.muted],
    [0.2, ui.good],
  ];
  let bx = PM + 28;
  const bw = PCW - 56 - 6 * 3;
  split.forEach(([f, col]) => {
    p.fill(bx, 478, bw * f, 14, 7, col);
    bx += bw * f + 6;
  });

  p.text("Follow-ups today", PM, 596, 28, ui.text, 600);
  p.text("See all", PHONE_W - PM, 596, 22, ui.accent, 600, "right");
  const deals: [string, string, string, number][] = [
    ["Aster & Co", "Proposal", "Follow-up in 1d", 0.8],
    ["Meridian Foods", "Qualified", "Quote sent", 0.55],
    ["Northwind Co", "Lead", "Intro call today", 0.3],
    ["Halcyon Studio", "Qualified", "Follow-up in 2d", 0.6],
  ];
  deals.forEach(([name, stage, sub, v], i) => {
    const y = 622 + i * 154;
    p.card(PM, y, PCW, 138, 24);
    p.dot(PM + 52, y + 69, 30, i % 2 ? ui.accent2 : ui.accent);
    p.text(name[0], PM + 52, y + 79, 26, ui.bg, 700, "center");
    p.text(name, PM + 100, y + 56, 27, ui.text, 600);
    p.text(sub, PM + 100, y + 92, 20, ui.muted, 400);
    p.fill(PM + 100, y + 110, 300, 8, 4, ui.line);
    p.fill(PM + 100, y + 110, 300 * v, 8, 4, ui.accent);
    p.pill(PM + PCW - 24 - p.pillWidth(stage, 18), y + 24, stage, ui.accent, ui.soft, 18);
  });

  p.card(PM, 1256, PCW, 132, 24);
  p.dot(PM + 44, 1322, 12, ui.good);
  p.text("Deal won · Solace Hotels", PM + 74, 1312, 26, ui.text, 600);
  p.text("Welcome email & invoice sent automatically", PM + 74, 1348, 20, ui.muted, 400);
}

/* ── Meta & Google Ads ──────────────────────────────────────────── */
function series(n: number, seed: number, rise: number) {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    out.push(0.18 + t * rise + Math.sin(i * 0.9 + seed) * 0.045 + Math.sin(i * 0.37 + seed * 2) * 0.03);
  }
  return out;
}
const META = series(28, 1, 0.62);
const GOOGLE = series(28, 4, 0.42);

function adsPhone(p: Painter) {
  const { ui, ctx: c } = p;
  phoneFrame(p, ["Overview", "Campaigns", "Audiences", "Reports"]);
  phoneHeader(p, "Last 30 days", "Growth");

  const seg = PCW / 3;
  p.fill(PM, 252, PCW, 58, 29, ui.panel2);
  p.fill(PM + seg * 2 + 4, 256, seg - 8, 50, 25, ui.panel);
  ["Meta", "Google", "All"].forEach((l, i) => p.text(l, PM + seg * (i + 0.5), 289, 22, i === 2 ? ui.text : ui.muted, 600, "center"));

  // Return on ad spend + conversions chart
  p.card(PM, 336, PCW, 430, 28);
  p.text("Return on ad spend", PM + 28, 386, 22, ui.muted, 500);
  p.text("4.8×", PM + 24, 476, 92, ui.text, 700);
  p.pill(PM + PCW - 28 - p.pillWidth("+1.6×", 20), 358, "+1.6×", ui.good, ui.panel2, 20);
  p.dot(PM + PCW - 196, 466, 7, ui.accent);
  p.text("Meta", PM + PCW - 182, 473, 20, ui.muted, 500);
  p.dot(PM + PCW - 104, 466, 7, ui.accent2);
  p.text("Google", PM + PCW - 90, 473, 20, ui.muted, 500);
  const gx = PM + 28, gy = 522, gw = PCW - 56, gh = 214;
  c.fillStyle = ui.line;
  for (let i = 0; i <= 3; i++) c.fillRect(gx, gy + (gh * i) / 3, gw, 1);
  const pts = (s: number[]) => s.map((v, i): [number, number] => [gx + (gw * i) / (s.length - 1), gy + gh - v * gh]);
  const end = p.curve(pts(META));
  c.lineTo(end[0], gy + gh);
  c.lineTo(gx, gy + gh);
  c.closePath();
  c.fillStyle = p.gradient(0, gy, 0, gy + gh, [[0, ui.soft], [1, "rgba(0,0,0,0)"]]);
  c.fill();
  c.lineCap = "round";
  c.lineWidth = 4;
  c.strokeStyle = ui.accent2;
  p.curve(pts(GOOGLE));
  c.stroke();
  c.lineWidth = 5;
  c.strokeStyle = ui.accent;
  const tip = p.curve(pts(META));
  c.stroke();
  p.dot(tip[0], tip[1], 14, ui.soft);
  p.dot(tip[0], tip[1], 7, ui.accent);

  const kpis = [
    ["Click-through", "3.2%", "+0.9 pts"],
    ["Leads", "1,284", "+62%"],
    ["Cost per lead", "−38%", "vs last month"],
    ["Conversions", "412", "+44%"],
  ];
  kpis.forEach(([label, value, delta], i) => {
    const x = PM + (i % 2) * (PCW / 2 + 10);
    const y = 790 + Math.floor(i / 2) * 180;
    p.card(x, y, PCW / 2 - 10, 160, 24);
    p.text(label, x + 24, y + 46, 21, ui.muted, 500);
    p.text(value, x + 22, y + 104, 44, ui.text, 700);
    p.text(delta, x + 24, y + 138, 19, ui.good, 600);
  });

  p.card(PM, 1150, PCW, 262, 28);
  p.text("Top campaigns", PM + 28, 1198, 26, ui.text, 600);
  (
    [
      ["Retargeting · Meta", 0.92],
      ["Search · Brand", 0.78],
      ["Lookalike · Meta", 0.64],
    ] as const
  ).forEach(([name, v], i) => {
    const y = 1250 + i * 56;
    p.text(name, PM + 28, y, 21, ui.text, 500);
    p.fill(PM + 28, y + 14, PCW - 56, 10, 5, ui.line);
    p.fill(PM + 28, y + 14, (PCW - 56) * v, 10, 5, i === 1 ? ui.accent2 : ui.accent);
  });
}

/* ── Managed tech & CTO support ─────────────────────────────────── */
function ctoPhone(p: Painter) {
  const { ui } = p;
  phoneFrame(p, ["Status", "Alerts", "Deploys", "Team"]);
  phoneHeader(p, "Monitoring", "Status");

  p.card(PM, 254, PCW, 150, 28);
  p.dot(PM + 50, 329, 24, ui.soft);
  p.dot(PM + 50, 329, 12, ui.good);
  p.text("All systems operational", PM + 92, 322, 30, ui.text, 700);
  p.text("Monitored 24/7 · updated just now", PM + 92, 358, 21, ui.muted, 500);

  p.card(PM, 424, PCW, 188, 28);
  p.text("Uptime · 90 days", PM + 28, 474, 22, ui.muted, 500);
  p.text("99.98%", PM + PCW - 28, 478, 34, ui.text, 700, "right");
  const bars = 45;
  const step = (PCW - 56) / bars;
  for (let i = 0; i < bars; i++) {
    const dip = i === 11 || i === 31;
    p.fill(PM + 28 + i * step, 510, step - 4, 66, 3, dip ? ui.accent2 : ui.good);
  }

  const tiles = [
    ["p95 latency", "182 ms"],
    ["Deploys this week", "14"],
    ["Open incidents", "0"],
    ["CPU load", "34%"],
  ];
  tiles.forEach(([label, value], i) => {
    const x = PM + (i % 2) * (PCW / 2 + 10);
    const y = 632 + Math.floor(i / 2) * 180;
    p.card(x, y, PCW / 2 - 10, 160, 24);
    p.text(label, x + 24, y + 48, 21, ui.muted, 500);
    p.text(value, x + 22, y + 116, 46, i === 2 ? ui.good : ui.text, 700);
  });

  // Terminal
  const Y = 992;
  p.fill(PM, Y, PCW, 420, 28, ui.code);
  for (let i = 0; i < 3; i++) p.dot(PM + 34 + i * 24, Y + 36, 7, "rgba(255,238,226,0.16)");
  const lines: [string, string, string][] = [
    ["$ deploy --env production", "", "#f3ebe3"],
    ["  build", "done · 41s", "#d9b8a3"],
    ["  tests", "312 passed", "#d9b8a3"],
    ["  database", "migrated", "#d9b8a3"],
    ["  rollout", "zero downtime", "#d9b8a3"],
    ["✓ live in production", "", "#8cc09a"],
  ];
  let y = Y + 104;
  lines.forEach(([l, r, col], i) => {
    p.text(l, PM + 32, y, 23, col, i === 0 || i === 5 ? 600 : 500, "left", true);
    if (r) p.text(r, PM + PCW - 32, y, 22, "#8cc09a", 500, "right", true);
    y += 46;
  });
  p.text("$", PM + 32, y, 23, "#f3ebe3", 600, "left", true);
  p.fill(PM + 54, y - 19, 13, 25, 2, "#f3ebe3");
}

// Odd capabilities show on the laptop and even ones on the phone (see deviceFor),
// so each capability only needs the screen for its own device.
type ScreenKey = (typeof services)[number]["icon"];
type ScreenFn = (p: Painter) => void;
const laptopScreens: Partial<Record<ScreenKey, ScreenFn>> = { web, automation, api };
const phoneScreens: Partial<Record<ScreenKey, ScreenFn>> = { crm: crmPhone, ads: adsPhone, cto: ctoPhone };

/**
 * Paints a capability's UI (1–6), sized for the device that step shows.
 * Screens are painted once and reused as textures, so nothing is redrawn while
 * scrolling. A capability moved to the other device gets a plain titled screen
 * until it has a UI of its own.
 */
export function paintScreen(step: number, canvas = document.createElement("canvas")) {
  const phone = deviceFor(step) === "phone";
  const w = phone ? PHONE_W : SCREEN_W;
  const h = phone ? PHONE_H : SCREEN_H;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  // The page's resolved font stack (includes next/font's generated Inter family)
  const sans = getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
  const painter = new Painter(ctx, palettes[step].dark ? lightUI : darkUI, sans);
  const service = services[step - 1];
  ctx.save();
  ctx.clearRect(0, 0, w, h);
  const draw = (phone ? phoneScreens : laptopScreens)[service.icon];
  if (draw) draw(painter);
  else if (phone) {
    phoneFrame(painter, ["Home", "Activity", "Inbox", "Settings"]);
    phoneHeader(painter, `Capability ${service.num}`, service.short);
  } else {
    painter.chrome(service.title);
    painter.text(service.short, 64, 140, 40, painter.ui.text, 700);
  }
  ctx.restore();
  return canvas;
}

/* The binder's fixed pieces: geometry shared by every layer, the saddle stitching,
   the gold screws that hold it to the wall and the four-ring mechanism.

   Everything is laid out in book units: the open binder is 1000 × 625 units, and
   the book's root is a size container, so one unit is 0.1cqw at any width. SVGs
   use the same numbers as their viewBox. */

export const BOOK_W = 1000;
export const BOOK_H = 625;
/** Book units → CSS length (the book root is the size container) */
export const u = (n: number) => `${n / 10}cqw`;

export const SPINE = BOOK_W / 2;
/** Pages: top/bottom edges, and the outer edge's distance from the book's side */
export const PAGE_TOP = 46;
export const PAGE_H = 533;
export const PAGE_OUTER = 84;
/** Gap between the spine and a page's inner edge, where the rings cross */
export const PAGE_GAP = 24;
export const PAPER_W = SPINE - PAGE_OUTER - PAGE_GAP;
/** A leaf turns about the spine, so it spans spine → outer edge */
export const SHEET_W = SPINE - PAGE_OUTER;
/** Ring centres down the spine, and the punched holes' distance from the spine */
export const RINGS_Y = [121, 243, 382, 504];
export const HOLE_X = 40;

/** Polished champagne gold, shared by the screws, plate and rings */
const GOLD = {
  glint: "#fffaf0",
  hi: "#fbe8bd",
  light: "#ecca86",
  mid: "#c99a52",
  dark: "#8f6328",
  deep: "#553612",
};
/** Dusty rosewood thread */
const THREAD = "#985B5D";

/* ---------- stitching ---------- */

type Seg = { x0: number; y0: number; x1: number; y1: number } | { cx: number; cy: number; r: number; a0: number; a1: number };

/** Clockwise outline of a rounded rectangle as straight runs and quarter arcs */
function roundRect(x: number, y: number, w: number, h: number, r: number): Seg[] {
  const R = x + w;
  const B = y + h;
  const q = Math.PI / 2;
  return [
    { x0: x + r, y0: y, x1: R - r, y1: y },
    { cx: R - r, cy: y + r, r, a0: -q, a1: 0 },
    { x0: R, y0: y + r, x1: R, y1: B - r },
    { cx: R - r, cy: B - r, r, a0: 0, a1: q },
    { x0: R - r, y0: B, x1: x + r, y1: B },
    { cx: x + r, cy: B - r, r, a0: q, a1: 2 * q },
    { x0: x, y0: B - r, x1: x, y1: y + r },
    { cx: x + r, cy: y + r, r, a0: 2 * q, a1: 3 * q },
  ];
}

const segLen = (s: Seg) => ("r" in s ? s.r * (s.a1 - s.a0) : Math.hypot(s.x1 - s.x0, s.y1 - s.y0));

/** Point and unit tangent at distance d along the outline */
function along(segs: Seg[], d: number) {
  for (const s of segs) {
    const L = segLen(s);
    if (d <= L) {
      if ("r" in s) {
        const a = s.a0 + d / s.r;
        return { x: s.cx + s.r * Math.cos(a), y: s.cy + s.r * Math.sin(a), tx: -Math.sin(a), ty: Math.cos(a) };
      }
      const t = d / L;
      return { x: s.x0 + (s.x1 - s.x0) * t, y: s.y0 + (s.y1 - s.y0) * t, tx: (s.x1 - s.x0) / L, ty: (s.y1 - s.y0) / L };
    }
    d -= L;
  }
  return along(segs, 0);
}

/**
 * Saddle stitches along an outline: each stitch a short run of thread set at a
 * slight slant (as a pricking iron leaves them), sunk into a hole at each end.
 * Returns path data for the thread, its highlight and the holes.
 */
function stitchPaths(segs: Seg[], pitch: number) {
  const total = segs.reduce((n, s) => n + segLen(s), 0);
  const count = Math.round(total / pitch);
  const step = total / count;
  const len = step * 0.66;
  const slant = (16 * Math.PI) / 180;
  const f = (n: number) => n.toFixed(2);
  let thread = "";
  let shine = "";
  let holes = "";
  for (let i = 0; i < count; i++) {
    const p = along(segs, (i + 0.5) * step);
    const dx = p.tx * Math.cos(slant) - p.ty * Math.sin(slant);
    const dy = p.tx * Math.sin(slant) + p.ty * Math.cos(slant);
    const ax = p.x - (dx * len) / 2;
    const ay = p.y - (dy * len) / 2;
    const bx = p.x + (dx * len) / 2;
    const by = p.y + (dy * len) / 2;
    thread += `M${f(ax)} ${f(ay)}L${f(bx)} ${f(by)}`;
    // the lit crest of the thread, nudged towards the light (top-left)
    shine += `M${f(ax + dx * len * 0.18 - 0.45)} ${f(ay + dy * len * 0.18 - 0.55)}L${f(bx - dx * len * 0.22 - 0.45)} ${f(by - dy * len * 0.22 - 0.55)}`;
    const hx = p.x + (p.tx * step) / 2;
    const hy = p.y + (p.ty * step) / 2;
    holes += `M${f(hx)} ${f(hy)}h0`;
  }
  return { thread, shine, holes };
}

const COVER_STITCH = roundRect(14, 14, BOOK_W - 28, BOOK_H - 28, 11);
const coverStitches = stitchPaths(COVER_STITCH, 10.5);

/** Closure tab on the right edge: it lies on the cover and runs past it onto the wall */
export const TAB = { x: 952, y: 296, w: 94, h: 108, r: 15 };
const tabStitches = stitchPaths(roundRect(TAB.x + 9, TAB.y + 9, TAB.w - 18, TAB.h - 18, 8), 10);

function Stitches({ s, groove }: { s: ReturnType<typeof stitchPaths>; groove: string }) {
  return (
    <g>
      {/* The groove the stitches sit in: a pressed line with a lit lower lip */}
      <path d={groove} fill="none" stroke="rgba(6,0,2,0.42)" strokeWidth={2.6} />
      <path d={groove} fill="none" stroke="rgba(255,196,196,0.06)" strokeWidth={1} transform="translate(0.6 1.4)" />
      <path d={s.holes} stroke="#0b0103" strokeWidth={2.4} strokeLinecap="round" />
      {/* Waxed thread: cast shadow, body, the shaded underside, then the lit crest */}
      <path d={s.thread} stroke="rgba(8,0,2,0.8)" strokeWidth={4} strokeLinecap="round" transform="translate(0.6 1.2)" filter="url(#nb-soft)" />
      <path d={s.thread} stroke={THREAD} strokeWidth={3.2} strokeLinecap="round" />
      <path d={s.thread} stroke="#5a2a2d" strokeOpacity={0.55} strokeWidth={1.3} strokeLinecap="round" transform="translate(0.45 0.75)" />
      <path d={s.shine} stroke="#c99495" strokeOpacity={0.45} strokeWidth={0.9} strokeLinecap="round" />
    </g>
  );
}

/** Rounded-rect outline as path data (for the stitching grooves) */
function outline(segs: Seg[]) {
  const f = (n: number) => n.toFixed(2);
  let d = "";
  for (const s of segs) {
    if ("r" in s) {
      d += `A${s.r} ${s.r} 0 0 1 ${f(s.cx + s.r * Math.cos(s.a1))} ${f(s.cy + s.r * Math.sin(s.a1))}`;
    } else {
      d += `${d ? "L" : "M"}${f(s.x0)} ${f(s.y0)}L${f(s.x1)} ${f(s.y1)}`;
    }
  }
  return `${d}Z`;
}

const COVER_GROOVE = outline(COVER_STITCH);
const TAB_GROOVE = outline(roundRect(TAB.x + 9, TAB.y + 9, TAB.w - 18, TAB.h - 18, 8));

/** Filters shared by the binder's SVGs (first SVG in the book defines them) */
function SharedDefs() {
  return (
    <defs>
      <filter id="nb-soft" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="0.7" />
      </filter>
      <filter id="nb-blur2" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="2.2" />
      </filter>
      <filter id="nb-blur5" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="5" />
      </filter>
    </defs>
  );
}

/** Leather-level detail under the tab: spine folds and the cover's perimeter stitching */
export function CoverDetail() {
  return (
    <svg viewBox={`0 0 ${BOOK_W} ${BOOK_H}`} className="absolute inset-0 h-full w-full" aria-hidden>
      <SharedDefs />
      {/* Where the cover folds either side of the spine */}
      {[SPINE - 33, SPINE + 33].map((x) => (
        <g key={x}>
          <rect x={x - 5} y={0} width={10} height={BOOK_H} fill="rgba(5,0,1,0.35)" filter="url(#nb-blur2)" />
          <line x1={x} y1={4} x2={x} y2={BOOK_H - 4} stroke="rgba(4,0,1,0.6)" strokeWidth={1.3} />
          <line x1={x + 1.6} y1={4} x2={x + 1.6} y2={BOOK_H - 4} stroke="rgba(255,200,200,0.07)" strokeWidth={1} />
        </g>
      ))}
      <Stitches s={coverStitches} groove={COVER_GROOVE} />
    </svg>
  );
}

/* ---------- screws ---------- */

/** Corner screws: centre and the angle each slot happened to stop at */
const SCREWS = [
  { x: 44, y: 44, a: 28 },
  { x: BOOK_W - 44, y: 44, a: -14 },
  { x: 44, y: BOOK_H - 44, a: 71 },
  { x: BOOK_W - 44, y: BOOK_H - 44, a: 7 },
];

/**
 * Domed, slotted gold screw heads: polished dome lit from the top left, a
 * reflected rim from the wall below, a crisp cut slot, and the leather pressed
 * into a shallow dimple around each one.
 */
export function Screws() {
  return (
    <svg viewBox={`0 0 ${BOOK_W} ${BOOK_H}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
      <defs>
        <radialGradient id="nb-dimple">
          <stop offset="0.62" stopColor="#000" stopOpacity="0.55" />
          <stop offset="0.8" stopColor="#000" stopOpacity="0.22" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="nb-rim" x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor={GOLD.hi} />
          <stop offset="0.45" stopColor={GOLD.mid} />
          <stop offset="1" stopColor={GOLD.deep} />
        </linearGradient>
        <radialGradient id="nb-dome" cx="0.36" cy="0.3" r="0.78">
          <stop offset="0" stopColor={GOLD.glint} />
          <stop offset="0.16" stopColor={GOLD.hi} />
          <stop offset="0.42" stopColor={GOLD.light} />
          <stop offset="0.72" stopColor={GOLD.mid} />
          <stop offset="0.92" stopColor={GOLD.dark} />
          <stop offset="1" stopColor={GOLD.deep} />
        </radialGradient>
        <linearGradient id="nb-bounce" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0.55" stopColor="#fff3d6" stopOpacity="0" />
          <stop offset="1" stopColor="#fff3d6" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="nb-slot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2c1a05" />
          <stop offset="0.6" stopColor="#5a3c14" />
          <stop offset="1" stopColor="#8a6428" />
        </linearGradient>
      </defs>
      {SCREWS.map((s) => (
        <g key={`${s.x}-${s.y}`} transform={`translate(${s.x} ${s.y})`}>
          <circle r={25} fill="url(#nb-dimple)" />
          {/* cast shadow on the leather */}
          <circle cx={1.6} cy={3} r={16.5} fill="#050001" opacity={0.7} filter="url(#nb-soft)" />
          <circle r={17} fill="url(#nb-rim)" />
          <circle r={15.4} fill="url(#nb-dome)" />
          {/* wall light bouncing into the lower right of the dome */}
          <circle r={15.4} fill="url(#nb-bounce)" />
          <g transform={`rotate(${s.a})`}>
            <rect x={-14.8} y={-1.8} width={29.6} height={3.6} rx={0.5} fill="url(#nb-slot)" />
            {/* the slot's far wall catches the light */}
            <rect x={-14.4} y={1.05} width={28.8} height={0.75} fill={GOLD.hi} opacity={0.8} />
            <rect x={-14.4} y={-1.8} width={28.8} height={0.6} fill="#1d1003" opacity={0.7} />
          </g>
          {/* specular glint and a fainter secondary */}
          <ellipse cx={-5.6} cy={-6.4} rx={4.4} ry={2.6} transform="rotate(-35 -5.6 -6.4)" fill="#fff" opacity={0.85} filter="url(#nb-soft)" />
          <circle cx={6.5} cy={7.6} r={1.6} fill="#fff6e0" opacity={0.45} filter="url(#nb-soft)" />
        </g>
      ))}
    </svg>
  );
}

/** Stitching round the closure tab (drawn over the tab, which sits over the cover) */
export function TabStitches() {
  return (
    <svg viewBox={`0 0 ${BOOK_W} ${BOOK_H}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
      <Stitches s={tabStitches} groove={TAB_GROOVE} />
    </svg>
  );
}

/* ---------- ring mechanism ---------- */

const PLATE = { x: SPINE - 19, y: 34, w: 38, h: BOOK_H - 68 };

/** The gold plate riveted down the spine. Sits under the pages' edges. */
export function Plate() {
  return (
    <svg viewBox={`0 0 ${BOOK_W} ${BOOK_H}`} className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        {/* Domed cross-section: a bright band left of centre, falling off to both edges */}
        <linearGradient id="nb-plate" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={GOLD.deep} />
          <stop offset="0.1" stopColor={GOLD.dark} />
          <stop offset="0.28" stopColor={GOLD.light} />
          <stop offset="0.38" stopColor={GOLD.glint} />
          <stop offset="0.47" stopColor={GOLD.hi} />
          <stop offset="0.62" stopColor={GOLD.mid} />
          <stop offset="0.86" stopColor={GOLD.dark} />
          <stop offset="1" stopColor={GOLD.deep} />
        </linearGradient>
        <linearGradient id="nb-plate-ends" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.18" />
          <stop offset="0.08" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.9" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.25" />
        </linearGradient>
        <radialGradient id="nb-rivet" cx="0.38" cy="0.32" r="0.75">
          <stop offset="0" stopColor={GOLD.glint} />
          <stop offset="0.35" stopColor={GOLD.light} />
          <stop offset="0.8" stopColor={GOLD.dark} />
          <stop offset="1" stopColor={GOLD.deep} />
        </radialGradient>
      </defs>
      <rect x={PLATE.x + 2} y={PLATE.y + 6} width={PLATE.w} height={PLATE.h} rx={19} fill="#060001" opacity={0.75} filter="url(#nb-blur2)" />
      <rect x={PLATE.x} y={PLATE.y} width={PLATE.w} height={PLATE.h} rx={19} fill="url(#nb-plate)" />
      <rect x={PLATE.x} y={PLATE.y} width={PLATE.w} height={PLATE.h} rx={19} fill="url(#nb-plate-ends)" />
      <rect x={PLATE.x + 0.5} y={PLATE.y + 0.5} width={PLATE.w - 1} height={PLATE.h - 1} rx={18.5} fill="none" stroke={GOLD.deep} strokeOpacity={0.5} strokeWidth={1} />
      {/* The two halves of the mechanism meet down the middle */}
      <line x1={SPINE + 1.2} y1={PLATE.y + 22} x2={SPINE + 1.2} y2={PLATE.y + PLATE.h - 22} stroke="#4a2f0e" strokeOpacity={0.55} strokeWidth={0.9} />
      <line x1={SPINE + 2.2} y1={PLATE.y + 22} x2={SPINE + 2.2} y2={PLATE.y + PLATE.h - 22} stroke={GOLD.hi} strokeOpacity={0.5} strokeWidth={0.6} />
      {[PLATE.y + 20, PLATE.y + PLATE.h - 20].map((y) => (
        <g key={y}>
          <circle cx={SPINE + 1} cy={y + 1.6} r={8} fill="#2a1a06" opacity={0.6} filter="url(#nb-soft)" />
          <circle cx={SPINE} cy={y} r={7.6} fill="url(#nb-rivet)" />
          <ellipse cx={SPINE - 2.4} cy={y - 2.6} rx={2.2} ry={1.4} fill="#fff" opacity={0.8} />
        </g>
      ))}
    </svg>
  );
}

/**
 * The four rings. Each rises out of a punched hole on one page, arches over the
 * plate and drops into the matching hole on the other; seen from just above, the
 * arch reads as a shallow curve. Round wire, so it's shaded as a cylinder: dark
 * underside, bright crest, and darkest where it turns down into the holes.
 * Drawn over the pages, with their shadows falling on them.
 */
export function Rings() {
  const L = SPINE - HOLE_X;
  const R = SPINE + HOLE_X;
  const SAG = 10;
  const arc = (y: number, dy = 0) => `M${L} ${y + dy}Q${SPINE} ${y + SAG * 2 + dy} ${R} ${y + dy}`;
  // Height of the arch 22 units either side of the crown, where the glint starts and ends
  const g = (HOLE_X - 22) / (2 * HOLE_X);
  const glintY = 4 * SAG * g * (1 - g);
  return (
    <svg viewBox={`0 0 ${BOOK_W} ${BOOK_H}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        {/* Darkens the ends where the wire turns down into the holes */}
        <linearGradient id="nb-wire-ends" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1a0f03" stopOpacity="0.9" />
          <stop offset="0.1" stopColor="#1a0f03" stopOpacity="0.35" />
          <stop offset="0.26" stopColor="#1a0f03" stopOpacity="0" />
          <stop offset="0.74" stopColor="#1a0f03" stopOpacity="0" />
          <stop offset="0.9" stopColor="#1a0f03" stopOpacity="0.4" />
          <stop offset="1" stopColor="#1a0f03" stopOpacity="0.92" />
        </linearGradient>
      </defs>
      {RINGS_Y.map((y) => (
        <g key={y} fill="none" strokeLinecap="round">
          {/* Shadow on the paper and plate, thrown further from the raised crown */}
          <path d={`M${L + 4} ${y + 4}Q${SPINE} ${y + SAG * 2 + 26} ${R - 4} ${y + 4}`} stroke="#2a0a0e" strokeOpacity={0.3} strokeWidth={12} filter="url(#nb-blur2)" />
          <path d={arc(y)} stroke={GOLD.deep} strokeWidth={11} />
          <path d={arc(y, -0.9)} stroke={GOLD.mid} strokeWidth={8.4} />
          <path d={arc(y, -1.8)} stroke={GOLD.light} strokeWidth={5.2} />
          <path d={arc(y, -2.4)} stroke={GOLD.hi} strokeWidth={2.6} />
          <path d={arc(y)} stroke="url(#nb-wire-ends)" strokeWidth={11.2} />
          {/* Specular glint along the crown */}
          <path
            d={`M${SPINE - 22} ${y + glintY - 3.2}Q${SPINE} ${y + 2 * SAG - glintY - 3.2} ${SPINE + 22} ${y + glintY - 3.2}`}
            stroke="#fff"
            strokeOpacity={0.85}
            strokeWidth={1.4}
            filter="url(#nb-soft)"
          />
          {/* Seam where the two half-rings close */}
          <line x1={SPINE + 0.6} y1={y + SAG - 5.2} x2={SPINE + 0.6} y2={y + SAG + 5.4} stroke="#3a2408" strokeOpacity={0.65} strokeWidth={0.8} />
        </g>
      ))}
    </svg>
  );
}

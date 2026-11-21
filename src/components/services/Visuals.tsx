import { BarChart3, Check, Database, FileText, Globe, Mail, Megaphone } from "lucide-react";
import { LOGO_PATH, LOGO_VIEWBOX } from "@/lib/logo";

// Small drawings for the products & services cards (components/Services.tsx). Pure markup,
// decorative only; the motion lives in globals.css under "Products & services".

/** Websites & e-commerce: a storefront in a browser window (on a dark card). */
export function WebVisual() {
  return (
    <div
      aria-hidden
      className="rounded-[1.4rem] border border-paper/10 bg-paper/[0.06] p-3 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)] transition-transform duration-700 ease-out group-hover:-translate-y-1"
    >
      <div className="flex items-center gap-1.5 px-1">
        <span className="h-2 w-2 rounded-full bg-paper/25" />
        <span className="h-2 w-2 rounded-full bg-paper/25" />
        <span className="h-2 w-2 rounded-full bg-paper/25" />
        <span className="ml-2 flex h-5 flex-1 items-center rounded-full bg-paper/10 px-3 text-[9px] tracking-wide text-paper/50">
          yourbrand.com
        </span>
      </div>
      <div className="mt-3 rounded-xl bg-gradient-to-br from-burgundy-light to-burgundy p-4">
        <span className="block h-2 w-2/3 rounded-full bg-paper/80" />
        <span className="mt-2 block h-1.5 w-2/5 rounded-full bg-paper/45" />
        <span className="mt-4 block h-5 w-16 rounded-full bg-rose" />
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-lg bg-paper/[0.08] p-2">
            <div className="aspect-[4/3] rounded-md bg-paper/10" />
            <span className="mt-2 block h-1.5 w-3/4 rounded-full bg-paper/25" />
            <span className="mt-1.5 block h-1.5 w-1/3 rounded-full bg-rose/60" />
          </div>
        ))}
      </div>
    </div>
  );
}

const pipeline = [
  { stage: "Lead", count: 12, deals: ["w-3/4", "w-1/2", "w-2/3", "w-3/5", "w-1/2"] },
  { stage: "Proposal", count: 5, deals: ["w-2/3", "w-3/5", "w-1/2", "w-3/4"] },
  { stage: "Won", count: 8, deals: ["w-1/2", "w-2/3", "w-3/5"] },
];

/** CRM & business systems: a deal pipeline, with one deal just won. Fills whatever
    height the card gives it and fades out at the bottom. */
export function CrmVisual() {
  return (
    <div
      aria-hidden
      className="relative grid min-h-56 flex-1 grid-cols-3 gap-2 overflow-hidden rounded-[1.4rem] bg-cream/70 p-3 [mask-image:linear-gradient(to_bottom,black_70%,transparent)]"
    >
      {pipeline.map((col, c) => (
        <div key={col.stage} className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1 pb-1 pt-0.5">
            <span className="text-[9px] uppercase tracking-[0.18em] text-taupe-dark">{col.stage}</span>
            <span className="rounded-full bg-paper px-1.5 text-[9px] text-taupe-dark">{col.count}</span>
          </div>
          {c === 2 && (
            <div className="rounded-lg bg-burgundy p-2.5 text-paper shadow-[0_14px_30px_-14px_rgba(54,10,22,0.7)] transition-transform duration-700 ease-out group-hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <span className="block h-1.5 w-3/5 rounded-full bg-paper/80" />
                <span className="grid h-4 w-4 place-items-center rounded-full bg-paper/15">
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </span>
              </div>
              <span className="mt-2 block h-1.5 w-2/5 rounded-full bg-paper/40" />
              <span className="mt-3 block text-[9px] uppercase tracking-[0.16em] text-paper/70">Signed</span>
            </div>
          )}
          {col.deals.map((w, i) => (
            <div key={i} className="rounded-lg border border-taupe-light bg-paper p-2.5">
              <span className={`block h-1.5 rounded-full bg-ink/20 ${w}`} />
              <span className="mt-2 block h-1.5 w-1/3 rounded-full bg-ink/10" />
              <div className="mt-3 flex items-center justify-between">
                <span className="h-3 w-3 rounded-full bg-taupe/50" />
                <span className="h-1.5 w-6 rounded-full bg-burgundy/25" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// Node positions on a 200×100 board; the HTML nodes sit at the same spots in %.
const sources = [
  { Icon: Globe, y: 20 },
  { Icon: Megaphone, y: 50 },
  { Icon: FileText, y: 80 },
];
const targets = [
  { Icon: Database, y: 20 },
  { Icon: Mail, y: 50 },
  { Icon: BarChart3, y: 80 },
];
const links = [
  ...sources.map(({ y }) => `M24 ${y} C62 ${y} 62 50 100 50`),
  ...targets.map(({ y }) => `M100 50 C138 50 138 ${y} 176 ${y}`),
];

function Node({ Icon, x, y }: { Icon: typeof Globe; x: number; y: number }) {
  return (
    <span
      className="absolute grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-taupe-light bg-paper text-burgundy shadow-[0_8px_20px_-12px_rgba(54,10,22,0.5)] sm:h-9 sm:w-9"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.75} />
    </span>
  );
}

/** Automation & integrations: website, ads and forms flowing through one hub into
    the CRM, inbox and reports. */
export function ConnectVisual() {
  return (
    <div aria-hidden className="relative aspect-[2/1] w-full overflow-hidden rounded-[1.4rem] bg-cream/70">
      <svg viewBox="0 0 200 100" className="absolute inset-0 h-full w-full" fill="none">
        {links.map((d) => (
          <path key={d} d={d} className="stroke-taupe/50" strokeWidth={0.8} />
        ))}
        {links.map((d) => (
          <path key={`f${d}`} d={d} className="svc-flow stroke-burgundy" strokeWidth={0.9} strokeLinecap="round" />
        ))}
      </svg>
      {sources.map(({ Icon, y }) => (
        <Node key={y} Icon={Icon} x={12} y={y} />
      ))}
      {targets.map(({ Icon, y }) => (
        <Node key={y} Icon={Icon} x={88} y={y} />
      ))}
      <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-burgundy shadow-[0_0_0_8px_rgba(86,18,38,0.08),0_16px_30px_-12px_rgba(54,10,22,0.7)] transition-transform duration-700 ease-out group-hover:scale-105 sm:h-16 sm:w-16">
        <svg viewBox={LOGO_VIEWBOX} className="h-7 w-7 fill-paper sm:h-8 sm:w-8">
          <path d={LOGO_PATH} />
        </svg>
      </span>
    </div>
  );
}

const LINE =
  "M0 178 C8 176.7 32 173 48 170 C64 167 80 161 96 160 C112 159 128 167.3 144 164 C160 160.7 176 145.7 192 140 C208 134.3 224 136 240 130 C256 124 272 109.7 288 104 C304 98.3 320 102.3 336 96 C352 89.7 368 74.7 384 66 C400 57.3 416 50 432 44 C448 38 464 33.3 480 30";

/** Growth & ads: revenue climbing, drawn in when the card scrolls into view. Runs to
    the card's edges, so it goes last in the card; the dot marks today. */
export function GrowVisual() {
  return (
    <div aria-hidden className="relative aspect-[12/5] w-full">
      <svg viewBox="0 0 480 200" className="absolute inset-0 h-full w-full" fill="none">
        <defs>
          <linearGradient id="svc-grow-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c4798b" stopOpacity="0.38" />
            <stop offset="1" stopColor="#c4798b" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[60, 110, 160].map((y) => (
          <line key={y} x1="0" x2="480" y1={y} y2={y} className="stroke-paper/10" strokeDasharray="2 6" />
        ))}
        <path d={`${LINE} L480 200 L0 200 Z`} fill="url(#svc-grow-fill)" className="svc-fade" />
        <path d={LINE} pathLength={1} className="svc-draw stroke-rose" strokeWidth={2.5} strokeLinecap="round" />
        <g className="svc-fade">
          <circle cx="432" cy="44" r="14" className="fill-rose/20" />
          <circle cx="432" cy="44" r="5" className="fill-rose" />
        </g>
      </svg>
      <span className="svc-fade absolute right-[13%] top-[3%] rounded-full border border-paper/15 bg-paper/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-paper/85 backdrop-blur-sm">
        Revenue ↑
      </span>
    </div>
  );
}

import type { ReactNode } from "react";

/* Brand palette (mirrors the @theme tokens in globals.css) */
const C = {
  paper: "#e8e0d8",
  cream: "#ddd4ca",
  ink: "#2f2b29",
  burgundy: "#561226",
  burgundyLight: "#7a2340",
  taupe: "#a8968a",
  taupeDark: "#6e6058",
  taupeLight: "#d3c7bc",
};

const label = { fontFamily: "inherit", fontSize: 12, fill: C.ink } as const;
const small = { fontFamily: "inherit", fontSize: 10, fill: C.taupeDark, letterSpacing: "0.08em" } as const;

function Check({ x, y, r = 9, filled = true }: { x: number; y: number; r?: number; filled?: boolean }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={filled ? C.burgundy : "none"} stroke={C.burgundy} strokeWidth={1.5} />
      <path
        d={`M${x - r * 0.42} ${y + r * 0.02} l${r * 0.3} ${r * 0.3} l${r * 0.55} -${r * 0.6}`}
        fill="none"
        stroke={filled ? C.paper : C.burgundy}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

/** Rounded panel that frames each illustration, with a small window-style caption. */
export function VisualFrame({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <div className="relative rounded-[28px] border border-taupe-light bg-cream p-3 shadow-[0_40px_80px_-40px_rgba(54,10,22,0.45)]">
      <div className="flex items-center gap-3 px-3 pb-3 pt-1">
        <span className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-burgundy/70" />
          <span className="h-2 w-2 rounded-full bg-taupe/70" />
          <span className="h-2 w-2 rounded-full bg-taupe-light" />
        </span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-taupe-dark">{caption}</span>
      </div>
      <div className="overflow-hidden rounded-[20px] border border-taupe-light bg-paper">{children}</div>
    </div>
  );
}

/* 01 — Discover: a map of scattered tools with the bottleneck circled */
export function DiscoverVisual() {
  const nodes = [
    { x: 28, y: 38, w: 112, t: "Spreadsheets" },
    { x: 340, y: 46, w: 112, t: "Email inbox" },
    { x: 24, y: 262, w: 112, t: "Ad accounts" },
    { x: 344, y: 270, w: 112, t: "Sticky notes" },
    { x: 184, y: 300, w: 112, t: "Phone calls" },
  ];
  const hub = { x: 240, y: 178 };
  return (
    <svg viewBox="0 0 480 360" className="block h-auto w-full" role="img" aria-label="Map of scattered tools with a bottleneck highlighted">
      <defs>
        <pattern id="pv-dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill={C.taupeLight} />
        </pattern>
      </defs>
      <rect width="480" height="360" fill="url(#pv-dots)" />

      {nodes.map((n, i) => {
        const cx = n.x + n.w / 2;
        const cy = n.y + 17;
        const hot = i === 1;
        return (
          <path
            key={n.t}
            d={`M${cx} ${cy} Q ${(cx + hub.x) / 2} ${hot ? cy + 70 : (cy + hub.y) / 2 - 30} ${hub.x} ${hub.y}`}
            fill="none"
            stroke={hot ? C.burgundy : C.taupe}
            strokeWidth={hot ? 2.5 : 1.5}
            strokeDasharray={hot ? undefined : "5 6"}
          />
        );
      })}

      {nodes.map((n) => (
        <g key={n.t}>
          <rect x={n.x} y={n.y} width={n.w} height={34} rx={10} fill={C.paper} stroke={C.taupe} />
          <text x={n.x + n.w / 2} y={n.y + 21} textAnchor="middle" style={label}>
            {n.t}
          </text>
        </g>
      ))}

      <rect x={hub.x - 68} y={hub.y - 24} width={136} height={48} rx={14} fill={C.burgundy} />
      <text x={hub.x} y={hub.y + 5} textAnchor="middle" style={{ ...label, fill: C.paper, fontWeight: 600 }}>
        Your business
      </text>

      {/* Bottleneck under the magnifier */}
      <circle cx={338} cy={118} r={44} fill={C.paper} fillOpacity={0.55} stroke={C.burgundy} strokeWidth={3} />
      <path d="M369 149 L398 178" stroke={C.burgundy} strokeWidth={8} strokeLinecap="round" />
      <circle cx={338} cy={118} r={13} fill={C.burgundyLight} />
      <text x={338} y={123} textAnchor="middle" style={{ ...label, fill: C.paper, fontWeight: 700, fontSize: 14 }}>
        !
      </text>
      <rect x={222} y={52} width={70} height={18} rx={9} fill={C.burgundy} />
      <text x={257} y={65} textAnchor="middle" style={{ ...small, fill: C.paper, fontSize: 9 }}>
        BOTTLENECK
      </text>
    </svg>
  );
}

/* 02 — Design: a wireframe with a selected element and spacing guides */
export function DesignVisual() {
  return (
    <svg viewBox="0 0 480 360" className="block h-auto w-full" role="img" aria-label="Website wireframe being designed">
      <rect x="20" y="20" width="440" height="320" rx="14" fill={C.cream} stroke={C.taupeLight} />
      <rect x="20" y="20" width="440" height="34" rx="14" fill={C.taupeLight} />
      <rect x="20" y="40" width="440" height="14" fill={C.taupeLight} />
      {[38, 52, 66].map((x) => (
        <circle key={x} cx={x} cy={37} r={4} fill={C.taupe} />
      ))}
      <rect x="150" y="29" width="180" height="16" rx="8" fill={C.paper} />

      {/* nav */}
      <rect x="40" y="72" width="18" height="18" rx="5" fill={C.burgundy} />
      <rect x="66" y="78" width="54" height="6" rx="3" fill={C.taupeDark} />
      {[300, 340, 380].map((x) => (
        <rect key={x} x={x} y="78" width="30" height="6" rx="3" fill={C.taupe} />
      ))}
      <rect x="414" y="72" width="28" height="18" rx="9" fill={C.taupeDark} />

      {/* hero copy */}
      <rect x="40" y="118" width="180" height="16" rx="4" fill={C.taupeDark} />
      <rect x="40" y="140" width="140" height="16" rx="4" fill={C.taupeDark} />
      <rect x="40" y="176" width="190" height="6" rx="3" fill={C.taupe} />
      <rect x="40" y="188" width="160" height="6" rx="3" fill={C.taupe} />

      {/* spacing guide */}
      <path d="M232 156 V176" stroke={C.burgundyLight} strokeWidth={1.2} />
      <path d="M227 156 H237 M227 176 H237" stroke={C.burgundyLight} strokeWidth={1.2} />
      <rect x="240" y="159" width="22" height="14" rx="4" fill={C.burgundyLight} />
      <text x="251" y="169.5" textAnchor="middle" style={{ ...small, fill: C.paper, fontSize: 9, letterSpacing: 0 }}>
        20
      </text>

      {/* selected button */}
      <rect x="40" y="212" width="112" height="32" rx="16" fill={C.burgundy} />
      <text x="96" y="232" textAnchor="middle" style={{ ...label, fill: C.paper, fontSize: 11 }}>
        Get started
      </text>
      <rect x="34" y="206" width="124" height="44" rx="4" fill="none" stroke={C.burgundyLight} strokeDasharray="4 3" />
      {[
        [34, 206],
        [158, 206],
        [34, 250],
        [158, 250],
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x - 3.5} y={y - 3.5} width={7} height={7} fill={C.paper} stroke={C.burgundyLight} />
      ))}
      <rect x="62" y="258" width="68" height="16" rx="4" fill={C.ink} />
      <text x="96" y="269.5" textAnchor="middle" style={{ ...small, fill: C.paper, fontSize: 9, letterSpacing: 0 }}>
        112 × 32
      </text>

      {/* image placeholder */}
      <rect x="266" y="112" width="176" height="140" rx="10" fill={C.paper} stroke={C.taupeLight} />
      <path d="M266 252 L330 186 L370 222 L394 200 L442 246" fill="none" stroke={C.taupe} strokeWidth={1.5} />
      <circle cx="404" cy="146" r="12" fill={C.taupeLight} />

      {/* feature cards */}
      {[40, 178, 316].map((x) => (
        <g key={x}>
          <rect x={x} y="290" width="126" height="34" rx="8" fill={C.paper} stroke={C.taupeLight} />
          <rect x={x + 12} y="302" width="10" height="10" rx="3" fill={C.burgundyLight} fillOpacity={0.7} />
          <rect x={x + 30} y="304" width="70" height="6" rx="3" fill={C.taupe} />
        </g>
      ))}

      {/* cursor */}
      <path
        d="M168 236 L168 262 L175 255 L180 267 L185 265 L180 253 L190 253 Z"
        fill={C.burgundy}
        stroke={C.paper}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* 03 — Build: a release log with visible progress and client feedback */
export function BuildVisual() {
  const releases = [
    { v: "v0.1", t: "Clickable prototype", s: "Shipped", done: true },
    { v: "v0.2", t: "CRM pipeline", s: "Shipped", done: true },
    { v: "v0.3", t: "Ads & lead sync", s: "In review", done: false },
  ];
  return (
    <svg viewBox="0 0 480 360" className="block h-auto w-full" role="img" aria-label="Release log showing shipped versions and progress">
      <text x="32" y="44" style={{ ...label, fontSize: 15, fontWeight: 600 }}>
        Releases
      </text>
      <rect x="104" y="30" width="72" height="20" rx="10" fill="none" stroke={C.taupe} />
      <text x="140" y="44" textAnchor="middle" style={{ ...small, fontSize: 9 }}>
        SPRINT 04
      </text>

      {/* rail */}
      <path d="M52 87 V203" stroke={C.taupeLight} strokeWidth={2} />
      <path d="M52 87 V145" stroke={C.burgundy} strokeWidth={2} />

      {releases.map((r, i) => {
        const y = 64 + i * 58;
        return (
          <g key={r.v}>
            <rect x="32" y={y} width="416" height="46" rx="12" fill={i === 2 ? C.cream : C.paper} stroke={C.taupeLight} />
            {r.done ? (
              <Check x={52} y={y + 23} />
            ) : (
              <g>
                <circle cx={52} cy={y + 23} r={9} fill={C.paper} stroke={C.taupe} strokeWidth={1.5} />
                <path d={`M52 ${y + 14} A9 9 0 0 1 ${52 + 8.6} ${y + 25.6}`} fill="none" stroke={C.burgundy} strokeWidth={2.5} strokeLinecap="round" />
              </g>
            )}
            <text x="74" y={y + 20} style={{ ...small, fontSize: 9 }}>
              {r.v}
            </text>
            <text x="74" y={y + 35} style={{ ...label, fontWeight: 600 }}>
              {r.t}
            </text>
            <rect
              x="356"
              y={y + 13}
              width="76"
              height="20"
              rx="10"
              fill={r.done ? C.burgundy : "none"}
              stroke={r.done ? "none" : C.burgundy}
            />
            <text x="394" y={y + 26.5} textAnchor="middle" style={{ ...small, fontSize: 9, fill: r.done ? C.paper : C.burgundy }}>
              {r.s.toUpperCase()}
            </text>
          </g>
        );
      })}

      {/* progress */}
      <text x="32" y="292" style={{ ...small, fontSize: 9 }}>
        SPRINT PROGRESS
      </text>
      <rect x="32" y="302" width="416" height="10" rx="5" fill={C.taupeLight} />
      <rect x="32" y="302" width="290" height="10" rx="5" fill={C.burgundy} />
      <circle cx="322" cy="307" r="7" fill={C.paper} stroke={C.burgundy} strokeWidth={2} />

      {/* feedback bubble */}
      <g>
        <path d="M384 242 L394 230 L404 242 Z" fill={C.ink} />
        <rect x="262" y="240" width="176" height="34" rx="12" fill={C.ink} />
        <circle cx="282" cy="257" r="9" fill={C.taupe} />
        <text x="298" y="261" style={{ ...label, fill: C.paper, fontSize: 11 }}>
          Looks great. Ship it.
        </text>
      </g>
    </svg>
  );
}

/* 04 — Deploy: launch checklist and a live site */
export function DeployVisual() {
  const items = ["Tests passed", "Data migrated", "Domain connected", "Team trained"];
  return (
    <svg viewBox="0 0 480 360" className="block h-auto w-full" role="img" aria-label="Launch checklist with the site live">
      {/* live site */}
      <rect x="196" y="36" width="256" height="196" rx="14" fill={C.cream} stroke={C.taupeLight} />
      <rect x="208" y="48" width="232" height="26" rx="13" fill={C.paper} />
      <rect x="220" y="57" width="7" height="8" rx="1.5" fill={C.burgundy} />
      <path d="M221 57 V54 a2.5 2.5 0 0 1 5 0 V57" fill="none" stroke={C.burgundy} strokeWidth={1.4} />
      <text x="234" y="65" style={{ ...label, fontSize: 11 }}>
        yourbusiness.com
      </text>
      <rect x="388" y="53" width="44" height="16" rx="8" fill={C.burgundy} />
      <circle cx="398" cy="61" r="3" fill={C.paper}>
        <animate attributeName="opacity" values="1;0.3;1" dur="1.6s" repeatCount="indefinite" />
      </circle>
      <text x="416" y="64.5" textAnchor="middle" style={{ ...small, fill: C.paper, fontSize: 8 }}>
        LIVE
      </text>
      <rect x="212" y="92" width="120" height="12" rx="3" fill={C.taupeDark} />
      <rect x="212" y="110" width="90" height="12" rx="3" fill={C.taupeDark} />
      <rect x="212" y="134" width="130" height="5" rx="2.5" fill={C.taupe} />
      <rect x="212" y="144" width="110" height="5" rx="2.5" fill={C.taupe} />
      <rect x="212" y="162" width="70" height="20" rx="10" fill={C.burgundy} />
      <rect x="352" y="92" width="84" height="90" rx="8" fill={C.paper} />
      <rect x="212" y="196" width="224" height="22" rx="6" fill={C.paper} />

      {/* checklist */}
      <rect x="28" y="96" width="196" height="228" rx="16" fill={C.paper} stroke={C.taupe} />
      <text x="48" y="128" style={{ ...label, fontSize: 14, fontWeight: 600 }}>
        Launch checklist
      </text>
      <text x="48" y="146" style={{ ...small, fontSize: 9 }}>
        4 OF 4 COMPLETE
      </text>
      {items.map((t, i) => {
        const y = 176 + i * 36;
        return (
          <g key={t}>
            <Check x={58} y={y} r={8} />
            <text x="76" y={y + 4} style={label}>
              {t}
            </text>
            {i < items.length - 1 && <path d={`M48 ${y + 18} H204`} stroke={C.taupeLight} />}
          </g>
        );
      })}

      {/* handoff arrow */}
      <path d="M232 296 C 290 296 320 280 344 252" fill="none" stroke={C.burgundy} strokeWidth={2} strokeDasharray="4 5" />
      <path d="M336 252 L345 250 L347 260" fill="none" stroke={C.burgundy} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <rect x="300" y="290" width="128" height="28" rx="14" fill={C.ink} />
      <text x="364" y="308" textAnchor="middle" style={{ ...label, fill: C.paper, fontSize: 11 }}>
        Handed to your team
      </text>
    </svg>
  );
}

/* 05 — Scale: a growth chart with automations running underneath */
export function ScaleVisual() {
  const line = "M40 268 C 96 262 118 236 160 232 S 236 214 270 180 S 350 132 380 104 S 424 70 440 60";
  const bars = [44, 60, 72, 96, 118, 150];
  return (
    <svg viewBox="0 0 480 360" className="block h-auto w-full" role="img" aria-label="Growth chart trending upward">
      <defs>
        <linearGradient id="pv-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.burgundy} stopOpacity={0.28} />
          <stop offset="100%" stopColor={C.burgundy} stopOpacity={0} />
        </linearGradient>
      </defs>

      <text x="40" y="44" style={{ ...small, fontSize: 9 }}>
        PIPELINE VALUE
      </text>
      <rect x="40" y="54" width="72" height="22" rx="11" fill={C.burgundy} />
      <path d="M52 69 L58 61 L64 69" fill="none" stroke={C.paper} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <text x="70" y="69" style={{ ...label, fill: C.paper, fontSize: 10 }}>
        Rising
      </text>

      {[110, 160, 210, 260].map((y) => (
        <path key={y} d={`M40 ${y} H440`} stroke={C.taupeLight} strokeDasharray="3 5" />
      ))}

      {bars.map((h, i) => (
        <rect key={i} x={58 + i * 66} y={300 - h} width={28} height={h} rx={6} fill={C.taupe} fillOpacity={0.22 + i * 0.07} />
      ))}

      <path d={`${line} V300 H40 Z`} fill="url(#pv-area)" />
      <path d={line} fill="none" stroke={C.burgundy} strokeWidth={3.5} strokeLinecap="round" />
      <circle cx="440" cy="60" r="14" fill={C.burgundy} fillOpacity={0.15} />
      <circle cx="440" cy="60" r="6" fill={C.burgundy} stroke={C.paper} strokeWidth={2} />

      <path d="M40 300 H440" stroke={C.taupe} />
      {["Q1", "Q2", "Q3", "Q4"].map((q, i) => (
        <text key={q} x={60 + i * 120} y="320" style={{ ...small, fontSize: 9 }}>
          {q}
        </text>
      ))}

      {/* automation chips */}
      <g>
        <rect x="236" y="34" width="132" height="26" rx="13" fill={C.paper} stroke={C.taupe} />
        <Check x={252} y={47} r={7} />
        <text x="265" y="51" style={{ ...label, fontSize: 10.5 }}>
          Auto follow-up sent
        </text>
      </g>
      <g>
        <rect x="290" y="226" width="134" height="26" rx="13" fill={C.ink} />
        <circle cx="306" cy="239" r="4" fill={C.burgundyLight} />
        <text x="316" y="243" style={{ ...label, fill: C.paper, fontSize: 10.5 }}>
          New campaign live
        </text>
      </g>
    </svg>
  );
}

export const processVisuals = [DiscoverVisual, DesignVisual, BuildVisual, DeployVisual, ScaleVisual];

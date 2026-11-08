import type { CSSProperties } from "react";
import { CssText } from "./CssText";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL"];

// The sales line (viewBox 150 x 52): a climb, two dips, then the run-up to the arrow
const LINE =
  "M4 47 C14 36 22 22 33 22 C41 22 45 31 51 30 C57 29 60 14 67 14 C75 14 80 33 88 32 " +
  "C94 31 96 25 101 25 C106 25 107 30 113 29 C122 28 132 15 142 6";

/**
 * Inline glass sales card for the "What we do" heading: a smoked-glass plate with
 * a little thickness, a soft glow behind it, and a glowing sales line floating a
 * touch in front of the glass. Sized in em, so it scales with the heading.
 * Styles: "Sales card" in globals.css.
 */
export function SalesCard() {
  return (
    <span aria-hidden className="w3d-icon sales">
      <span className="sales-leaf sales-glow" />
      <span className="sales-leaf sales-edge" style={{ "--k": 2 } as CSSProperties} />
      <span className="sales-leaf sales-edge" style={{ "--k": 1 } as CSSProperties} />

      <span className="sales-leaf sales-plate">
        <CssText t="SALES" className="sales-label" />
        <CssText t="$70,318" className="sales-value" />
        <CssText t="+$10,967 (+7.36%)" className="sales-delta" />
        <span className="sales-stars">
          {[0, 1, 2, 3, 4, 5].map((s) => (
            <span key={s} />
          ))}
        </span>
        <span className="sales-months">
          {MONTHS.map((m) => (
            <CssText key={m} t={m} className={m === "MAR" ? "is-on" : undefined} />
          ))}
        </span>
      </span>

      <span className="sales-leaf sales-chart">
        <svg viewBox="0 0 150 52" fill="none">
          <defs>
            <linearGradient id="w3d-sales-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f3eaff" stopOpacity="0.3" />
              <stop offset="1" stopColor="#f3eaff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="w3d-sales-beam" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#efe4ff" stopOpacity="0.55" />
              <stop offset="1" stopColor="#efe4ff" stopOpacity="0" />
            </linearGradient>
            <filter id="w3d-sales-blur" x="-10%" y="-40%" width="120%" height="180%">
              <feGaussianBlur stdDeviation="1.8" />
            </filter>
          </defs>
          <rect className="sales-beam" x="139" y="6" width="6" height="46" fill="url(#w3d-sales-beam)" />
          <path className="sales-area" d={`${LINE} L142 52 L4 52 Z`} fill="url(#w3d-sales-area)" />
          <path
            className="sales-line"
            d={LINE}
            pathLength={1}
            stroke="#f6efff"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.55"
            filter="url(#w3d-sales-blur)"
          />
          <path className="sales-line" d={LINE} pathLength={1} stroke="#fdfaff" strokeWidth="1.9" strokeLinecap="round" />
          <path className="sales-arrow" d="M146 2 L137.6 3.6 L143.4 10.4 Z" fill="#fdfaff" />
          <g className="sales-dot">
            <circle cx="51" cy="30" r="5" fill="#f6efff" opacity="0.22" />
            <circle cx="51" cy="30" r="2.3" fill="#fdfaff" />
          </g>
        </svg>
        <CssText t="$42,710" className="sales-tip" />
      </span>
    </span>
  );
}

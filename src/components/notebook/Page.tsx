import type { CSSProperties, ReactNode } from "react";
import { promises } from "@/lib/data";
import { LogoMark } from "../Navbar";
import { HOLE_X, PAGE_GAP, PAGE_H, PAGE_TOP, PAPER_W, RINGS_Y, SHEET_W, u } from "./parts";

export type Side = "left" | "right";

/** First ruled line, and the blank band left at the foot of the page for the print */
const RULE_TOP = 72;
const FOOT = 54;
/** Handwriting column: inset from the paper's outer edge and from the hole side */
const TEXT_OUTER = 30;
const TEXT_INNER = 46;
/** Write-on speed for the first spread (see .nb-write in globals.css) */
const CHAR_MS = 21;
const WORD_GAP_MS = 38;

/**
 * Running clock for the write-on: each word starts when the previous one is
 * done. The helpers below are plain functions, called in order while one page
 * renders, so the clock only ever advances inside that render.
 */
type Clock = { t: number };

function words(text: string, clock: Clock) {
  return text.split(" ").map((w, i, all) => {
    const d = clock.t;
    const t = w.length * CHAR_MS;
    clock.t += t + WORD_GAP_MS;
    return (
      <span key={i} data-w="" style={{ "--d": `${d}ms`, "--t": `${t}ms` } as CSSProperties}>
        {w}
        {i < all.length - 1 ? " " : ""}
      </span>
    );
  });
}

/** A stroke drawn with the pen, on the same clock */
function stroke(clock: Clock, ms: number, viewBox: string, className: string, d: string) {
  const at = clock.t;
  clock.t += ms + WORD_GAP_MS;
  return (
    <svg viewBox={viewBox} preserveAspectRatio="none" aria-hidden className={`nb-stroke pointer-events-none absolute overflow-visible ${className}`}>
      <path d={d} pathLength={1} vectorEffect="non-scaling-stroke" style={{ "--d": `${at}ms`, "--t": `${ms}ms` } as CSSProperties} />
    </svg>
  );
}

const WINE = "text-[color:var(--nb-wine)]";

/** Text with one [bracketed] phrase circled or underlined in red ink */
function marked(text: string, mark: "circle" | "underline", clock: Clock) {
  const m = text.match(/^(.*)\[(.+)\](.*)$/);
  if (!m) return words(text, clock);
  const [, before, inner, after] = m;
  const parts: ReactNode[] = [];
  if (before.trim()) parts.push(<span key="b">{words(before.trim(), clock)} </span>);
  const innerWords = words(inner, clock);
  // The circle is placed from the line's foot (where the baseline sits on the rule)
  // because this face's letters reach well above its line box.
  parts.push(
    <span key="m" className="relative inline-block">
      {innerWords}
      {mark === "circle"
        ? stroke(clock, 420, "0 0 100 40", `-bottom-[0.46em] -left-[0.32em] h-[1.62em] w-[calc(100%+0.8em)] ${WINE}`, "M88 5C62 -1 14 0 5 9C-2 17 0 32 28 37C54 41 92 39 98 27C103 16 97 5 68 3")
        : stroke(clock, 360, "0 0 100 12", `-left-[0.1em] bottom-[0.02em] h-[0.32em] w-[calc(100%+0.25em)] ${WINE}`, "M1 4C30 2 62 3 99 2M6 10C38 8 66 9 96 8")}
    </span>,
  );
  if (after) parts.push(<span key="a">{words(after, clock)}</span>);
  return parts;
}

/** Hand-drawn tick in red ink */
function tick(clock: Clock) {
  return (
    <span className="relative mr-[0.35em] inline-block h-[0.9em] w-[0.9em] align-[-0.05em]">
      {stroke(clock, 180, "0 0 24 24", `inset-0 h-full w-full ${WINE}`, "M2.5 13.5C5 15 7.2 17.6 8.8 20.5C11.6 13.4 15.8 7.6 22 3")}
    </span>
  );
}

/** Each promise's spread, written as notes: the claim on the left page, the specifics on the right. */
function Writing({ side, entry, start }: { side: Side; entry: number; start: number }) {
  const p = promises[entry];
  const clock = { t: start };
  if (side === "left") {
    return (
      <>
        <p className={`nb-head ${WINE}`}>
          {p.heading.map((line, i) => (
            <span key={line} className={i === p.heading.length - 1 ? "relative inline-block" : "block"}>
              {words(line, clock)}
              {/* the last line underlined, with a flick at the end */}
              {i === p.heading.length - 1 &&
                stroke(clock, 340, "0 0 320 12", `-bottom-[0.06em] -left-[0.15em] h-[0.36em] w-[calc(100%+0.5em)] ${WINE}`, "M2 8C58 4 138 6 214 5C252 4.5 290 3 318 1")}
            </span>
          ))}
        </p>
        <p className="mt-[var(--rule)] pl-[0.2em]">{words(p.body, clock)}</p>
      </>
    );
  }
  return (
    <>
      <ul className="mt-[var(--rule)] pl-[0.3em]">
        {p.ticks.map((t) => (
          <li key={t}>
            {tick(clock)}
            {words(t, clock)}
          </li>
        ))}
      </ul>
      <p className="mt-[var(--rule)] pl-[0.6em]">{marked(p.note, p.mark, clock)}</p>
      <p className={`nb-sign mt-[var(--rule)] pr-[0.4em] text-right ${WINE}`}>{words("— Celestial", clock)}</p>
    </>
  );
}

/** How long the left page of a spread takes to write, so the right page starts after it */
export function leftPageMs(entry: number) {
  const p = promises[entry];
  const words = (s: string) => s.split(" ").reduce((n, w) => n + w.length * CHAR_MS + WORD_GAP_MS, 0);
  return p.heading.reduce((n, line) => n + words(line), 0) + 340 + WORD_GAP_MS + words(p.body);
}

/** The stack of sheets under the top one shows as fine edges, then the block's shadow on the leather */
function stackShadow(side: Side) {
  const o = side === "right" ? 1 : -1;
  const tones = ["#e7dfd1", "#f7f2e8", "#e2d9c9", "#f4eee3", "#ddd3c1", "#f1eadd", "#d8cdba"];
  const edges = tones.map((c, i) => `${u(o * 0.35 * (i + 1))} ${u(0.75 * (i + 1))} 0 ${c}`);
  return [
    ...edges,
    `${u(o * 3)} ${u(7)} ${u(4)} rgba(12,1,4,0.55)`,
    `${u(o * 4)} ${u(12)} ${u(16)} rgba(12,1,4,0.35)`,
    `0 ${u(1)} ${u(1.5)} rgba(12,1,4,0.4)`,
  ].join(", ");
}

/**
 * One page of the notebook in "sheet" coordinates: a box from the spine to the
 * page's outer edge (the paper starts a little way out from the spine), so a
 * leaf can turn about its left edge and land exactly on the opposite page.
 */
export function Page({
  side,
  entry,
  stack = false,
  write = false,
  start = 0,
}: {
  side: Side;
  entry: number;
  stack?: boolean;
  /** Hide the writing until .nb-go is set on the binder, then write it on */
  write?: boolean;
  /** Write-on start time for this page, in ms */
  start?: number;
}) {
  const right = side === "right";
  // Inner edge (towards the rings) first, then the outer edge
  const inner = right ? "left" : "right";
  const outer = right ? "right" : "left";
  const toOuter = right ? "to right" : "to left";

  return (
    <div className="absolute inset-0" style={{ width: u(SHEET_W), height: u(PAGE_H) }}>
      <div
        className="absolute top-0 h-full"
        style={{
          [inner]: u(PAGE_GAP),
          width: u(PAPER_W),
          borderRadius: right ? `${u(3)} ${u(9)} ${u(9)} ${u(3)}` : `${u(9)} ${u(3)} ${u(3)} ${u(9)}`,
          backgroundColor: "#faf6ee",
          backgroundImage: [
            // the page curving down into the rings
            `linear-gradient(${toOuter}, rgba(78,44,32,0.24) 0, rgba(78,44,32,0.1) 2.6%, rgba(78,44,32,0.035) 9%, transparent 20%)`,
            // and rolling off slightly at its free edge
            `linear-gradient(${right ? "to left" : "to right"}, rgba(70,46,34,0.07) 0, transparent 4%)`,
            // overhead light, brighter at the head of the page
            "linear-gradient(to bottom, rgba(255,255,255,0.35) 0, transparent 30%, transparent 78%, rgba(84,56,40,0.05) 100%)",
            "url(/notebook/paper.webp)",
          ].join(", "),
          backgroundSize: "100% 100%, 100% 100%, 100% 100%, 256px 256px",
          boxShadow: stack ? stackShadow(side) : `0 0 ${u(1)} rgba(12,1,4,0.25)`,
        }}
      >
        {/* Ruled lines, printed in a cool grey */}
        <div
          className="absolute"
          style={{
            top: `calc(${u(RULE_TOP)} - var(--rule) + 1px)`,
            bottom: u(FOOT),
            [inner]: u(TEXT_INNER - 12),
            [outer]: u(18),
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent 0, transparent calc(var(--rule) - 1px), rgba(108,120,146,0.42) calc(var(--rule) - 1px), rgba(108,120,146,0.42) var(--rule))",
          }}
        />

        {/* Punched holes: the leather far below shows through */}
        {RINGS_Y.map((y) => (
          <span
            key={y}
            className="absolute rounded-full"
            style={{
              top: u(y - PAGE_TOP - 8.5),
              [inner]: u(HOLE_X - PAGE_GAP - 8.5),
              width: u(17),
              height: u(17),
              background: "radial-gradient(circle at 50% 38%, #0a0103 0%, #1c0408 55%, #2e0a10 100%)",
              boxShadow: `inset 0 ${u(1.4)} ${u(1.8)} rgba(0,0,0,0.8), 0 ${u(0.5)} 0 rgba(255,255,255,0.75), 0 ${u(-0.4)} 0 rgba(92,60,44,0.25)`,
            }}
          />
        ))}

        {/* Our print at the foot of every page, as a maker's mark */}
        <span
          className="absolute flex items-center font-brand uppercase text-[#55473f]/60"
          style={{
            bottom: u(22),
            right: right ? u(26) : u(TEXT_INNER - 4),
            gap: u(6),
            fontSize: u(8.6),
            letterSpacing: "0.34em",
          }}
        >
          <span className="shrink-0" style={{ width: u(11), height: u(11) }}>
            <LogoMark className="block h-full w-full" />
          </span>
          Celestial Developers
        </span>

        {/* The handwriting */}
        <div
          className={`nb-ink absolute ${write ? "nb-write" : ""}`}
          style={{
            top: u(RULE_TOP),
            bottom: u(FOOT),
            [inner]: u(TEXT_INNER),
            [outer]: u(TEXT_OUTER),
          }}
        >
          <Writing side={side} entry={entry} start={start} />
        </div>
      </div>
    </div>
  );
}

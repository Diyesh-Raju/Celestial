"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { leftPageMs, Page } from "./Page";
import {
  BOOK_H,
  BOOK_W,
  CoverDetail,
  PAGE_GAP,
  PAGE_H,
  PAGE_OUTER,
  PAGE_TOP,
  Plate,
  Rings,
  Screws,
  SHEET_W,
  SPINE,
  TAB,
  TabStitches,
  u,
} from "./parts";

/** A page turn in progress: from one spread to another, possibly several leaves apart */
export type Turn = { from: number; to: number; key: number };

/** Each turning leaf is split into hinged strips so it can bend as it turns */
const STRIPS = 5;
const STRIP_W = SHEET_W / STRIPS;
const TURN_MS = 1150;
const STAGGER_MS = 170;
/** How far the free edge leads (or trails) the spine side mid-turn, as a share of the turn */
const LEAD = 0.16;
/** Light direction in the x/z plane: from the upper left, in front of the wall */
const LX = -0.45;
const LZ = 0.89;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

const LEATHER = "url(/notebook/leather.webp)";

/** One strip of a turning leaf, holding the next strip at its far edge */
function Strip({ k, front, back, start = 0 }: { k: number; front: number; back: number; start?: number }) {
  return (
    <div
      data-strip
      className="absolute"
      style={{
        left: k === 0 ? u(SPINE) : "100%",
        top: k === 0 ? u(PAGE_TOP) : 0,
        width: u(STRIP_W),
        height: k === 0 ? u(PAGE_H) : "100%",
        transformOrigin: "0 50%",
        transformStyle: "preserve-3d",
        transform: k === 0 ? `translateZ(0.3px) rotateY(${start}deg)` : undefined,
      }}
    >
      {/* Front: this strip's slice of the right-hand page */}
      <div className="absolute inset-0 overflow-hidden [backface-visibility:hidden]">
        <div className="absolute top-0 h-full" style={{ left: u(-k * STRIP_W), width: u(SHEET_W) }}>
          <Page side="right" entry={front} />
        </div>
        <div data-light="front" className="absolute inset-y-0 right-0" style={{ left: k === 0 ? u(PAGE_GAP) : 0 }} />
      </div>
      {/* Back: the matching slice of the next left-hand page, mirrored */}
      <div className="absolute inset-0 overflow-hidden [backface-visibility:hidden]" style={{ transform: "rotateY(180deg)" }}>
        <div className="absolute top-0 h-full" style={{ left: u(-(STRIPS - 1 - k) * STRIP_W), width: u(SHEET_W) }}>
          <Page side="left" entry={back} />
        </div>
        <div data-light="back" className="absolute inset-y-0 left-0" style={{ right: k === 0 ? u(PAGE_GAP) : 0 }} />
      </div>
      {k < STRIPS - 1 && <Strip k={k + 1} front={front} back={back} />}
    </div>
  );
}

/** Gutter-side shadow a lifted leaf throws on the page beneath it */
function LeafShadow({ side }: { side: "left" | "right" }) {
  return (
    <div
      data-shadow={side}
      className="pointer-events-none absolute inset-y-0"
      style={{
        [side === "right" ? "left" : "right"]: u(PAGE_GAP),
        width: u(SHEET_W - PAGE_GAP),
        transformOrigin: side === "right" ? "0 50%" : "100% 50%",
        background: `linear-gradient(${side === "right" ? "to right" : "to left"}, rgba(28,10,8,0.5) 0, rgba(28,10,8,0.22) 35%, transparent 100%)`,
        opacity: 0,
      }}
    />
  );
}

/**
 * The open binder, screwed to the wall at its corners: pebbled burgundy leather
 * with rosewood saddle stitching, a gold four-ring mechanism and ruled pages of
 * handwritten notes. Purely visual (the tabs beside it carry the content), so
 * it's hidden from assistive tech.
 */
export function Binder({
  shown,
  turn,
  fresh,
  onTurnEnd,
  onPrev,
  onNext,
}: {
  shown: number;
  turn: Turn | null;
  /** First spread, not yet turned: write it on when it scrolls into view */
  fresh: boolean;
  onTurnEnd: (key: number) => void;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  // Start writing the first spread once most of the binder is on screen
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        root.classList.add("nb-go");
        io.disconnect();
      },
      { threshold: 0.45 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  const lo = turn ? Math.min(turn.from, turn.to) : shown;
  const hi = turn ? Math.max(turn.from, turn.to) : shown;
  const forward = turn ? turn.to > turn.from : true;
  // Leaf j carries spread j's right page on its front and spread j+1's left page on its back
  const leaves = turn ? Array.from({ length: hi - lo }, (_, i) => lo + i) : [];

  // Drive the turn frame by frame: each strip's hinge angle, its shading, and the
  // shadows on the pages underneath.
  useEffect(() => {
    const root = rootRef.current;
    if (!turn || !root) return;
    const leafEls = [...root.querySelectorAll<HTMLElement>("[data-leaf]")];
    const leafParts = leafEls.map((leaf) => ({
      strips: [...leaf.querySelectorAll<HTMLElement>("[data-strip]")],
      fronts: [...leaf.querySelectorAll<HTMLElement>("[data-light='front']")],
      backs: [...leaf.querySelectorAll<HTMLElement>("[data-light='back']")],
    }));
    const shadowR = root.querySelector<HTMLElement>("[data-shadow='right']");
    const shadowL = root.querySelector<HTMLElement>("[data-shadow='left']");
    const n = leafParts.length;
    const dir = forward ? 1 : -1;

    // b: how squarely the surface faces the light (LZ when lying flat). Turned
    // away it falls into a warm shadow; tipped towards the light it brightens.
    const tone = (b: number) =>
      b >= LZ
        ? `rgba(255,250,240,${(((b - LZ) / (1 - LZ)) * 0.16).toFixed(3)})`
        : `rgba(40,20,14,${Math.min(0.48, ((LZ - b) / LZ) * 0.48).toFixed(3)})`;
    // Shade each strip with a gradient between its two edges (each edge sharing the
    // average of the strips either side), so the bend reads as one smooth surface.
    const shade = (els: HTMLElement[], bs: number[], dir: string) => {
      els.forEach((el, k) => {
        const a = k === 0 ? bs[0] : (bs[k - 1] + bs[k]) / 2;
        const b = k === bs.length - 1 ? bs[k] : (bs[k] + bs[k + 1]) / 2;
        el.style.background = `linear-gradient(${dir}, ${tone(a)}, ${tone(b)})`;
      });
    };

    let raf = 0;
    let t0 = 0;
    const frame = (now: number) => {
      if (!t0) t0 = now;
      let done = true;
      let shadeR = 0;
      let reachR = 0;
      let shadeL = 0;
      let reachL = 0;
      leafParts.forEach((leaf, i) => {
        // The leaf nearest the reader moves first: lowest on the way forward, highest on the way back
        const order = forward ? i : n - 1 - i;
        const t = clamp01((now - t0 - order * STAGGER_MS) / TURN_MS);
        if (t < 1) done = false;
        const e = easeInOut(t);
        const p = forward ? e : 1 - e; // 0 = lying on the right, 1 = lying on the left
        // Stack order while resting: lower leaves on top on the right, higher ones on the left,
        // so leaves lying together never fight for the same plane
        const z = ((n - 1 - i) * (1 - p) + i * p) * 0.4 + 0.3;
        let prev = 0;
        let mean = 0;
        const bs: number[] = [];
        leaf.strips.forEach((strip, k) => {
          const w = (k + 1) / STRIPS;
          // the free edge leads in the direction of travel, so the leaf bows as it lifts
          const phi = -180 * clamp01(p + dir * LEAD * w * Math.sin(Math.PI * p));
          strip.style.transform = k === 0 ? `translateZ(${z.toFixed(2)}px) rotateY(${phi.toFixed(2)}deg)` : `rotateY(${(phi - prev).toFixed(2)}deg)`;
          prev = phi;
          mean += phi / STRIPS;
          const r = (phi * Math.PI) / 180;
          bs.push(Math.sin(r) * LX + Math.cos(r) * LZ);
        });
        shade(leaf.fronts, bs, "to right");
        // the back faces are mirrored, so their spine side is on the right
        shade(
          leaf.backs,
          bs.map((b) => -b),
          "to left",
        );
        const a = -mean; // 0 → 180 degrees off the right-hand page
        const rad = (a * Math.PI) / 180;
        const sr = smooth(0, 40, a) * (1 - smooth(85, 125, a)) * 0.55;
        if (sr > shadeR) {
          shadeR = sr;
          reachR = 0.12 + 0.88 * Math.max(0, Math.cos(rad));
        }
        const sl = smooth(60, 105, a) * (1 - smooth(150, 180, a)) * 0.42;
        if (sl > shadeL) {
          shadeL = sl;
          reachL = 0.12 + 0.88 * Math.max(0, -Math.cos(rad));
        }
      });
      if (shadowR) {
        shadowR.style.opacity = shadeR.toFixed(3);
        shadowR.style.transform = `scaleX(${reachR.toFixed(3)})`;
      }
      if (shadowL) {
        shadowL.style.opacity = shadeL.toFixed(3);
        shadowL.style.transform = `scaleX(${reachL.toFixed(3)})`;
      }
      if (done) onTurnEnd(turn.key);
      else raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [turn, forward, onTurnEnd]);

  const leatherBg = (x: number, y: number): CSSProperties => ({
    backgroundColor: "#2A070C",
    backgroundImage: [
      // soft overhead light pooling at the top left of the hide
      "radial-gradient(120% 95% at 22% 0%, rgba(255,186,186,0.075) 0, transparent 60%)",
      // the edges turning away from the light
      "radial-gradient(150% 150% at 50% 42%, transparent 58%, rgba(6,0,2,0.32) 100%)",
      LEATHER,
    ].join(", "),
    backgroundSize: `100% 100%, 100% 100%, ${u(620)} ${u(620)}`,
    backgroundPosition: `0 0, 0 0, ${u(x)} ${u(y)}`,
  });

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="relative select-none [container-type:inline-size]"
      // Leave room on the right for the closure tab, which runs past the cover
      style={{ width: `${(BOOK_W / (TAB.x + TAB.w)) * 100}%`, aspectRatio: `${BOOK_W} / ${BOOK_H}` }}
    >
      <div className="nb-scale absolute inset-0">
        {/* The block's thickness, and its shadow on the wall */}
        <div
          className="absolute inset-0"
          style={{
            borderRadius: u(18),
            transform: `translateY(${u(3.5)})`,
            background: "#160307",
            boxShadow: [
              `0 ${u(1)} ${u(1.5)} rgba(40,8,14,0.55)`,
              `0 ${u(8)} ${u(14)} ${u(-2)} rgba(54,16,22,0.38)`,
              `0 ${u(26)} ${u(40)} ${u(-10)} rgba(60,22,26,0.34)`,
              `0 ${u(52)} ${u(80)} ${u(-26)} rgba(70,30,30,0.28)`,
            ].join(", "),
          }}
        />

        {/* Cover, opened flat: a burnished, slightly rounded edge all the way round */}
        <div
          className="absolute inset-0"
          style={{
            ...leatherBg(0, 0),
            borderRadius: u(18),
            boxShadow: [
              `inset 0 ${u(1.2)} 0 rgba(255,190,190,0.12)`,
              `inset 0 0 0 ${u(3.4)} rgba(14,1,4,0.42)`,
              `inset 0 ${u(-2)} ${u(3)} rgba(0,0,0,0.5)`,
            ].join(", "),
          }}
        />
        <CoverDetail />

        {/* Closure tab, lying over the cover's edge */}
        <div
          className="absolute"
          style={{
            ...leatherBg(-137, -91),
            left: u(TAB.x),
            top: u(TAB.y),
            width: u(TAB.w),
            height: u(TAB.h),
            borderRadius: u(TAB.r),
            boxShadow: [
              `inset 0 ${u(1.1)} 0 rgba(255,190,190,0.14)`,
              `inset 0 0 0 ${u(2.6)} rgba(14,1,4,0.4)`,
              `0 ${u(1.4)} ${u(1.6)} rgba(6,0,2,0.6)`,
              `${u(2)} ${u(7)} ${u(10)} rgba(50,14,20,0.35)`,
            ].join(", "),
          }}
        />
        <TabStitches />
        <Screws />
        <Plate />

        {/* Resting pages: left and right of the rings */}
        <div
          className={`absolute ${onPrev ? "cursor-pointer" : ""}`}
          style={{ left: u(PAGE_OUTER), top: u(PAGE_TOP), width: u(SHEET_W), height: u(PAGE_H) }}
          onClick={onPrev}
        >
          <Page side="left" entry={lo} stack write={fresh} />
          <LeafShadow side="left" />
        </div>
        <div
          className={`absolute ${onNext ? "cursor-pointer" : ""}`}
          style={{ left: u(SPINE), top: u(PAGE_TOP), width: u(SHEET_W), height: u(PAGE_H) }}
          onClick={onNext}
        >
          <Page side="right" entry={hi} stack write={fresh} start={leftPageMs(hi)} />
          <LeafShadow side="right" />
        </div>

        {/* Leaves in mid-turn */}
        {turn && (
          <div className="pointer-events-none absolute inset-0" style={{ perspective: u(2600), transformStyle: "preserve-3d" }}>
            {leaves.map((j) => (
              <div key={`${turn.key}-${j}`} data-leaf className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
                {/* Leaves start where they rest: on the right going forward, on the left going back */}
                <Strip k={0} front={j} back={j + 1} start={forward ? 0 : -180} />
              </div>
            ))}
          </div>
        )}

        <Rings />

        {/* One light for the whole scene: a touch brighter at the head of the binder */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            borderRadius: u(18),
            background: "linear-gradient(to bottom, rgba(255,250,240,0.06), transparent 40%, rgba(20,4,8,0.08))",
          }}
        />
      </div>
    </div>
  );
}

import { Check, X } from "lucide-react";
import { comparison } from "@/lib/data";
import { FoldCompare } from "./fold/FoldCompare";
import { LogoMark, Wordmark } from "./Navbar";
import { WhyUsStory } from "./WhyUsStory";

/** The comparison as a plain table: shown instead of the foldable when WebGL isn't available. */
function ComparisonTable() {
  return (
    <>
      {/* Desktop */}
      <div
        className="relative hidden grid-cols-[0.8fr_1fr_1fr] gap-x-6 md:grid"
        style={{ gridTemplateRows: `auto repeat(${comparison.length}, auto) 1.5rem` }}
      >
        {/* Our column, raised as one card behind its cells */}
        <div
          aria-hidden
          className="bg-burgundy-rich rounded-3xl shadow-[0_40px_80px_-40px_rgba(54,10,22,0.7)]"
          style={{ gridColumn: 3, gridRow: `1 / span ${comparison.length + 2}` }}
        />
        <div style={{ gridColumn: 1, gridRow: 1 }} />
        <div
          className="flex items-center gap-2 px-6 pb-6 pt-8 text-xs uppercase tracking-[0.2em] text-taupe-dark"
          style={{ gridColumn: 2, gridRow: 1 }}
        >
          Typical agency
        </div>
        <div className="relative flex items-center gap-2.5 px-8 pb-6 pt-8" style={{ gridColumn: 3, gridRow: 1 }}>
          <LogoMark className="h-7 w-7 text-paper" />
          <Wordmark className="text-base text-paper" />
        </div>
        {comparison.map((r, i) => {
          const row = i + 2;
          return (
            <div key={r.topic} className="contents">
              <div
                className="border-t border-taupe-light py-6 text-sm font-medium leading-relaxed text-ink"
                style={{ gridColumn: 1, gridRow: row }}
              >
                {r.topic}
              </div>
              <div
                className="flex items-start gap-3 border-t border-taupe-light px-6 py-6 text-sm leading-relaxed text-taupe-dark"
                style={{ gridColumn: 2, gridRow: row }}
              >
                <X className="mt-0.5 h-4 w-4 shrink-0 text-taupe" strokeWidth={1.75} />
                {r.them}
              </div>
              <div
                className="relative mx-4 flex items-start gap-3 border-t border-paper/15 px-4 py-6 text-sm leading-relaxed text-paper"
                style={{ gridColumn: 3, gridRow: row }}
              >
                <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-paper/15">
                  <Check className="h-2.5 w-2.5 text-paper" strokeWidth={3} />
                </span>
                {r.us}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile */}
      <div className="space-y-4 md:hidden">
        <div className="flex items-center gap-2.5 pb-2">
          <LogoMark className="h-7 w-7 text-burgundy" />
          <Wordmark className="text-base text-ink" />
          <span className="text-sm text-taupe-dark">vs. a typical agency</span>
        </div>
        {comparison.map((r) => (
          <div key={r.topic} className="overflow-hidden rounded-2xl border border-taupe-light">
            <div className="flex items-start gap-3 px-5 py-4 text-sm leading-relaxed text-taupe-dark">
              <X className="mt-0.5 h-4 w-4 shrink-0 text-taupe" strokeWidth={1.75} />
              <div>
                <span className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-taupe">{r.topic}</span>
                {r.them}
              </div>
            </div>
            <div className="bg-burgundy-rich flex items-start gap-3 px-5 py-4 text-sm leading-relaxed text-paper">
              <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-paper/15">
                <Check className="h-2.5 w-2.5 text-paper" strokeWidth={3} />
              </span>
              {r.us}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function WhyUs() {
  return (
    <section id="why-us" aria-labelledby="why-us-title" className="relative overflow-x-clip">
      {/* The four reasons, pinned: laptop, phone, laptop, phone */}
      <WhyUsStory />

      {/* How that compares: a foldable that opens to show both sides */}
      <FoldCompare fallback={<ComparisonTable />} />
    </section>
  );
}

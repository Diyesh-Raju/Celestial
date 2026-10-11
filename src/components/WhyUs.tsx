import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import { LogoMark, Wordmark } from "./Navbar";
import { Reveal, SectionLabel } from "./Reveal";

const journey = [
  {
    stage: "Before",
    label: "01. Scattered work",
    text: "Spreadsheets, inboxes, and disconnected marketing channels slow down decisions.",
  },
  {
    stage: "With us",
    label: "02. One connected system",
    text: "We centralize your web presence, CRM pipelines, and digital ads into one workflow.",
  },
  {
    stage: "After",
    label: "03. Visible growth",
    text: "Complete pipeline visibility, clear customer status, and direct revenue reporting.",
  },
];

const rows = [
  {
    topic: "Scope",
    them: "One piece at a time: a site, or ads, or a CRM",
    us: "Website, CRM, ads and automation built as one system",
  },
  {
    topic: "Your leads",
    them: "Scattered across inboxes and spreadsheets",
    us: "Every lead in one pipeline, with a clear status",
  },
  {
    topic: "Reporting",
    them: "Clicks and impressions that never reach revenue",
    us: "Ad spend traced straight through to closed deals",
  },
  {
    topic: "Accountability",
    them: "Three vendors, three invoices, plenty of finger-pointing",
    us: "One team owns it end to end, from strategy to support",
  },
  {
    topic: "Delivery",
    them: "A big reveal at the end, surprises included",
    us: "Working software throughout, with visible progress",
  },
  {
    topic: "After launch",
    them: "A handoff, then you're on your own",
    us: "Ongoing optimization and CTO-level support",
  },
];

export function WhyUs() {
  return (
    <section id="why-us" className="relative scroll-mt-24 overflow-hidden border-t border-ink/[0.06] px-6 py-24 md:py-32">
      <div className="pointer-events-none absolute -right-40 top-40 h-[420px] w-[620px] rounded-full bg-burgundy/[0.05] blur-[120px]" />

      <div className="relative mx-auto max-w-6xl">
        <Reveal className="mb-16 max-w-3xl">
          <SectionLabel tone="burgundy">Why Celestial</SectionLabel>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.025em] text-burgundy md:text-6xl">
            Others sell you parts. We build the <span className="text-shine">whole</span> system.
          </h2>
          <p className="mt-6 max-w-xl text-ink/65">
            Most agencies stop at a single deliverable. We take your business from scattered tools to one
            connected engine you can actually see working.
          </p>
        </Reveal>

        {/* Before → with us → after */}
        <div className="relative grid gap-10 md:grid-cols-3 md:gap-6">
          <div className="pointer-events-none absolute left-0 right-0 top-[7px] hidden h-px bg-gradient-to-r from-taupe/60 via-burgundy to-burgundy/40 md:block" />

          {journey.map((p, i) => {
            const active = i === 1;
            return (
              <Reveal key={p.label} delay={i * 0.1} className="relative md:pt-10">
                <span
                  className={`absolute left-0 top-0 hidden h-[15px] w-[15px] rounded-full border-2 md:block ${
                    active ? "border-burgundy bg-burgundy shadow-[0_0_0_6px_rgba(86,18,38,0.12)]" : "border-taupe bg-paper"
                  }`}
                />
                <div className={`border-l py-2 pl-6 ${active ? "border-burgundy/50" : "border-taupe/50"}`}>
                  <span className="mb-3 block text-[10px] uppercase tracking-[0.2em] text-taupe">{p.stage}</span>
                  <span
                    className={`mb-2 block text-xs uppercase tracking-widest ${active ? "text-burgundy" : "text-taupe-dark"}`}
                  >
                    {p.label}
                  </span>
                  <p className="leading-relaxed text-ink/80">{p.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Comparison — desktop */}
        <Reveal className="mt-24 hidden md:block">
          <div
            className="relative grid grid-cols-[0.8fr_1fr_1fr] gap-x-6"
            style={{ gridTemplateRows: `auto repeat(${rows.length}, auto) 1.5rem` }}
          >
            {/* Our column, raised as one card behind its cells */}
            <div
              aria-hidden
              className="bg-burgundy-rich rounded-3xl shadow-[0_40px_80px_-40px_rgba(54,10,22,0.7)]"
              style={{ gridColumn: 3, gridRow: `1 / span ${rows.length + 2}` }}
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

            {rows.map((r, i) => {
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
        </Reveal>

        {/* Comparison — mobile */}
        <div className="mt-20 space-y-4 md:hidden">
          <div className="flex items-center gap-2.5 pb-2">
            <LogoMark className="h-7 w-7 text-burgundy" />
            <Wordmark className="text-base text-ink" />
            <span className="text-sm text-taupe-dark">vs. a typical agency</span>
          </div>
          {rows.map((r, i) => (
            <Reveal key={r.topic} delay={Math.min(i, 3) * 0.05}>
              <div className="overflow-hidden rounded-2xl border border-taupe-light">
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
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 flex justify-center md:justify-end">
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 text-sm font-medium text-burgundy transition-colors hover:text-burgundy-light"
          >
            See what one system could do for you
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

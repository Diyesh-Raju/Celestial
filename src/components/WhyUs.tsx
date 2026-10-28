import Link from "next/link";
import { Fragment } from "react";
import { ArrowRight, Check, X } from "lucide-react";
import { LogoMark, Wordmark } from "./Navbar";
import { Reveal, SectionLabel } from "./Reveal";

// What a client gains, beyond the deliverable. The first one leads, in burgundy.
const advantages = [
  {
    tag: "One team",
    title: "A whole team for the price of one vendor",
    text: "Strategy, design, engineering, ads and support under one roof, owning the result together. No briefing three agencies, and no finger-pointing when something breaks.",
    roles: ["Strategy", "Design", "Engineering", "Growth", "Support"],
  },
  {
    tag: "Compounding",
    title: "Systems that get stronger together",
    text: "Your site, CRM and ads share one source of truth, so every piece we add makes the others work harder.",
    flow: ["Website", "CRM", "Ads"],
  },
  {
    tag: "Measurable",
    title: "Spend you can trace",
    text: "Every lead is tracked from the ad that brought it in to the deal it closed.",
  },
  {
    tag: "Certain",
    title: "A price that doesn’t move",
    text: "The whole job is scoped up front and given one fixed number. No hourly meter.",
  },
  {
    tag: "Yours",
    title: "Everything stays yours",
    text: "Code, data, domain and ad accounts in your name, whether we work together for a month or ten years.",
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
            Your competitors hire vendors. You get an <span className="text-shine">unfair advantage.</span>
          </h2>
          <p className="mt-6 max-w-xl text-ink/65">
            Most agencies stop at a single deliverable. Working with us changes how your whole business runs, and
            that edge keeps growing long after launch.
          </p>
        </Reveal>

        {/* Advantages */}
        <div className="grid gap-4 md:grid-cols-6">
          {advantages.map((a, i) => {
            const lead = i === 0;
            return (
              <Reveal
                key={a.tag}
                delay={Math.min(i, 3) * 0.08}
                className={lead ? "md:col-span-6 lg:col-span-4" : i === 1 ? "md:col-span-6 lg:col-span-2" : "md:col-span-2"}
              >
                <article
                  className={`flex h-full flex-col rounded-[22px] p-7 md:p-8 ${
                    lead
                      ? "bg-burgundy-rich text-paper shadow-[0_40px_80px_-40px_rgba(54,10,22,0.7)]"
                      : "border border-taupe-light bg-cream/40"
                  }`}
                >
                  <span
                    className={`text-[10px] uppercase tracking-[0.2em] ${lead ? "text-rose" : "text-taupe-dark"}`}
                  >
                    {String(i + 1).padStart(2, "0")} · {a.tag}
                  </span>
                  <h3
                    className={`mt-6 font-display font-semibold tracking-[-0.02em] ${
                      lead ? "max-w-md text-3xl leading-[1.08] text-paper md:text-[2.5rem]" : "text-xl leading-snug text-ink"
                    }`}
                  >
                    {a.title}
                  </h3>
                  <p className={`mt-3 text-sm leading-relaxed ${lead ? "max-w-lg text-paper/70 md:text-base" : "text-ink/65"}`}>
                    {a.text}
                  </p>
                  {a.flow && (
                    <div aria-hidden className="mt-auto flex items-center pt-8">
                      {a.flow.map((n, j) => (
                        <Fragment key={n}>
                          {j > 0 && <span className="h-px flex-1 bg-gradient-to-r from-burgundy/35 to-taupe/60" />}
                          <span className="rounded-full border border-taupe-light bg-paper px-3.5 py-1.5 text-xs text-ink/75">{n}</span>
                        </Fragment>
                      ))}
                    </div>
                  )}
                  {a.roles && (
                    <ul className="mt-auto flex flex-wrap gap-2 pt-8">
                      {a.roles.map((r) => (
                        <li key={r} className="rounded-full border border-paper/20 bg-paper/[0.08] px-3.5 py-1.5 text-xs text-paper/85">
                          {r}
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
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

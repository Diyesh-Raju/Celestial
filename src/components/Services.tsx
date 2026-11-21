import { ArrowRight, Cpu, Database, MonitorSmartphone, TrendingUp, Workflow, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Reveal, SectionLabel } from "./Reveal";
import { ConnectVisual, CrmVisual, GrowVisual, WebVisual } from "./services/Visuals";

type Tone = "dark" | "light";

const card = {
  base: "group flex w-full flex-col rounded-[2.25rem] p-7 transition-[translate,box-shadow] duration-500 ease-out hover:-translate-y-1 sm:p-8 lg:rounded-[2.75rem] lg:p-10",
  dark: "relative overflow-hidden bg-burgundy-deep text-paper shadow-[0_40px_80px_-45px_rgba(54,10,22,0.75)] hover:shadow-[0_50px_90px_-45px_rgba(54,10,22,0.85)]",
  light:
    "relative overflow-hidden border border-taupe-light bg-[#efe9e3] text-ink shadow-[0_40px_80px_-50px_rgba(54,10,22,0.3)] hover:shadow-[0_50px_90px_-50px_rgba(54,10,22,0.4)]",
};

/** Number, verb and icon across the top of a card. */
function Eyebrow({ num, verb, Icon, tone }: { num: string; verb: string; Icon: LucideIcon; tone: Tone }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-[10px] uppercase tracking-[0.2em] ${tone === "dark" ? "text-paper/55" : "text-taupe-dark"}`}>
        {num} · {verb}
      </span>
      <span
        className={`grid h-10 w-10 place-items-center rounded-full ${
          tone === "dark" ? "bg-paper/10 text-rose" : "bg-paper text-burgundy"
        }`}
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
      </span>
    </div>
  );
}

/** Title, one line of copy and the tags. */
function Copy({ title, children, tags, tone }: { title: string; children: ReactNode; tags: string[]; tone: Tone }) {
  return (
    <div>
      <h3
        className={`font-display text-2xl font-semibold tracking-[-0.02em] lg:text-[1.75rem] ${tone === "dark" ? "text-paper" : "text-ink"}`}
      >
        {title}
      </h3>
      <p className={`mt-3 max-w-md text-[15px] leading-relaxed ${tone === "dark" ? "text-paper/65" : "text-ink/65"}`}>
        {children}
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        {tags.map((t) => (
          <li
            key={t}
            className={`rounded-full px-3 py-1.5 text-xs ${
              tone === "dark" ? "border border-paper/15 text-paper/75" : "bg-paper text-taupe-dark"
            }`}
          >
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Our products & services: the quote, then four cards in an uneven two-by-two
    (narrow beside wide on both rows), then the support that follows every launch. */
export function Services() {
  return (
    <section id="services" aria-labelledby="services-title" className="relative scroll-mt-24 overflow-clip px-6 py-24 md:py-32">
      <div className="pointer-events-none absolute -right-40 top-40 h-[460px] w-[640px] rounded-full bg-burgundy/[0.05] blur-[120px]" />

      <div className="relative mx-auto max-w-6xl">
        <Reveal className="text-center">
          <SectionLabel>Our products &amp; services</SectionLabel>
          <h2
            id="services-title"
            className="mx-auto mt-5 max-w-4xl text-balance font-display text-4xl font-semibold leading-[1.08] tracking-[-0.03em] text-burgundy md:text-6xl"
          >
            Everything your business needs to lead, <span className="text-shine">crafted under one roof.</span>
          </h2>
          {/* The underline from the sketch, drawn in by hand */}
          <svg aria-hidden viewBox="0 0 320 18" className="mx-auto mt-6 h-3 w-48 overflow-visible md:mt-8 md:w-72" fill="none">
            <path
              d="M4 12 C70 4 150 3 214 7 C252 9 288 11 316 6"
              pathLength={1}
              className="svc-draw stroke-burgundy-light"
              strokeWidth={3}
              strokeLinecap="round"
            />
          </svg>
        </Reveal>

        <div className="mt-14 grid gap-4 md:mt-20 md:grid-cols-12 md:gap-5 lg:grid-cols-24 lg:gap-6">
          {/* 01: narrow, dark */}
          <Reveal className="flex md:col-span-5 lg:col-span-9">
            <article className={`${card.base} ${card.dark}`}>
              <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-burgundy-light/40 blur-[80px]" />
              <div className="relative flex flex-1 flex-col gap-7">
                <Eyebrow num="01" verb="Build" Icon={MonitorSmartphone} tone="dark" />
                <Copy title="Websites & e‑commerce" tags={["Web platforms", "Customer portals", "E-commerce"]} tone="dark">
                  High-conversion web platforms, customer portals and tailored storefronts, built for speed and scale.
                </Copy>
                <div className="mt-auto">
                  <WebVisual />
                </div>
              </div>
            </article>
          </Reveal>

          {/* 02: wide, light. The pipeline grows to fill the row */}
          <Reveal delay={0.08} className="flex md:col-span-7 lg:col-span-15">
            <article className={`${card.base} ${card.light} gap-7`}>
              <Eyebrow num="02" verb="Run" Icon={Database} tone="light" />
              <Copy title="CRM & business systems" tags={["Deal pipelines", "Quotes", "Live reporting"]} tone="light">
                Pipelines, contact tracking, quotes, automated follow-ups and live reporting, shaped around how your team
                actually works.
              </Copy>
              {/* Zero basis: the pipeline fills the height the row gives it but never sets it */}
              <div className="flex min-h-56 grow basis-0 flex-col">
                <CrmVisual />
              </div>
            </article>
          </Reveal>

          {/* 03: narrow-ish, light */}
          <Reveal className="flex md:col-span-6 lg:col-span-11">
            <article className={`${card.base} ${card.light} gap-7`}>
              <Eyebrow num="03" verb="Connect" Icon={Workflow} tone="light" />
              <Copy title="Automation & integrations" tags={["Workflows", "API integration", "Custom software"]} tone="light">
                Workflows that end manual handoffs, with your tools, databases and APIs joined into one system. No
                rip-and-replace.
              </Copy>
              <div className="mt-auto">
                <ConnectVisual />
              </div>
            </article>
          </Reveal>

          {/* 04: wide, dark. The chart runs out to the card's edges */}
          <Reveal delay={0.08} className="flex md:col-span-6 lg:col-span-13">
            <article className={`${card.base} ${card.dark} bg-gradient-to-br from-burgundy to-burgundy-deep pb-0!`}>
              <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-rose/20 blur-[90px]" />
              <div className="relative flex flex-1 flex-col gap-7">
                <Eyebrow num="04" verb="Grow" Icon={TrendingUp} tone="dark" />
                <Copy title="Growth & ads" tags={["Meta Ads", "Google Ads", "SEO", "ROI tracking"]} tone="dark">
                  Meta and Google campaigns and top-tier SEO, wired into your CRM and measured in revenue, not clicks.
                </Copy>
                <div className="-mx-7 mt-auto sm:-mx-8 lg:-mx-10">
                  <GrowVisual />
                </div>
              </div>
            </article>
          </Reveal>
        </div>

        {/* After launch: managed tech and CTO support */}
        <Reveal className="mt-4 md:mt-5 lg:mt-6">
          <div className="flex flex-col items-start gap-5 rounded-[2rem] border border-taupe-light bg-[#efe9e3] p-6 sm:flex-row sm:items-center sm:rounded-full sm:p-3 sm:pr-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-burgundy text-paper">
              <Cpu className="h-5 w-5" strokeWidth={1.5} />
            </span>
            <p className="flex-1 text-[15px] leading-relaxed text-ink/65">
              <span className="font-semibold text-ink">And after launch, managed tech &amp; CTO support.</span> Monitoring,
              infrastructure and technical leadership for everything we ship.
            </p>
            <Link
              href="/contact"
              className="group/cta inline-flex shrink-0 items-center gap-2 rounded-full bg-burgundy px-6 py-3.5 text-sm font-medium text-paper transition-colors hover:bg-burgundy-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
            >
              Start a project
              <ArrowRight className="h-4 w-4 transition-transform group-hover/cta:translate-x-1" strokeWidth={1.75} />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

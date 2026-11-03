import { Database, MonitorSmartphone, TrendingUp, Workflow } from "lucide-react";
import { Fragment, type CSSProperties } from "react";
import { FlyInHeading } from "./about/FlyInHeading";
import { Reveal } from "./Reveal";

// The answer under the fly-in headline. Accent phrases land in burgundy.
const answer = [
  { text: "We are a" },
  { text: "B2B custom software and growth studio.", accent: true },
  { text: "We design, build and grow digital products for" },
  { text: "industry leaders,", accent: true },
  { text: "and the connected systems that keep them a step ahead." },
];

// One span per word; each darkens over its own slice of the scroll (see .ink-words in globals.css)
const answerWords = answer.flatMap((s) => s.text.split(" ").map((w) => ({ w, accent: s.accent })));
const INK_FROM = 6; // % of the paragraph's cover range where the first word starts
const INK_TO = 44; // ...and where the last word finishes
const inkStep = (INK_TO - INK_FROM) / answerWords.length;

// What we build, each paired with the standard it ships with
const builds = [
  {
    icon: MonitorSmartphone,
    standard: "Motion",
    title: "Websites & e-commerce",
    text: "Fast, mobile-first sites and storefronts with fluid, purposeful motion that makes your brand feel premium and turns visitors into enquiries and sales.",
  },
  {
    icon: Database,
    standard: "Evolution",
    title: "CRMs & business tools",
    text: "Pipelines, quotes and dashboards shaped around how your team actually works, replacing outdated tools with a modern stack you can keep growing on.",
  },
  {
    icon: Workflow,
    standard: "Integration",
    title: "Automation & integrations",
    text: "Your website, CRM, ads and tools talking to each other, so data moves on its own and no lead or data point slips through.",
  },
  {
    icon: TrendingUp,
    standard: "Visibility",
    title: "Growth & ad systems",
    text: "Top-tier SEO so customers find you before your competitors, plus Meta and Google campaigns wired into your CRM and measured in revenue, not clicks.",
  },
];

// Under the hero: who the studio is and what it builds.
// (The founders and their story live on their own page.)
export function About() {
  return (
    // overflow-clip, not hidden: a hidden section becomes its own scroll container and
    // the scroll-driven answer would follow it instead of the page
    <section id="about" className="relative scroll-mt-24 overflow-clip px-6 py-24 md:py-32">
      <div className="pointer-events-none absolute -left-40 top-24 h-[420px] w-[620px] rounded-full bg-burgundy/[0.05] blur-[120px]" />

      <div className="relative mx-auto max-w-6xl">
        {/* The question: each half flies in from its own side while the "&" holds still */}
        <FlyInHeading className="text-center font-display text-[clamp(3rem,12.5vw,6.5rem)] font-semibold leading-[0.95] tracking-[-0.045em] text-burgundy">
          <span data-fly="left" className="block">
            Who we are
          </span>
          <span className="block py-[0.04em] font-extralight leading-[0.9] tracking-normal">
            <span className="text-shine pr-[0.04em]">&amp;</span>
          </span>
          <span data-fly="right" className="block">
            what we build
          </span>
        </FlyInHeading>

        {/* The answer: darkens word by word as it scrolls up */}
        <div className="mx-auto mt-16 max-w-4xl text-center md:mt-24">
          <p className="ink-words text-balance font-display text-[1.6rem] font-medium leading-[1.2] tracking-[-0.02em] text-ink sm:text-3xl md:text-[2.4rem]">
            {answerWords.map(({ w, accent }, i) => {
              const a = INK_FROM + i * inkStep;
              return (
                <Fragment key={i}>
                  {i > 0 && " "}
                  <span
                    className={accent ? "text-burgundy" : undefined}
                    style={{ "--a": `${a.toFixed(2)}%`, "--b": `${(a + inkStep * 3).toFixed(2)}%` } as CSSProperties}
                  >
                    {w}
                  </span>
                </Fragment>
              );
            })}
          </p>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-8 max-w-2xl leading-relaxed text-ink/65 md:mt-10 md:text-lg">
              One senior team of strategists, designers, engineers and growth marketers, based in India and
              working with clients everywhere. We treat your website, CRM, automations and ads as one system,
              and we stay on after launch, because that is when the real growth starts.
            </p>
          </Reveal>
        </div>

        {/* What we build, in practice, with the standard each one ships with */}
        <div className="relative mt-20 md:mt-28">
          {/* On wide screens the four top rules join into one, with a pulse running along it */}
          <Reveal className="pointer-events-none absolute inset-x-0 top-0 hidden h-px bg-burgundy/20 lg:block">
            <span className="absolute top-1/2 h-px w-24 -translate-y-1/2 animate-pulse-line bg-gradient-to-r from-transparent via-burgundy-light to-transparent" />
          </Reveal>
          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {builds.map((b, i) => (
              <Reveal key={b.title} delay={i * 0.08} className="border-t border-burgundy/25 pt-6 lg:border-t-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-taupe-dark">
                    {String(i + 1).padStart(2, "0")} · {b.standard}
                  </span>
                  <b.icon className="h-5 w-5 text-burgundy" strokeWidth={1.5} />
                </div>
                <h3 className="mt-6 font-display text-xl font-semibold tracking-[-0.015em] text-ink">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">{b.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

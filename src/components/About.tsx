import { Cpu, Database, Gauge, MonitorSmartphone, Network, ShieldCheck, Sparkles, TrendingUp, Workflow } from "lucide-react";
import { Reveal, SectionLabel } from "./Reveal";

const facts = [
  { label: "Who", value: "A design and engineering studio" },
  { label: "Where", value: "India, with clients everywhere" },
  { label: "How", value: "One team, from strategy to support" },
];

const builds = [
  {
    icon: MonitorSmartphone,
    title: "Websites & e-commerce",
    text: "Fast, considered sites and storefronts that turn visitors into enquiries and sales.",
  },
  {
    icon: Database,
    title: "CRMs & business tools",
    text: "Pipelines, quotes and dashboards shaped around how your team actually works.",
  },
  {
    icon: Workflow,
    title: "Automation & integrations",
    text: "The links between your tools, so data moves on its own instead of by copy and paste.",
  },
  {
    icon: TrendingUp,
    title: "Growth & ad systems",
    text: "Meta and Google campaigns wired into your CRM and measured in revenue, not clicks.",
  },
];

// The standards every build ships with
const pillars = [
  {
    icon: Sparkles,
    stage: "Motion",
    title: "Smooth animations",
    text: "Fluid, purposeful motion that makes your brand feel premium and keeps visitors scrolling.",
  },
  {
    icon: TrendingUp,
    stage: "Visibility",
    title: "Top-tier SEO",
    text: "Fast pages, clean structure and technical SEO so customers find you before your competitors.",
  },
  {
    icon: Network,
    stage: "Integration",
    title: "Connected systems",
    text: "Website, CRM, ads and tools talking to each other, so no lead or data point slips through.",
  },
  {
    icon: Cpu,
    stage: "Evolution",
    title: "Better technology",
    text: "We replace outdated tools with a modern stack your business can keep growing on.",
  },
];

const foundations = [
  { icon: Gauge, text: "Performance-tuned, mobile-first builds" },
  { icon: ShieldCheck, text: "Secure, monitored infrastructure" },
];

// Under the hero: who the studio is, what it builds, and the standards every build ships with.
// (The founders and their story live on their own page.)
export function About() {
  return (
    <section id="about" className="relative scroll-mt-24 overflow-hidden px-6 py-24 md:py-32">
      <div className="pointer-events-none absolute -left-40 top-24 h-[420px] w-[620px] rounded-full bg-burgundy/[0.05] blur-[120px]" />

      <div className="relative mx-auto max-w-6xl">
        {/* Who we are */}
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-end lg:gap-16">
          <Reveal>
            <SectionLabel tone="burgundy">Who we are</SectionLabel>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.025em] text-burgundy md:text-6xl">
              A studio that engineers the systems growing businesses <span className="text-shine">run on.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="space-y-5 text-ink/70 lg:pb-2">
            <p>
              Celestial Developers is a design and engineering studio based in India, working with businesses
              everywhere. We plan, design, build and run the technology a company grows on, and we treat it as one
              connected system rather than a pile of separate projects.
            </p>
            <p>
              That means one team that understands your business end to end: the strategy behind it, the screens
              your customers see, and the code, data and campaigns underneath. We stay close after launch too,
              because that is when the real growth work starts.
            </p>
          </Reveal>
        </div>

        <Reveal className="mt-14 md:mt-20">
          <dl className="grid border-t border-ink/10 sm:grid-cols-3">
            {facts.map((f, i) => (
              <div
                key={f.label}
                className={`border-b border-ink/10 py-5 sm:border-b-0 sm:py-7 ${i > 0 ? "sm:border-l sm:pl-8" : ""}`}
              >
                <dt className="text-[10px] uppercase tracking-[0.2em] text-taupe-dark">{f.label}</dt>
                <dd className="mt-2 font-display text-lg font-semibold tracking-[-0.015em] text-ink md:text-xl">
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        {/* What we build */}
        <div className="mt-24 md:mt-32">
          <Reveal className="max-w-2xl">
            <SectionLabel tone="burgundy">What we build</SectionLabel>
            <h3 className="mt-4 font-display text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-burgundy md:text-[2.75rem]">
              Everything your business runs on, built to work as one.
            </h3>
          </Reveal>

          <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {builds.map((b, i) => (
              <Reveal key={b.title} delay={i * 0.08} className="border-t border-burgundy/25 pt-6">
                <div className="flex items-center justify-between">
                  <span className="font-condensed text-sm tracking-[0.08em] text-taupe">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <b.icon className="h-5 w-5 text-burgundy" strokeWidth={1.5} />
                </div>
                <h4 className="mt-6 font-display text-xl font-semibold tracking-[-0.015em] text-ink">{b.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">{b.text}</p>
              </Reveal>
            ))}
          </div>

          {/* Built in, by default: the same standards on every build */}
          <Reveal className="mt-16 md:mt-24">
            <div className="relative overflow-hidden rounded-[28px] bg-charcoal px-6 py-12 text-paper shadow-[0_40px_80px_-40px_rgba(29,27,28,0.7)] md:rounded-[36px] md:px-12 md:py-16">
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-burgundy/25 blur-[140px]" />

              <div className="relative">
                <div className="mb-12 grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-14">
                  <div>
                    <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-rose">
                      <span className="h-px w-6 bg-rose" />
                      Built in, by default
                    </span>
                    <h3 className="mt-4 font-display text-3xl font-semibold leading-[1.08] tracking-[-0.025em] text-paper md:text-5xl">
                      Polished on the surface, <span className="text-shine-dark">engineered</span> underneath
                    </h3>
                  </div>
                  <p className="max-w-md text-paper/60 lg:pb-1.5">
                    Every project ships with the same four standards, so what we build looks great, gets found, and
                    moves your whole business forward.
                  </p>
                </div>

                <div className="relative grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {/* Pulse running across the four pillars */}
                  <div className="pointer-events-none absolute left-0 right-0 top-1/2 hidden h-px bg-paper/10 lg:block">
                    <span className="absolute top-1/2 h-px w-24 -translate-y-1/2 animate-pulse-line bg-gradient-to-r from-transparent via-rose to-transparent" />
                  </div>

                  {pillars.map((node, i) => (
                    <div
                      key={node.stage}
                      className="relative rounded-2xl border border-paper/10 bg-charcoal-deep p-6 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.8)] transition-colors hover:border-rose/40"
                    >
                      <div className="mb-8 flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-paper/45">
                          {String(i + 1).padStart(2, "0")} · {node.stage}
                        </span>
                        <node.icon className={`h-5 w-5 ${i % 2 ? "text-taupe" : "text-rose"}`} strokeWidth={1.5} />
                      </div>
                      <h4 className="mb-2 font-display text-xl font-semibold tracking-[-0.015em] text-paper">
                        {node.title}
                      </h4>
                      <p className="text-sm leading-relaxed text-paper/55">{node.text}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid gap-4 rounded-2xl border border-dashed border-paper/15 p-5 sm:grid-cols-2">
                  {foundations.map((f) => (
                    <div key={f.text} className="flex items-center gap-3 text-sm text-paper/60">
                      <f.icon className="h-4 w-4 text-taupe" strokeWidth={1.5} />
                      {f.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

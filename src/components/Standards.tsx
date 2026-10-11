import { Cpu, Gauge, Network, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { Reveal } from "./Reveal";

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

export function Standards() {
  return (
    <section
      id="standards"
      className="relative scroll-mt-24 overflow-hidden border-t border-paper/[0.06] bg-charcoal px-6 py-24 text-paper md:py-32"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-burgundy/25 blur-[140px]" />

      <div className="relative mx-auto max-w-6xl">
        <Reveal className="mb-16 max-w-3xl">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-rose">
            <span className="h-px w-6 bg-rose" />
            Built in, by default
          </span>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.025em] text-paper md:text-6xl">
            Polished on the surface, <span className="text-shine-dark">engineered</span> underneath
          </h2>
          <p className="mt-6 max-w-xl text-paper/60">
            Every project ships with the same four standards, so what we build looks great, gets found, and
            moves your whole business forward.
          </p>
        </Reveal>

        <Reveal>
          <div className="relative grid gap-4 md:grid-cols-4">
            {/* Pulse running across the four pillars */}
            <div className="pointer-events-none absolute left-0 right-0 top-1/2 hidden h-px bg-paper/10 md:block">
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
                <h3 className="mb-2 font-display text-xl font-semibold tracking-[-0.015em] text-paper">{node.title}</h3>
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
        </Reveal>
      </div>
    </section>
  );
}

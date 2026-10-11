import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { processSteps } from "@/lib/data";
import { Reveal } from "./Reveal";
import { RibbonTrack } from "./process/RibbonTrack";
import { processVisuals, VisualFrame } from "./process/visuals";

const chips = ["5 stages", "1 team", "0 surprises"];

export function Process() {
  return (
    <section id="process" className="relative scroll-mt-24 overflow-hidden border-t border-ink/[0.06] px-6 pt-24 md:pt-32">
      {/* Poster-style header */}
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <span className="inline-flex items-center gap-3 font-condensed text-xs uppercase tracking-[0.2em] text-burgundy">
            <span className="h-[2px] w-9 bg-burgundy" />
            How it works
          </span>
        </Reveal>

        <div className="mt-8 grid gap-10 lg:grid-cols-[auto_1fr] lg:items-end lg:gap-14">
          <Reveal>
            <h2 className="font-condensed text-[clamp(3.75rem,16.5vw,10rem)] uppercase leading-[0.88] text-burgundy">
              <span className="block">Celestial’s</span>
              <span className="block text-outline">Process.</span>
            </h2>
          </Reveal>

          <Reveal delay={0.15} className="max-w-sm lg:pb-3">
            <p className="font-condensed text-lg uppercase leading-[1.6] tracking-[0.03em] text-ink/75">
              No disappearing for months and returning with a big reveal. You see working software at
              every stage, from the first call to the day it scales.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {chips.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-taupe px-4 py-2 font-condensed text-[11px] uppercase tracking-[0.16em] text-ink"
                >
                  {c}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {/* Steps, with the ribbon drawing itself behind them */}
      <RibbonTrack className="mx-auto mt-24 max-w-6xl md:mt-36">
        <div className="flex flex-col gap-24 md:gap-40">
          {processSteps.map((s, i) => {
            const Visual = processVisuals[i];
            const flip = i % 2 === 1;
            return (
              <div key={s.step} data-ribbon-stop className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
                <Reveal className={flip ? "md:order-2" : undefined}>
                  <article className="relative mx-auto w-full max-w-md rounded-[28px] border border-taupe-light bg-paper p-8 shadow-[0_40px_80px_-40px_rgba(54,10,22,0.45)] md:p-10">
                    <div className="flex items-start justify-between">
                      <span className="text-outline font-condensed text-7xl leading-none">{s.step}</span>
                      <span className="font-condensed text-[11px] uppercase tracking-[0.2em] text-taupe-dark">
                        Stage {s.step} / {String(processSteps.length).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="mt-6 font-condensed text-5xl uppercase leading-none text-burgundy">{s.title}</h3>
                    <p className="mt-4 leading-relaxed text-ink/70">{s.text}</p>
                    <ul className="mt-6 flex flex-wrap gap-2">
                      {s.tags.map((t) => (
                        <li key={t} className="rounded-full bg-cream px-3 py-1.5 text-xs text-taupe-dark">
                          {t}
                        </li>
                      ))}
                    </ul>
                  </article>
                </Reveal>
                <Reveal delay={0.1} className={flip ? "md:order-1" : undefined}>
                  <VisualFrame caption={`${s.step} · ${s.title}`}>
                    <Visual />
                  </VisualFrame>
                </Reveal>
              </div>
            );
          })}
        </div>

        {/* Outro — the ribbon lands just above the headline */}
        <div className="relative pb-24 pt-28 text-center md:pb-32 md:pt-44">
          <span data-ribbon-end className="absolute left-1/2 top-10 md:top-16" />
          <Reveal>
            <h2 className="mx-auto max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-[-0.025em] text-burgundy md:text-6xl">
              Working software arrives <span className="text-shine">throughout</span> the process
            </h2>
            <Link
              href="/contact"
              className="group mt-8 inline-flex items-center gap-2 text-sm font-medium text-burgundy transition-colors hover:text-burgundy-light"
            >
              Start a project
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
            </Link>
          </Reveal>
        </div>
      </RibbonTrack>
    </section>
  );
}

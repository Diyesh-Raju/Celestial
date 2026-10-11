import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { portfolio } from "@/lib/data";
import { Reveal, SectionLabel } from "./Reveal";

/* `blend` (home page): fades in from the dark reviews section above and out into
   the dark promise photo below, so the light block sits between them seamlessly */
export function Work({ blend = false }: { blend?: boolean }) {
  return (
    <section
      id="work"
      className={`relative scroll-mt-24 overflow-hidden px-6 ${
        blend ? "bg-paper pb-[16rem] pt-[16rem] md:pb-[22rem] md:pt-[22rem]" : "py-24"
      }`}
    >
      {blend && (
        <>
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-48 md:h-72"
            style={{
              background:
                "linear-gradient(to bottom, #0b0d15 0%, #14151d 12%, #35353a 28%, #6c6a6b 46%, #a49f9c 63%, #d1cac4 80%, #e8e0d8 100%)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-48 md:h-72"
            style={{
              background:
                "linear-gradient(to bottom, #e8e0d8 0%, #e0d8d1 12%, #c1bab4 28%, #8f8985 46%, #5c5856 63%, #322f30 80%, #1d1b1c 100%)",
            }}
          />
          {/* Soft burgundy glow, as in the light sections near the top of the page */}
          <div className="pointer-events-none absolute -right-40 top-1/3 h-[420px] w-[620px] rounded-full bg-burgundy/[0.05] blur-[120px]" />
        </>
      )}
      <div className="relative mx-auto max-w-6xl">
        <Reveal className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <SectionLabel tone="burgundy">Our portfolio</SectionLabel>
            <h2 className="font-display font-semibold tracking-[-0.025em] mt-4 text-4xl md:text-6xl text-burgundy leading-[1.05]">
              Recent <span className="text-shine">client builds</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-taupe-dark">
            Custom designs engineered for minimal aesthetic and maximal business outcomes.
          </p>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2">
          {portfolio.map((item, i) => (
            <Reveal key={item.url} delay={(i % 2) * 0.1}>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="group block overflow-hidden rounded-3xl border border-taupe-light bg-paper shadow-[0_20px_50px_-30px_rgba(36,27,28,0.35)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-25px_rgba(54,10,22,0.4)]"
              >
                {/* Browser-window preview */}
                <div className={`relative overflow-hidden border-b border-ink/[0.06] bg-gradient-to-br ${item.gradient}`}>
                  <div className="relative z-10 flex items-center gap-1.5 border-b border-taupe-light bg-cream px-4 py-3">
                    <span className="h-2 w-2 rounded-full bg-ink/20" />
                    <span className="h-2 w-2 rounded-full bg-ink/20" />
                    <span className="h-2 w-2 rounded-full bg-ink/20" />
                    <span className="ml-3 truncate text-[10px] text-taupe-dark">
                      {item.url.replace(/^https:\/\//, "").replace(/\/$/, "")}
                    </span>
                  </div>
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={item.image}
                      alt={`${item.name} website homepage`}
                      fill
                      sizes="(min-width: 768px) 560px, 100vw"
                      className="object-cover object-top transition duration-700 group-hover:scale-[1.04]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 p-6">
                  <div>
                    <h3 className="font-display font-semibold tracking-[-0.015em] text-xl text-burgundy">{item.name}</h3>
                    <span className="text-xs text-taupe-dark">{item.tag}</span>
                  </div>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-ink/10 text-ink/65 transition group-hover:rotate-45 group-hover:border-burgundy group-hover:bg-burgundy group-hover:text-white">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

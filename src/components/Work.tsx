"use client";

import Image from "next/image";
import { useRef, useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { portfolio } from "@/lib/data";
import { Reveal, SectionLabel } from "./Reveal";

/* Slides stack on top of each other; each one wipes up from the bottom when it
   becomes current (and back down when you step past it in reverse), with the
   background name trailing the screenshot by a beat. */
const SHOWN = "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)";
const HIDDEN = "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)";
const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

const pad = (n: number) => String(n).padStart(2, "0");
const host = (url: string) => url.replace(/^https:\/\//, "").replace(/\/$/, "");

/* `blend` (home page): fades in from the dark reviews section above and out into
   the dark promise photo below, so the light block sits between them seamlessly */
export function Work({ blend = false }: { blend?: boolean }) {
  const [current, setCurrent] = useState(0);
  const touchX = useRef<number | null>(null);
  const total = portfolio.length;
  const item = portfolio[current];

  const go = (i: number) => setCurrent(Math.max(0, Math.min(total - 1, i)));

  return (
    <section
      id="work"
      className={`relative scroll-mt-24 overflow-hidden px-3 md:px-6 ${
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
      <div className="relative mx-auto max-w-6xl px-3 md:px-0">
        <Reveal className="mb-12 flex flex-col justify-between gap-6 md:mb-16 md:flex-row md:items-end">
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
      </div>

      <Reveal className="relative mx-auto max-w-[1600px]">
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Client builds"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") go(current + 1);
            else if (e.key === "ArrowLeft") go(current - 1);
            else return;
            e.preventDefault();
          }}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) > 50) go(current + (dx < 0 ? 1 : -1));
          }}
          className="relative isolate flex h-[min(92svh,860px)] min-h-[600px] flex-col overflow-hidden rounded-[2rem] shadow-[0_40px_90px_-50px_rgba(36,27,28,0.6)] outline-none focus-visible:ring-2 focus-visible:ring-burgundy/50 md:rounded-[2.5rem]"
          style={{ color: item.ink, transition: `color 0.8s ${EASE}` } as CSSProperties}
        >
          {/* Background layers: slide colour + drifting name */}
          {portfolio.map((p, i) => (
            <div
              key={p.url}
              aria-hidden
              className="absolute inset-0 flex items-center overflow-hidden"
              style={{
                zIndex: i,
                background: p.bg,
                clipPath: i <= current ? SHOWN : HIDDEN,
                transition: `clip-path 1s ${EASE} 0.3s`,
              }}
            >
              <div
                className="flex w-max animate-marquee whitespace-nowrap font-display text-[clamp(5rem,17vw,15rem)] font-medium uppercase leading-none tracking-[-0.03em] opacity-90"
                style={{ color: p.ink, animationDuration: "45s" }}
              >
                {[0, 1].map((half) => (
                  <span key={half} className="flex">
                    {[0, 1, 2].map((n) => (
                      <span key={n} className="px-[0.3em]">
                        {p.name}
                      </span>
                    ))}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {/* Counter */}
          <div className="relative z-10 flex items-center justify-between px-6 pt-6 text-xs uppercase tracking-[0.2em] md:px-10 md:pt-8">
            <span className="font-display tabular-nums">
              {pad(current + 1)} <span className="opacity-50">/ {pad(total)}</span>
            </span>
            <span className="hidden opacity-70 sm:inline">{item.tag}</span>
          </div>

          {/* Screenshot + caption */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4">
            <div className="w-[min(640px,100%)] overflow-hidden rounded-2xl bg-paper shadow-[0_40px_80px_-30px_rgba(0,0,0,0.55)] md:w-[min(640px,52vw)]">
              <div className="flex items-center gap-1.5 border-b border-taupe-light bg-cream px-4 py-2.5">
                <span className="h-2 w-2 rounded-full bg-ink/20" />
                <span className="h-2 w-2 rounded-full bg-ink/20" />
                <span className="h-2 w-2 rounded-full bg-ink/20" />
                <span className="ml-3 truncate text-[10px] text-taupe-dark">{host(item.url)}</span>
              </div>
              <div className="relative aspect-[16/10] overflow-hidden bg-ink">
                {portfolio.map((p, i) => (
                  <div
                    key={p.url}
                    className="absolute inset-0 overflow-hidden"
                    style={{
                      zIndex: i,
                      clipPath: i <= current ? SHOWN : HIDDEN,
                      transition: `clip-path 1s ${EASE}`,
                    }}
                  >
                    <Image
                      src={p.image}
                      alt={`${p.name} website homepage`}
                      fill
                      sizes="(min-width: 768px) 640px, 92vw"
                      className="object-cover object-top"
                      style={{
                        transform: i <= current ? "scale(1)" : "scale(1.15)",
                        transition: `transform 1.4s ${EASE}`,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div
              key={current}
              aria-live="polite"
              className="mt-6 flex flex-col items-center text-center md:mt-8"
              style={{ animation: `rise 0.8s ${EASE} both` }}
            >
              <h3 className="font-display text-2xl font-semibold tracking-[-0.015em] md:text-3xl">{item.name}</h3>
              <span className="mt-1.5 text-xs opacity-70 sm:hidden">{item.tag}</span>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="group mt-5 inline-flex items-center gap-2 rounded-full py-3 pl-6 pr-3 text-sm font-medium transition hover:-translate-y-0.5"
                style={{ background: item.ink, color: item.bg }}
              >
                Visit website
                <span
                  className="grid h-7 w-7 place-items-center rounded-full transition group-hover:rotate-45"
                  style={{ background: item.bg, color: item.ink }}
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </a>
            </div>
          </div>

          {/* Controls: progress lines + arrows */}
          <div className="relative z-10 flex items-center justify-between gap-6 px-6 pb-6 md:px-10 md:pb-8">
            <div className="flex flex-1 items-center gap-2">
              {portfolio.map((p, i) => (
                <button
                  key={p.url}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Show ${p.name}`}
                  aria-current={i === current}
                  className="group/line relative h-6 max-w-20 flex-1 cursor-pointer"
                >
                  <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-current opacity-25 transition group-hover/line:opacity-50" />
                  <span
                    className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-current"
                    style={{ width: i <= current ? "100%" : "0%", transition: `width 0.8s ${EASE}` }}
                  />
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {[
                { dir: -1, label: "Previous project", Icon: ArrowLeft, disabled: current === 0 },
                { dir: 1, label: "Next project", Icon: ArrowRight, disabled: current === total - 1 },
              ].map(({ dir, label, Icon, disabled }) => (
                <button
                  key={dir}
                  type="button"
                  onClick={() => go(current + dir)}
                  disabled={disabled}
                  aria-label={label}
                  className="grid h-12 w-12 cursor-pointer place-items-center rounded-full border border-current/30 transition hover:bg-current/10 disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

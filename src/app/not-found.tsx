import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LogoMark } from "@/components/Navbar";
import { RequestedPath } from "@/components/not-found/RequestedPath";
import { navLinks } from "@/lib/data";

export const metadata: Metadata = {
  title: "Page not found — Celestial Developers",
  description: "This page drifted out of orbit. Head back home or get in touch.",
};

// Fixed positions so server and client draw the same sky. Stars stay in the top
// and bottom bands, clear of the text; `wide` ones sit beside it on md+ only.
const stars = [
  { x: 7, y: 14, s: 2, d: 0 },
  { x: 19, y: 15, s: 1, d: 2.1 },
  { x: 84, y: 13, s: 2, d: 0.3 },
  { x: 94, y: 15, s: 1, d: 0.8 },
  { x: 11, y: 95, s: 2, d: 0.6 },
  { x: 38, y: 97, s: 1, d: 1.6 },
  { x: 64, y: 95, s: 1, d: 2.4 },
  { x: 89, y: 93, s: 1, d: 1.4 },
  { x: 6, y: 46, s: 1, d: 2.6, wide: true },
  { x: 13, y: 70, s: 1, d: 1.2, wide: true },
  { x: 87, y: 34, s: 1, d: 1, wide: true },
  { x: 93, y: 60, s: 2, d: 1.9, wide: true },
  { x: 82, y: 80, s: 1, d: 2.8, wide: true },
];

const quickLinks = navLinks.filter((l) => l.href !== "/#top");

/* The "0" of 404: the logo as a planet with a lone satellite circling it */
function Orbit() {
  return (
    <span aria-hidden className="relative mx-[0.06em] inline-block aspect-square w-[0.74em] shrink-0">
      <span className="absolute -inset-[8%] rounded-full border border-paper/[0.07]" />
      <span className="absolute inset-0 animate-spin-slower rounded-full border border-dashed border-paper/20" />
      <span className="absolute inset-[14%] animate-spin-slow rounded-full border border-paper/25">
        <span className="absolute left-1/2 top-0 h-[0.06em] w-[0.06em] -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose shadow-[0_0_0.12em_#c4798b]" />
      </span>
      <span className="absolute inset-[30%] rounded-full bg-gradient-to-tr from-[#8A2846]/50 to-taupe/40 blur-2xl" />
      <span className="absolute inset-[32%] rounded-full bg-gradient-to-tr from-burgundy via-[#8A2846] to-taupe opacity-90" />
      <span className="absolute inset-[32%] rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(232,224,216,0.4),transparent_55%)]" />
      <LogoMark className="absolute inset-[41%] text-paper" />
    </span>
  );
}

export default function NotFound() {
  return (
    <main
      className="relative isolate flex min-h-svh flex-col overflow-hidden px-5 pb-16 pt-32 text-paper md:pt-36"
      style={{ background: "radial-gradient(60% 50% at 50% 42%, #4A0F22 0%, transparent 70%), #14040A" }}
    >
      {/* Backdrop: dot grid fading out, twinkling stars, a low taupe glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(rgba(232,224,216,0.07)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,#000_20%,transparent_70%)]" />
      {stars.map((s) => (
        <span
          key={`${s.x}-${s.y}`}
          aria-hidden
          className={`pointer-events-none absolute -z-10 animate-pulse rounded-full bg-paper/70 ${s.wide ? "hidden md:block" : ""}`}
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s * 2, height: s.s * 2, animationDelay: `${s.d}s` }}
        />
      ))}
      <div className="pointer-events-none absolute -bottom-40 left-1/2 -z-10 h-[360px] w-[900px] -translate-x-1/2 rounded-full bg-taupe/15 blur-[120px]" />

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center text-center">
        <span className="rise inline-flex h-8 items-center rounded-full border border-paper/20 bg-paper/[0.06] px-4 text-[12px] font-medium uppercase tracking-[0.14em] text-paper/80 backdrop-blur-md">
          Error 404 · Page not found
        </span>

        <p
          aria-hidden
          className="rise mt-6 flex items-center justify-center font-condensed text-[clamp(8rem,36vw,17rem)] leading-none [--delay:100ms]"
        >
          <span>4</span>
          <Orbit />
          <span className="text-transparent [-webkit-text-stroke:max(1.5px,0.012em)_var(--color-paper)]">4</span>
        </p>

        <h1 className="rise mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.025em] [--delay:160ms] md:text-6xl">
          Lost in <span className="text-shine-dark">orbit.</span>
        </h1>
        <p className="rise mt-5 max-w-md text-base leading-relaxed text-paper/70 [--delay:200ms] md:text-lg">
          The page you’re looking for has drifted off our map. It may have moved, or the link might have a typo.
        </p>

        <RequestedPath />

        <div className="rise mt-10 flex flex-wrap justify-center gap-3 [--delay:300ms]">
          <Link
            href="/"
            className="group/btn inline-flex h-12 items-center gap-2 rounded-full bg-paper px-6 text-[15px] font-semibold text-burgundy transition hover:bg-cream active:scale-[0.97]"
          >
            Back to home
            <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-12 items-center rounded-full border border-paper/25 bg-paper/[0.07] px-6 text-[15px] font-semibold text-paper backdrop-blur-md transition hover:border-paper/40 hover:bg-paper/[0.13] active:scale-[0.97]"
          >
            Contact us
          </Link>
        </div>

        <nav
          aria-label="Popular pages"
          className="rise mt-12 flex flex-wrap justify-center gap-x-6 gap-y-3 text-[11px] uppercase tracking-[0.2em] text-paper/45 [--delay:360ms]"
        >
          {quickLinks.map((l) => (
            <Link key={l.href} href={l.href} className="transition hover:text-paper">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}

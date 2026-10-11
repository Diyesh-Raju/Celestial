import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { Work } from "@/components/Work";

export const metadata: Metadata = {
  title: "Portfolio — Celestial Corporation",
  description:
    "Recent client builds from Celestial Corporation: custom websites engineered for minimal aesthetic and maximal business outcomes.",
};

function PortfolioHero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden rounded-b-[2.5rem] bg-burgundy-rich px-6 pb-28 pt-44 text-white md:rounded-b-[4rem] md:pb-36 md:pt-52"
    >
      {/* Backdrop: dot grid and glows */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(232,224,216,0.08)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,#000,transparent)]" />
      <div className="pointer-events-none absolute -left-40 top-0 h-[500px] w-[700px] rounded-full bg-burgundy-deep/70 blur-[120px]" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-[400px] w-[600px] rounded-full bg-taupe/25 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl">
        <Reveal>
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-taupe-light">
            <span className="h-px w-6 bg-taupe-light" />
            Our portfolio
          </span>
          <h1 className="font-display font-semibold tracking-[-0.025em] mt-6 max-w-4xl text-5xl leading-[1.02] text-white md:text-7xl">
            Work we’re <span className="text-taupe-light">proud of.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg font-light leading-relaxed text-white/75">
            A selection of websites we’ve designed and built for our clients.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <main>
        <PortfolioHero />
        <Work />
      </main>
      <Footer />
    </div>
  );
}

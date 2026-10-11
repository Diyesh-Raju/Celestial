import Image from "next/image";
import { Reveal } from "./Reveal";

const strip = ["Web Design", "Top-tier SEO", "CRM Systems", "Meta & Google Ads", "Automation", "Custom Software"];

function Spark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0Z" fill="currentColor" />
    </svg>
  );
}

export function Manifesto() {
  return (
    <section aria-label="Our promise" className="relative">
      {/* Full-bleed photo with the promise set over its dark left side.
          Photo: Nikita Kachanovsky on Unsplash (unsplash.com/photos/OVbeSXRk_9E) */}
      <div className="relative isolate flex min-h-[560px] items-center overflow-hidden px-6 py-24 md:min-h-[680px]">
        <Image
          src="/quote/workspace.jpg"
          alt=""
          fill
          sizes="100vw"
          className="-z-20 object-cover object-[70%_center]"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-charcoal-deep/90 via-charcoal-deep/55 to-charcoal-deep/10" />
        {/* On phones the text sits over the lit monitor, so darken further */}
        <div className="absolute inset-0 -z-10 bg-charcoal-deep/50 md:hidden" />
        {/* Blend out of the work section above (which fades down to charcoal-deep) */}
        <div className="absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-charcoal-deep to-transparent" />

        <Reveal className="relative mx-auto w-full max-w-6xl">
          <figure className="max-w-xl">
            <blockquote className="font-display text-3xl font-light leading-[1.2] tracking-[-0.02em] text-paper md:text-5xl md:leading-[1.15]">
              &ldquo;We don&rsquo;t just build websites. We build the <span className="text-shine-dark">connected
              systems</span> your business runs on, and keep them sharp long after launch.&rdquo;
            </blockquote>
            <figcaption className="mt-8 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-paper/60">
              <span className="h-px w-8 bg-rose" />
              Celestial Co. · Our promise
            </figcaption>
          </figure>
        </Reveal>
      </div>

      {/* Light strip of disciplines, scrolling */}
      <div className="mask-x overflow-hidden border-b border-ink/[0.06] bg-paper py-8 md:py-10">
        <div className="flex w-max animate-marquee">
          {[0, 1, 2, 3].map((copy) => (
            <ul key={copy} aria-hidden={copy > 0 || undefined} className="flex shrink-0 items-center">
              {strip.map((item) => (
                <li key={item} className="flex items-center whitespace-nowrap">
                  <Spark className="mx-8 h-4 w-4 text-burgundy md:mx-12 md:h-5 md:w-5" />
                  <span className="font-display text-3xl font-light tracking-[-0.02em] text-ink md:text-5xl">{item}</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}

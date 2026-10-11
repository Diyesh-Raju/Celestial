import Image from "next/image";
import type { CSSProperties } from "react";
import { Quote, Star } from "lucide-react";
import { Reveal } from "./Reveal";

// TODO: placeholder quotes — swap in real client reviews (with their permission) before launch.
const reviews = [
  {
    quote:
      "Our old site looked dated and never brought in a single enquiry. Celestial rebuilt it from scratch, and the leads started landing in our CRM the same week.",
    name: "Karthik N.",
    role: "Restaurant Owner, Bengaluru",
  },
  {
    quote:
      "We were running ads, a website and a spreadsheet that never talked to each other. Now it's one system, and I can see exactly which campaign brought in which patient.",
    name: "Dr. Meera P.",
    role: "Dental Practice, Pune",
  },
  {
    quote:
      "The animations feel effortless and the site loads instantly. Within two months we were ranking on the first page for the searches that actually matter to us.",
    name: "Ananya R.",
    role: "Clinic Owner, Chennai",
  },
  {
    quote:
      "They didn't just hand over a website. They replaced the tools slowing us down and stayed on to keep improving things after launch.",
    name: "Vikram D.",
    role: "Founder, D2C Startup",
  },
];

/* Each card leans slightly in 3D and settles flat on hover */
const tilts = [
  "perspective(1400px) rotateX(2deg) rotateY(-3deg) rotate(-0.6deg)",
  "perspective(1400px) rotateX(-2deg) rotateY(3deg) rotate(0.5deg)",
  "perspective(1400px) rotateX(-1.5deg) rotateY(-2.5deg) rotate(0.4deg)",
  "perspective(1400px) rotateX(2deg) rotateY(2.5deg) rotate(-0.5deg)",
];

const initials = (name: string) =>
  name
    .replace(/^Dr\.\s*/, "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

function Stars({ className = "" }: { className?: string }) {
  return (
    <span className={`flex gap-1 ${className}`} aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className="h-4 w-4 fill-rose text-rose" strokeWidth={1.5} />
      ))}
    </span>
  );
}

export function Reviews() {
  return (
    <section
      id="reviews"
      className="relative isolate scroll-mt-24 overflow-hidden bg-[#020611] px-6 py-24 text-paper md:py-36"
    >
      {/* Full-bleed circuit background; the circuit sits on the right, leaving the left calm for the heading */}
      {/* Vector artwork (public/reviews/circuit.svg), so it stays sharp at 4K and beyond */}
      <Image src="/reviews/circuit.svg" alt="" fill unoptimized className="-z-20 object-cover object-right" />
      <div className="absolute inset-0 -z-10 bg-charcoal-deep/25" />
      {/* Charcoal from the section above fading into the image */}
      <div className="absolute inset-x-0 top-0 -z-10 h-48 bg-gradient-to-b from-charcoal to-transparent md:h-64" />
      {/* Settle the circuit into one flat dark tone for the light work section below to fade out of */}
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-[#0b0d15] to-transparent md:h-56" />

      <Reveal className="relative mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-rose">
              <span className="h-px w-6 bg-rose" />
              In their words
            </span>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.025em] text-paper md:text-6xl">
              What our <span className="text-shine-dark">clients</span> say
            </h2>
          </div>
          <div className="flex items-center gap-3" aria-label="Rated 5.0 out of 5">
            <Stars />
            <span className="rounded-full border border-paper/15 bg-paper/[0.06] px-4 py-1.5 text-sm text-paper/80 backdrop-blur-md">
              5.0 / 5
            </span>
          </div>
        </div>

        <ul className="mt-12 grid gap-5 md:mt-14 md:grid-cols-2 md:gap-6">
          {reviews.map((r, i) => (
            <li
              key={r.name}
              style={{ "--tilt": tilts[i % tilts.length] } as CSSProperties}
              className="relative flex flex-col justify-between gap-8 rounded-[22px] border border-paper/15 bg-gradient-to-br from-paper/[0.09] to-paper/[0.02] p-6 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(232,224,216,0.12)] backdrop-blur-md transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] [transform:var(--tilt)] hover:[transform:none] motion-reduce:transition-none md:p-8"
            >
              <Quote
                aria-hidden
                className="absolute right-6 top-6 h-6 w-6 fill-paper/15 text-paper/30 md:right-8 md:top-7"
                strokeWidth={1.25}
              />
              <blockquote className="pr-8 text-[15px] leading-relaxed text-paper/85 md:text-base">
                {r.quote}
              </blockquote>
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-paper/20 bg-charcoal-deep/60 text-xs font-semibold tracking-wide text-paper/90">
                  {initials(r.name)}
                </span>
                <span className="leading-tight">
                  <span className="block text-sm font-semibold text-paper">{r.name}</span>
                  <span className="block text-xs text-paper/50">{r.role}</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}

import { marqueeRows } from "@/lib/data";

function MarqueeRow({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  // Four copies so the row always overfills wide screens and the -50% translate loops
  // seamlessly; only the first copy is exposed to screen readers.
  return (
    <div className="mask-x overflow-hidden">
      <div className={`flex w-max ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}>
        {[0, 1, 2, 3].map((copy) => (
          <ul key={copy} aria-hidden={copy > 0 || undefined} className="flex shrink-0 items-center">
            {items.map((item, i) => (
              <li
                key={item}
                className="flex items-center whitespace-nowrap text-xs uppercase tracking-[0.25em] text-taupe-dark sm:text-sm"
              >
                <span className="px-6 sm:px-8">{item}</span>
                <span className={`h-1 w-1 rounded-full ${i % 2 ? "bg-taupe" : "bg-burgundy"}`} />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

export function Marquee() {
  return (
    <section
      aria-label="The Celestial Method"
      className="relative overflow-hidden border-y border-ink/[0.06] bg-cream/60 py-8 sm:py-10"
    >
      <p className="mb-6 text-center text-[11px] font-medium uppercase tracking-[0.35em] text-burgundy sm:mb-8">
        The Celestial Method
      </p>
      <div className="flex flex-col gap-5 sm:gap-6">
        <MarqueeRow items={marqueeRows[0]} />
        <MarqueeRow items={marqueeRows[1]} reverse />
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, Check, Mail, Plus, X } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Reveal, SectionLabel } from "@/components/Reveal";
import { ConnectVisual, CrmVisual, GrowVisual, MonitorVisual, WebVisual } from "@/components/services/Visuals";
import { CONTACT, SITE_URL, productHref, products, type ProductSlug } from "@/lib/data";
import { productContent } from "@/lib/products";

// One page per product (src/app/services/<slug>/page.tsx): a dark hero with the same
// drawing as the product's home page card, three promises over the hero's edge, what's
// included, before and after, how we deliver it, questions, the other products, and a
// closing call to action.

// Same light/dark as each product's card on the home page
const tones: Record<ProductSlug, "dark" | "light"> = {
  websites: "dark",
  crm: "light",
  automation: "light",
  growth: "dark",
  "cto-support": "dark",
};

const product = (slug: ProductSlug) => products.find((p) => p.slug === slug)!;
// For page titles and structured data: the display titles use a non-breaking hyphen
const plain = (s: string) => s.replace(/‑/g, "-");

export function productMetadata(slug: ProductSlug): Metadata {
  return {
    title: `${plain(product(slug).title)} — Celestial Developers`,
    description: productContent[slug].description,
  };
}

const btn = {
  light:
    "group/btn inline-flex items-center gap-2 rounded-full bg-paper px-6 py-3.5 text-sm font-medium text-burgundy transition-colors hover:bg-taupe-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper",
  ghost:
    "group/btn inline-flex items-center gap-2.5 rounded-full border border-paper/25 px-6 py-3.5 text-sm font-medium text-paper transition-colors hover:border-paper/50 hover:bg-paper/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper",
};

function Ctas() {
  return (
    <div className="flex flex-wrap gap-3">
      <Link href="/contact" className={btn.light}>
        Start a project
        <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" strokeWidth={1.75} />
      </Link>
      <a href={CONTACT.walkthrough} target="_blank" rel="noopener noreferrer" className={btn.ghost}>
        <CalendarDays className="h-4 w-4 text-rose" strokeWidth={1.75} />
        Book a walkthrough
        <ArrowUpRight
          className="h-4 w-4 text-paper/60 transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5"
          strokeWidth={1.75}
        />
      </a>
    </div>
  );
}

/** The product's drawing from its home page card, framed in the card's own colours */
function HeroVisual({ slug }: { slug: ProductSlug }) {
  const { num, verb, Icon } = productContent[slug];
  const dark = tones[slug] === "dark";
  return (
    <div className="group relative">
      <div aria-hidden className="pointer-events-none absolute -inset-8 rounded-full bg-burgundy-light/35 blur-[90px]" />
      <div
        className={`relative flex flex-col gap-6 overflow-hidden rounded-[2.25rem] p-6 sm:p-8 lg:rounded-[2.75rem] ${
          dark
            ? "border border-paper/10 bg-burgundy-deep/70 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.8)]"
            : "border border-taupe-light bg-[#efe9e3] shadow-[0_40px_80px_-40px_rgba(20,3,8,0.85)]"
        } ${slug === "growth" ? "pb-0!" : ""}`}
      >
        <div className="flex items-center justify-between">
          <span className={`text-[10px] uppercase tracking-[0.2em] ${dark ? "text-paper/55" : "text-taupe-dark"}`}>
            {num} · {verb}
          </span>
          <span
            className={`grid h-10 w-10 place-items-center rounded-full ${dark ? "bg-paper/10 text-rose" : "bg-paper text-burgundy"}`}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </span>
        </div>
        {slug === "websites" && <WebVisual />}
        {slug === "crm" && (
          <div className="flex h-72 flex-col sm:h-80">
            <CrmVisual />
          </div>
        )}
        {slug === "automation" && <ConnectVisual />}
        {slug === "growth" && (
          <div className="-mx-6 sm:-mx-8">
            <GrowVisual />
          </div>
        )}
        {slug === "cto-support" && <MonitorVisual />}
      </div>
    </div>
  );
}

function Hero({ slug }: { slug: ProductSlug }) {
  const c = productContent[slug];
  return (
    <section
      id="top"
      className="relative overflow-hidden rounded-b-[2.5rem] bg-burgundy-rich px-6 pb-40 pt-32 text-paper md:rounded-b-[4rem] md:pb-48 md:pt-44"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(232,224,216,0.08)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,#000,transparent)]" />
      <div className="pointer-events-none absolute -left-40 top-0 h-[500px] w-[700px] rounded-full bg-burgundy-deep/70 blur-[120px]" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-[400px] w-[600px] rounded-full bg-taupe/20 blur-[120px]" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.08fr_1fr] lg:gap-16">
        <Reveal>
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs uppercase tracking-[0.2em] text-taupe-light">
              <li className="flex items-center gap-2">
                <span aria-hidden className="h-px w-6 bg-taupe-light" />
                <Link href="/#services" className="transition-colors hover:text-paper">
                  Products &amp; services
                </Link>
              </li>
              <li aria-hidden className="text-taupe-light/50">
                /
              </li>
              <li aria-current="page" className="text-paper/90">
                {product(slug).title}
              </li>
            </ol>
          </nav>
          <h1 className="mt-6 text-balance font-display text-[2.75rem] font-semibold leading-[1.03] tracking-[-0.03em] sm:text-5xl md:text-6xl xl:text-[4.25rem]">
            {c.headline[0]} <span className="text-shine-dark">{c.headline[1]}</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg font-light leading-relaxed text-paper/75">{c.lead}</p>
          <div className="mt-10">
            <Ctas />
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <HeroVisual slug={slug} />
        </Reveal>
      </div>
    </section>
  );
}

/** Three promises, lifted over the hero's bottom edge */
function Highlights({ slug }: { slug: ProductSlug }) {
  return (
    <section className="relative z-10 -mt-24 px-6 md:-mt-28">
      <h2 className="sr-only">At a glance</h2>
      <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3 md:gap-6">
        {productContent[slug].highlights.map((h, i) => (
          <Reveal key={h.title} delay={i * 0.08}>
            <div className="h-full rounded-3xl border border-taupe-light bg-paper p-7 shadow-[0_25px_60px_-25px_rgba(54,10,22,0.35)]">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-burgundy text-paper">
                <Check className="h-4 w-4" strokeWidth={2} />
              </span>
              <h3 className="mt-6 font-display text-xl font-semibold tracking-[-0.015em] text-burgundy">{h.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink/65">{h.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Included({ slug }: { slug: ProductSlug }) {
  return (
    <section className="relative overflow-clip px-6 py-24 md:py-32">
      <div className="pointer-events-none absolute -right-40 top-40 h-[460px] w-[640px] rounded-full bg-burgundy/[0.05] blur-[120px]" />
      <div className="relative mx-auto max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:gap-14">
          <Reveal>
            <SectionLabel>What&apos;s included</SectionLabel>
            <h2 className="mt-5 text-balance font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-burgundy md:text-6xl">
              Everything it takes, <span className="text-shine">built in.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-md text-ink/65 lg:pb-2">
              Take the whole package or start with the piece you need most. Each part is built to connect to the
              rest, so nothing you add later becomes another island.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 md:mt-20 lg:grid-cols-3 lg:gap-6">
          {productContent[slug].included.map((item, i) => (
            <Reveal key={item.title} delay={(i % 3) * 0.08} className="flex">
              <article className="flex w-full flex-col rounded-[1.75rem] border border-taupe-light bg-[#efe9e3] p-7 shadow-[0_30px_60px_-50px_rgba(54,10,22,0.35)] transition-[translate,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_40px_70px_-45px_rgba(54,10,22,0.4)] lg:p-8">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-paper text-burgundy">
                  <item.Icon className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <h3 className="mt-8 font-display text-xl font-semibold tracking-[-0.015em] text-ink">{item.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink/65">{item.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Before and after: side by side from md up, stacked in pairs on phones */
function Shift({ slug }: { slug: ProductSlug }) {
  return (
    <section className="px-6 pb-24 md:pb-32">
      <div className="mx-auto max-w-6xl">
        <Reveal className="text-center">
          <SectionLabel>The difference</SectionLabel>
          <h2 className="mx-auto mt-5 max-w-3xl text-balance font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-burgundy md:text-6xl">
            What changes when it&apos;s <span className="text-shine">done right.</span>
          </h2>
        </Reveal>

        <Reveal className="mt-14 md:mt-20">
          <div className="overflow-hidden rounded-[2.25rem] border border-taupe-light shadow-[0_40px_80px_-50px_rgba(54,10,22,0.45)] lg:rounded-[2.75rem]">
            <div className="hidden md:grid md:grid-cols-2">
              <span className="bg-[#efe9e3] px-10 pb-2 pt-9 text-[11px] uppercase tracking-[0.2em] text-taupe-dark">Before</span>
              <span className="bg-burgundy-deep px-10 pb-2 pt-9 text-[11px] uppercase tracking-[0.2em] text-rose">With Celestial</span>
            </div>
            {productContent[slug].shift.map((s, i) => (
              <div key={s.before} className="grid md:grid-cols-2">
                <div
                  className={`flex items-start gap-4 bg-[#efe9e3] px-6 py-6 md:px-10 md:py-7 ${i > 0 ? "border-t border-taupe-light" : ""} ${i === 3 ? "md:pb-10" : ""}`}
                >
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-paper text-taupe-dark">
                    <X className="h-3.5 w-3.5" strokeWidth={2} />
                  </span>
                  <p className="text-[15px] leading-relaxed text-ink/60 md:text-base">
                    <span className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-taupe-dark md:hidden">Before</span>
                    {s.before}
                  </p>
                </div>
                <div
                  className={`flex items-start gap-4 bg-burgundy-deep px-6 py-6 text-paper md:px-10 md:py-7 ${i > 0 ? "md:border-t md:border-paper/10" : ""} ${i === 3 ? "md:pb-10" : ""}`}
                >
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-rose/20 text-rose">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </span>
                  <p className="text-[15px] font-medium leading-relaxed md:text-base">
                    <span className="mb-1 block text-[10px] font-normal uppercase tracking-[0.2em] text-rose md:hidden">With Celestial</span>
                    {s.after}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** How we deliver it: a timeline down the left on phones, across the top from lg up */
function Steps({ slug }: { slug: ProductSlug }) {
  const steps = productContent[slug].steps;
  return (
    <section className="border-t border-ink/[0.06] bg-cream/40 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:gap-14">
          <Reveal>
            <SectionLabel tone="burgundy">How we deliver it</SectionLabel>
            <h2 className="mt-5 text-balance font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-burgundy md:text-6xl">
              Four steps, <span className="text-shine">no surprises.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-md text-ink/65 lg:pb-2">
              A fixed scope and price before anything starts, and working results to review at every step. You always
              know where things stand.
            </p>
          </Reveal>
        </div>

        <div className="relative mt-14 md:mt-20">
          <span
            aria-hidden
            className="absolute inset-x-0 top-[7px] hidden h-px bg-gradient-to-r from-taupe/60 via-taupe/60 to-transparent lg:block"
          />
          <ol className="grid gap-12 lg:grid-cols-4 lg:gap-8">
            {steps.map((s, i) => (
              // On phones each step draws the line down to the next one's dot (gap-12 below it)
              <li
                key={s.title}
                className="relative pl-10 before:absolute before:-bottom-12 before:left-[7px] before:top-5 before:w-px before:bg-taupe/50 last:before:hidden lg:pl-0 lg:before:hidden"
              >
                <span
                  aria-hidden
                  className="absolute left-0 top-1 block h-[15px] w-[15px] rounded-full border-2 border-burgundy bg-paper lg:relative lg:top-0"
                />
                <Reveal delay={i * 0.08}>
                  <span className="block font-condensed text-6xl leading-none text-outline lg:mt-8">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 font-display text-xl font-semibold tracking-[-0.015em] text-burgundy">{s.title}</h3>
                  <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-ink/65">{s.text}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Questions({ slug }: { slug: ProductSlug }) {
  const p = product(slug);
  return (
    <section className="px-6 py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.45fr] lg:gap-16">
        <Reveal>
          <SectionLabel>Questions, answered</SectionLabel>
          <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-burgundy md:text-5xl">
            Before you <span className="text-shine">ask.</span>
          </h2>
          <p className="mt-6 max-w-sm text-ink/65">Something else on your mind? Ask us directly. A real person replies within one working day.</p>
          <a
            href={`mailto:${CONTACT.email}?subject=${encodeURIComponent(`Question about ${plain(p.title)}`)}`}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-taupe/40 bg-paper px-4 py-2 text-sm text-ink/80 transition hover:border-taupe hover:text-ink"
          >
            <Mail className="h-4 w-4 text-taupe-dark" strokeWidth={1.5} />
            {CONTACT.email}
          </a>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="border-t border-taupe-light">
            {productContent[slug].faqs.map((f, i) => (
              <details key={f.q} open={i === 0} className="group border-b border-taupe-light">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 font-display text-lg font-semibold tracking-[-0.01em] text-ink transition-colors hover:text-burgundy md:text-xl [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-taupe-light text-burgundy transition-[rotate,background-color,color,border-color] duration-300 group-open:rotate-45 group-open:border-burgundy group-open:bg-burgundy group-open:text-paper">
                    <Plus className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                </summary>
                <p className="max-w-2xl pb-7 pr-14 text-[15px] leading-relaxed text-ink/65">{f.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** The other products, in home page order */
function Related({ slug }: { slug: ProductSlug }) {
  const others = products.filter((p) => p.slug !== slug);
  return (
    <section className="border-t border-ink/[0.06] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:gap-14">
          <Reveal>
            <SectionLabel>One connected system</SectionLabel>
            <h2 className="mt-5 text-balance font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-burgundy md:text-6xl">
              Better together, <span className="text-shine">by design.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-md text-ink/65 lg:pb-2">
              Your website, CRM, automations and ads are built to plug into each other, so they work as one growth
              engine instead of four separate tools.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 md:mt-20 lg:grid-cols-4 lg:gap-5">
          {others.map((p, i) => {
            const c = productContent[p.slug];
            const dark = tones[p.slug] === "dark";
            return (
              <Reveal key={p.slug} delay={i * 0.06} className="flex">
                <Link
                  href={productHref(p.slug)}
                  className={`group relative flex min-h-56 w-full flex-col justify-between overflow-hidden rounded-[2rem] p-7 transition-[translate,box-shadow] duration-500 ease-out hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-burgundy ${
                    dark
                      ? "bg-burgundy-deep text-paper shadow-[0_40px_80px_-45px_rgba(54,10,22,0.75)] hover:shadow-[0_50px_90px_-45px_rgba(54,10,22,0.85)]"
                      : "border border-taupe-light bg-[#efe9e3] text-ink shadow-[0_40px_80px_-50px_rgba(54,10,22,0.3)] hover:shadow-[0_50px_90px_-50px_rgba(54,10,22,0.4)]"
                  }`}
                >
                  {dark && (
                    <span aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-burgundy-light/40 blur-[70px]" />
                  )}
                  <span className="relative flex items-center justify-between">
                    <span className={`text-[10px] uppercase tracking-[0.2em] ${dark ? "text-paper/55" : "text-taupe-dark"}`}>
                      {c.num} · {c.verb}
                    </span>
                    <span
                      className={`grid h-10 w-10 place-items-center rounded-full transition-colors duration-300 ${
                        dark ? "bg-paper/10 text-rose group-hover:bg-rose group-hover:text-burgundy-deep" : "bg-paper text-burgundy group-hover:bg-burgundy group-hover:text-paper"
                      }`}
                    >
                      <ArrowUpRight className="h-[18px] w-[18px] transition-transform duration-300 group-hover:rotate-45" strokeWidth={1.5} />
                    </span>
                  </span>
                  <span className="relative mt-10 block font-display text-2xl font-semibold leading-tight tracking-[-0.02em]">{p.title}</span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ClosingCta({ slug }: { slug: ProductSlug }) {
  const { cta } = productContent[slug];
  return (
    <section className="px-6 pb-24 md:pb-32">
      <Reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-burgundy-rich px-7 py-16 text-center text-paper md:rounded-[3.5rem] md:px-16 md:py-24">
        <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 h-[420px] w-[420px] rounded-full border border-paper/10" />
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-[260px] w-[260px] rounded-full border border-dashed border-paper/20" />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-40 h-[420px] w-[420px] rounded-full border border-paper/10" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-24 h-[260px] w-[260px] rounded-full border border-dashed border-paper/20" />
        <div className="relative flex flex-col items-center">
          <h2 className="max-w-3xl text-balance font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] md:text-6xl">
            {cta[0]} <span className="text-shine-dark">{cta[1]}</span>
          </h2>
          <p className="mt-6 max-w-lg text-paper/70">
            Tell us what you need. You&apos;ll get a fixed scope, timeline and price in writing before any work starts.
          </p>
          <div className="mt-10 flex justify-center">
            <Ctas />
          </div>
          <Link
            href="/#services"
            className="mt-10 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-paper/55 transition-colors hover:text-paper"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
            All products &amp; services
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

export function ProductPage({ slug }: { slug: ProductSlug }) {
  const p = product(slug);
  const url = `${SITE_URL}${productHref(slug)}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: plain(p.title),
      description: productContent[slug].description,
      url,
      provider: { "@type": "Organization", name: "Celestial Developers", url: SITE_URL },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Products & services", item: `${SITE_URL}/#services` },
        { "@type": "ListItem", position: 3, name: plain(p.title), item: url },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-paper text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <main>
        <Hero slug={slug} />
        <Highlights slug={slug} />
        <Included slug={slug} />
        <Shift slug={slug} />
        <Steps slug={slug} />
        <Questions slug={slug} />
        <Related slug={slug} />
        <ClosingCta slug={slug} />
      </main>
      <Footer />
    </div>
  );
}

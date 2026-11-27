import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, CalendarDays, Check, Mail, Plus, X } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Reveal, SectionLabel } from "@/components/Reveal";
import { CONTACT, SITE_URL, products, type ProductSlug } from "@/lib/data";
import { productContent } from "@/lib/products";
import { ProductNav } from "./ProductNav";
import { ConnectVisual, CrmVisual, GrowVisual, MonitorVisual, WebVisual } from "./Visuals";

// The products & services page (/services): a dark hero with an index of the five
// products, then one section per product (id = its slug, which the menu's product
// links jump to) with what's included, before and after, how we deliver it and
// questions, then a closing call to action. A bar of the five products pins under
// the header while you read (ProductNav.tsx).

// Same light/dark as each product's card on the home page
const tones: Record<ProductSlug, "dark" | "light"> = {
  websites: "dark",
  crm: "light",
  automation: "light",
  growth: "dark",
  "cto-support": "dark",
};

// For structured data and mail subjects: the display titles use a non-breaking hyphen
const plain = (s: string) => s.replace(/‑/g, "-");

export const SERVICES_DESCRIPTION =
  "Websites and e-commerce, custom CRMs, automation and integrations, Meta and Google ads, and managed tech and CTO support, built to work as one connected system.";

const btn = {
  light:
    "group/btn inline-flex items-center gap-2 rounded-full bg-paper px-6 py-3.5 text-sm font-medium text-burgundy transition-colors hover:bg-taupe-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper",
  ghost:
    "group/btn inline-flex items-center gap-2.5 rounded-full border border-paper/25 px-6 py-3.5 text-sm font-medium text-paper transition-colors hover:border-paper/50 hover:bg-paper/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper",
  solid:
    "group/btn inline-flex items-center gap-2 rounded-full bg-burgundy px-6 py-3.5 text-sm font-medium text-paper transition-colors hover:bg-burgundy-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy",
  outline:
    "inline-flex items-center gap-2 rounded-full border border-taupe/40 bg-paper px-5 py-3.5 text-sm text-ink/80 transition hover:border-taupe hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy",
};

/** Start a project and Book a walkthrough, on a dark surface */
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

function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden rounded-b-[2.5rem] bg-burgundy-rich px-6 pb-16 pt-32 text-paper md:rounded-b-[4rem] md:pb-24 md:pt-44"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(232,224,216,0.08)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,#000,transparent)]" />
      <div className="pointer-events-none absolute -left-40 top-0 h-[500px] w-[700px] rounded-full bg-burgundy-deep/70 blur-[120px]" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-[400px] w-[600px] rounded-full bg-taupe/20 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl">
        <Reveal className="max-w-4xl">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-taupe-light">
            <span aria-hidden className="h-px w-6 bg-taupe-light" />
            Products &amp; services
          </span>
          <h1 className="mt-6 text-balance font-display text-[2.75rem] font-semibold leading-[1.03] tracking-[-0.03em] sm:text-5xl md:text-6xl xl:text-[4.25rem]">
            Everything your business needs to lead, <span className="text-shine-dark">crafted under one roof.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg font-light leading-relaxed text-paper/75">
            Five products, built to work as one system. Start with the piece you need most and add the rest when
            you&apos;re ready: everything plugs into the same connected growth engine.
          </p>
          <div className="mt-10">
            <Ctas />
          </div>
        </Reveal>

        {/* Each card jumps to its product's section below */}
        <nav id="product-index" aria-label="Our products" className="mt-16 md:mt-20">
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
            {products.map((p, i) => {
              const c = productContent[p.slug];
              return (
                <li key={p.slug} className={`flex ${i === 4 ? "sm:col-span-2 lg:col-span-1" : ""}`}>
                  <Reveal delay={0.1 + i * 0.06} className="flex w-full">
                    <a
                      href={`#${p.slug}`}
                      className="group flex w-full flex-col justify-between gap-4 rounded-[1.75rem] border border-paper/10 bg-paper/[0.05] p-5 transition-[background-color,border-color,translate] duration-300 hover:-translate-y-1 hover:border-paper/25 hover:bg-paper/[0.09] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-paper sm:gap-8 sm:p-6 lg:min-h-48"
                    >
                      <span className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-paper/55">
                          {c.num} · {c.verb}
                        </span>
                        <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-paper/10 text-rose transition-colors duration-300 group-hover:bg-rose group-hover:text-burgundy-deep">
                          <c.Icon
                            aria-hidden
                            className="h-[18px] w-[18px] transition-[translate,opacity] duration-300 group-hover:translate-y-3 group-hover:opacity-0"
                            strokeWidth={1.5}
                          />
                          <ArrowDown
                            aria-hidden
                            className="absolute h-[18px] w-[18px] -translate-y-3 opacity-0 transition-[translate,opacity] duration-300 group-hover:translate-y-0 group-hover:opacity-100"
                            strokeWidth={1.5}
                          />
                        </span>
                      </span>
                      <span className="font-display text-xl font-semibold leading-tight tracking-[-0.02em]">{p.title}</span>
                    </a>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </section>
  );
}

/** The product's drawing from its home page card, framed in the card's own colours */
function VisualCard({ slug }: { slug: ProductSlug }) {
  const { num, verb, Icon } = productContent[slug];
  const dark = tones[slug] === "dark";
  return (
    <div className="group relative">
      <div
        aria-hidden
        className={`pointer-events-none absolute -inset-6 rounded-full blur-[80px] ${dark ? "bg-burgundy-light/25" : "bg-burgundy/[0.08]"}`}
      />
      <div
        className={`relative flex flex-col gap-6 overflow-hidden rounded-[2.25rem] p-6 sm:p-8 lg:rounded-[2.75rem] ${
          dark
            ? "bg-burgundy-deep shadow-[0_40px_80px_-40px_rgba(54,10,22,0.75)]"
            : "border border-taupe-light bg-[#efe9e3] shadow-[0_40px_80px_-50px_rgba(54,10,22,0.35)]"
        } ${slug === "growth" ? "bg-gradient-to-br from-burgundy to-burgundy-deep pb-0!" : ""}`}
      >
        <div className="flex items-center justify-between">
          <span className={`text-[10px] uppercase tracking-[0.2em] ${dark ? "text-paper/55" : "text-taupe-dark"}`}>
            {num} · {verb}
          </span>
          <span
            className={`grid h-10 w-10 place-items-center rounded-full ${dark ? "bg-paper/10 text-rose" : "bg-paper text-burgundy"}`}
          >
            <Icon aria-hidden className="h-[18px] w-[18px]" strokeWidth={1.5} />
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

/** A sub-heading inside a product's section, with an optional line of copy beside it */
function PartHeading({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end md:gap-10">
      <h3 className="font-display text-2xl font-semibold tracking-[-0.02em] text-burgundy md:text-[2rem]">{title}</h3>
      {children && <p className="max-w-md text-[15px] leading-relaxed text-ink/60">{children}</p>}
    </div>
  );
}

function ProductSection({ slug, index }: { slug: ProductSlug; index: number }) {
  const p = products.find((x) => x.slug === slug)!;
  const c = productContent[slug];
  return (
    // scroll-mt clears the fixed header and the product bar under it
    <section
      id={slug}
      aria-labelledby={`${slug}-title`}
      className={`scroll-mt-28 border-t border-ink/[0.06] px-6 py-20 md:py-28 ${index % 2 === 1 ? "bg-cream/40" : ""}`}
    >
      <div className="mx-auto max-w-6xl">
        {/* Intro: what it is and its three promises, beside its drawing */}
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <Reveal>
            <div className="flex items-center gap-4">
              <span aria-hidden className="font-condensed text-6xl leading-none text-outline md:text-7xl">
                {c.num}
              </span>
              <SectionLabel>{c.verb}</SectionLabel>
            </div>
            <h2
              id={`${slug}-title`}
              className="mt-6 text-balance font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-burgundy md:text-6xl"
            >
              {p.title}
            </h2>
            <p className="mt-5 text-balance font-display text-xl font-medium leading-snug tracking-[-0.01em] text-ink md:text-2xl">
              {c.headline[0]} <span className="text-shine">{c.headline[1]}</span>
            </p>
            <p className="mt-5 max-w-xl leading-relaxed text-ink/65">{c.lead}</p>
            <ul className="mt-8 grid gap-4">
              {c.highlights.map((h) => (
                <li key={h.title} className="flex gap-4">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-burgundy text-paper">
                    <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </span>
                  <p className="text-[15px] leading-relaxed text-ink/65">
                    <span className="font-semibold text-ink">{h.title}.</span> {h.text}
                  </p>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.12}>
            <VisualCard slug={slug} />
          </Reveal>
        </div>

        {/* What's included */}
        <div className="mt-20 md:mt-28">
          <Reveal>
            <PartHeading title="What's included">
              Take the whole package or start with the piece you need most. Each part connects to the rest.
            </PartHeading>
          </Reveal>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {c.included.map((item, i) => (
              <li key={item.title} className="flex">
                <Reveal delay={(i % 3) * 0.06} className="flex w-full">
                  <div className="flex w-full flex-col rounded-[1.75rem] border border-taupe-light bg-[#efe9e3] p-7 shadow-[0_30px_60px_-50px_rgba(54,10,22,0.35)]">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-paper text-burgundy">
                      <item.Icon aria-hidden className="h-5 w-5" strokeWidth={1.5} />
                    </span>
                    <h4 className="mt-7 font-display text-lg font-semibold tracking-[-0.015em] text-ink">{item.title}</h4>
                    <p className="mt-2 text-[15px] leading-relaxed text-ink/65">{item.text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>

        {/* Before and after, beside how we deliver it */}
        <div className="mt-20 grid gap-16 md:mt-28 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <Reveal>
            <PartHeading title="What changes" />
            <div className="mt-10 overflow-hidden rounded-[2rem] border border-taupe-light shadow-[0_40px_80px_-55px_rgba(54,10,22,0.45)]">
              <div className="hidden sm:grid sm:grid-cols-2">
                <span className="bg-[#efe9e3] px-6 pb-1 pt-6 text-[10px] uppercase tracking-[0.2em] text-taupe-dark">Before</span>
                <span className="bg-burgundy-deep px-6 pb-1 pt-6 text-[10px] uppercase tracking-[0.2em] text-rose">With Celestial</span>
              </div>
              {c.shift.map((s, i) => (
                <div key={s.before} className="grid sm:grid-cols-2">
                  <div
                    className={`flex items-start gap-3 bg-[#efe9e3] px-6 py-5 ${i > 0 ? "border-t border-taupe-light" : ""} ${
                      i === c.shift.length - 1 ? "sm:pb-7" : ""
                    }`}
                  >
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-paper text-taupe-dark">
                      <X aria-hidden className="h-3 w-3" strokeWidth={2.25} />
                    </span>
                    <p className="text-[15px] leading-relaxed text-ink/60">
                      <span className="mb-0.5 block text-[10px] uppercase tracking-[0.2em] text-taupe-dark sm:hidden">Before</span>
                      {s.before}
                    </p>
                  </div>
                  <div
                    className={`flex items-start gap-3 bg-burgundy-deep px-6 py-5 text-paper ${i > 0 ? "sm:border-t sm:border-paper/10" : ""} ${
                      i === c.shift.length - 1 ? "sm:pb-7" : ""
                    }`}
                  >
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-rose/20 text-rose">
                      <Check aria-hidden className="h-3 w-3" strokeWidth={2.75} />
                    </span>
                    <p className="text-[15px] font-medium leading-relaxed">
                      <span className="mb-0.5 block text-[10px] font-normal uppercase tracking-[0.2em] text-rose sm:hidden">With Celestial</span>
                      {s.after}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <PartHeading title="How we deliver it" />
            <ol className="mt-10">
              {c.steps.map((s, i) => (
                // Each step draws the line down to the next one's dot
                <li
                  key={s.title}
                  className="relative pb-9 pl-12 before:absolute before:bottom-0 before:left-[15px] before:top-9 before:w-px before:bg-taupe/50 last:pb-0 last:before:hidden"
                >
                  <span
                    aria-hidden
                    className="absolute left-0 top-0 grid h-[31px] w-[31px] place-items-center rounded-full border border-burgundy/30 bg-paper text-[11px] font-semibold tabular-nums text-burgundy"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h4 className="pt-1 font-display text-lg font-semibold tracking-[-0.015em] text-ink">{s.title}</h4>
                  <p className="mt-1.5 max-w-md text-[15px] leading-relaxed text-ink/65">{s.text}</p>
                </li>
              ))}
            </ol>
            <p className="mt-10 max-w-md border-t border-taupe-light pt-6 text-sm leading-relaxed text-ink/55">
              A fixed scope and price before anything starts, and working results to review at every step.
            </p>
          </Reveal>
        </div>

        {/* The product's call to action, beside its questions */}
        <div className="mt-20 grid gap-10 md:mt-28 lg:grid-cols-[1fr_1.45fr] lg:gap-16">
          <Reveal>
            <p className="text-balance font-display text-3xl font-semibold leading-[1.1] tracking-[-0.025em] text-burgundy md:text-4xl">
              {c.cta[0]} <span className="text-shine">{c.cta[1]}</span>
            </p>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-ink/60">
              Tell us what you need and get a fixed scope and price in writing. Anything else on your mind? Ask us
              directly: a real person replies within one working day.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/contact" className={btn.solid}>
                Start a project
                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" strokeWidth={1.75} />
              </Link>
              <a
                href={`mailto:${CONTACT.email}?subject=${encodeURIComponent(`Question about ${plain(p.title)}`)}`}
                className={btn.outline}
              >
                <Mail aria-hidden className="h-4 w-4 text-taupe-dark" strokeWidth={1.5} />
                Ask a question
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h3 className="mb-4 text-xs uppercase tracking-[0.2em] text-taupe-dark">Common questions</h3>
            <div className="border-t border-taupe-light">
              {c.faqs.map((f) => (
                <details key={f.q} className="group border-b border-taupe-light">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-display text-lg font-semibold tracking-[-0.01em] text-ink transition-colors hover:text-burgundy [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-taupe-light text-burgundy transition-[rotate,background-color,color,border-color] duration-300 group-open:rotate-45 group-open:border-burgundy group-open:bg-burgundy group-open:text-paper">
                      <Plus aria-hidden className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                  </summary>
                  <p className="max-w-2xl pb-6 pr-14 text-[15px] leading-relaxed text-ink/65">{f.a}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section id="services-end" className="border-t border-ink/[0.06] px-6 py-24 md:py-32">
      <Reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-burgundy-rich px-7 py-16 text-center text-paper md:rounded-[3.5rem] md:px-16 md:py-24">
        <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 h-[420px] w-[420px] rounded-full border border-paper/10" />
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-[260px] w-[260px] rounded-full border border-dashed border-paper/20" />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-40 h-[420px] w-[420px] rounded-full border border-paper/10" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-24 h-[260px] w-[260px] rounded-full border border-dashed border-paper/20" />
        <div className="relative flex flex-col items-center">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-taupe-light">
            <span aria-hidden className="h-px w-6 bg-taupe-light" />
            One connected system
          </span>
          <h2 className="mt-6 max-w-3xl text-balance font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] md:text-6xl">
            Better together, <span className="text-shine-dark">by design.</span>
          </h2>
          <p className="mt-6 max-w-lg text-paper/70">
            Your website, CRM, automations and ads plug into each other and work as one growth engine. Tell us what you
            need, and you&apos;ll get a fixed scope, timeline and price in writing before any work starts.
          </p>
          <div className="mt-10 flex justify-center">
            <Ctas />
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function ServicesPage() {
  const url = `${SITE_URL}/services`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Products & services",
      url,
      itemListElement: products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Service",
          name: plain(p.title),
          description: productContent[p.slug].description,
          url: `${url}#${p.slug}`,
          provider: { "@type": "Organization", name: "Celestial Developers", url: SITE_URL },
        },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Products & services", item: url },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-paper text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ProductNav />
      <main>
        <Hero />
        {products.map((p, i) => (
          <ProductSection key={p.slug} slug={p.slug} index={i} />
        ))}
        <ClosingCta />
      </main>
      <Footer />
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { EnquiryForm } from "@/components/contact/EnquiryForm";
import { Footer } from "@/components/Footer";
import { Reveal, SectionLabel } from "@/components/Reveal";
import { SocialIcons } from "@/components/SocialIcons";
import { CONTACT, portfolio } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact — Celestial Developers",
  description:
    "Tell us what you want to build. Websites, CRMs, Meta & Google ads and automation — start with a conversation.",
};

const whatsappHref = `https://wa.me/${CONTACT.whatsapp}`;
const digits = (n: string) => n.replace(/\D/g, "");

const channels = [
  {
    icon: Phone,
    label: "Call us",
    numbers: CONTACT.phones.map((n) => ({ text: n, href: `tel:+${digits(n)}` })),
    note: `${CONTACT.hours[0].days}, ${CONTACT.hours[0].time}`,
    glow: "bg-burgundy/20",
    tint: "text-burgundy",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    numbers: CONTACT.phones.map((n) => ({ text: n, href: `https://wa.me/${digits(n)}` })),
    note: "Message us with your requirement",
    glow: "bg-taupe/40",
    tint: "text-taupe-dark",
  },
  {
    icon: Mail,
    label: "Email",
    value: CONTACT.email,
    href: `mailto:${CONTACT.email}`,
    note: CONTACT.replyTime,
    glow: "bg-burgundy/20",
    tint: "text-burgundy",
  },
];

const nextSteps = [
  { step: "01", title: "We reply", text: "A real person reads your enquiry and gets back to you within one working day." },
  { step: "02", title: "Discovery call", text: "A short call to understand your business, current tools and what is slowing you down." },
  { step: "03", title: "Clear proposal", text: "Scope, timeline and price in writing, so you know exactly what you are getting." },
];

function ContactHero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden rounded-b-[2.5rem] bg-burgundy-rich px-6 pb-44 pt-44 text-white md:rounded-b-[4rem] md:pb-52 md:pt-52"
    >
      {/* Backdrop: dot grid, glows and orbit rings */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(232,224,216,0.08)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,#000,transparent)]" />
      <div className="pointer-events-none absolute -left-40 top-0 h-[500px] w-[700px] rounded-full bg-burgundy-deep/70 blur-[120px]" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-[400px] w-[600px] rounded-full bg-taupe/25 blur-[120px]" />
      <div className="pointer-events-none absolute -right-48 top-1/2 hidden aspect-square w-[720px] -translate-y-1/2 md:block">
        <div className="absolute inset-0 rounded-full border border-white/[0.08]" />
        <div className="absolute inset-[12%] animate-spin-slower rounded-full border border-dashed border-white/15" />
        <div className="absolute inset-[26%] animate-spin-slow rounded-full border border-white/15">
          <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-taupe-light shadow-[0_0_14px_rgba(232,224,216,0.8)]" />
        </div>
        <div className="absolute inset-[40%] rounded-full bg-gradient-to-tr from-burgundy-deep via-taupe/70 to-taupe-light opacity-90" />
        <div className="absolute inset-[36%] rounded-full bg-taupe/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <Reveal>
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-taupe-light">
            <span className="h-px w-6 bg-taupe-light" />
            Contact us
          </span>
          <h1 className="font-display font-semibold tracking-[-0.025em] mt-6 max-w-4xl text-5xl leading-[1.02] text-white md:text-7xl">
            Let’s talk about what you want to{" "}
            <span className="text-taupe-light">
              build.
            </span>
          </h1>
          <p className="mt-8 max-w-xl text-lg font-light leading-relaxed text-white/75">
            Whether it is a new website, a CRM your team will actually use, or ad campaigns that need to
            pay for themselves, start with a conversation.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function ChannelCards() {
  return (
    <section className="relative z-10 -mt-24 px-6 md:-mt-28">
      <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3 md:gap-6">
        {channels.map((c, i) => {
          const cardClass =
            "group relative block h-full overflow-hidden rounded-3xl border border-taupe-light bg-paper p-7 shadow-[0_25px_60px_-25px_rgba(54,10,22,0.35)] transition duration-300 hover:-translate-y-1 hover:border-taupe";
          const header = (
            <>
              <span className={`pointer-events-none absolute -left-6 -top-6 h-24 w-24 rounded-full ${c.glow} blur-2xl transition group-hover:scale-125`} />
              <div className="relative flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.2em] text-taupe-dark">{c.label}</span>
                <c.icon className={`h-5 w-5 ${c.tint}`} strokeWidth={1.5} />
              </div>
            </>
          );
          return (
            <Reveal key={c.label} delay={i * 0.08}>
              {c.numbers ? (
                // Several numbers: each is its own link, so the card itself can't be one
                <div className={cardClass}>
                  {header}
                  <div className="relative mt-8 flex flex-col gap-1">
                    {c.numbers.map((n) => (
                      <a
                        key={n.text}
                        href={n.href}
                        target={n.href.startsWith("http") ? "_blank" : undefined}
                        rel="noreferrer"
                        className="break-words text-xl font-medium text-ink transition hover:text-burgundy lg:text-[1.35rem]"
                      >
                        {n.text}
                      </a>
                    ))}
                  </div>
                  <p className="relative mt-3 text-sm text-taupe-dark">{c.note}</p>
                </div>
              ) : (
                <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className={cardClass}>
                  {header}
                  <p className="relative mt-8 break-words text-xl font-medium text-ink lg:text-[1.35rem]">{c.value}</p>
                  <p className="relative mt-3 text-sm text-taupe-dark">{c.note}</p>
                  <ArrowUpRight className="absolute bottom-7 right-7 h-4 w-4 text-taupe transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
                </a>
              )}
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function EnquirySection() {
  return (
    <section id="enquiry" className="relative scroll-mt-24 overflow-hidden px-6 py-28">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[1000px] -translate-x-1/2 rounded-full bg-taupe-light/50 blur-[120px]" />

      <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.45fr] lg:gap-16">
        <Reveal className="flex flex-col gap-10">
          <div>
            <SectionLabel>Send an enquiry</SectionLabel>
            <h2 className="font-display font-semibold tracking-[-0.025em] mt-5 text-4xl leading-[1.05] md:text-6xl text-burgundy">
              Tell us what you want to <span className="text-shine">build.</span>
            </h2>
          </div>

          <div>
            <span className="mb-4 flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-taupe-dark">
              <MapPin className="h-4 w-4 text-burgundy" strokeWidth={1.5} /> Where we are
            </span>
            {CONTACT.location.map((line, i) => (
              <p key={line} className={i === 0 ? "text-lg text-ink" : "text-ink/65"}>
                {line}
              </p>
            ))}
          </div>

          <div className="rounded-3xl border border-taupe-light bg-cream p-6 md:p-8">
            <span className="mb-4 flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-taupe-dark">
              <Clock className="h-4 w-4 text-taupe-dark" strokeWidth={1.5} /> Opening hours
            </span>
            <dl>
              {CONTACT.hours.map((h) => (
                <div key={h.days} className="flex justify-between gap-4 border-b border-dashed border-taupe/40 py-4 text-sm last:border-0">
                  <dt className="text-ink/65">{h.days}</dt>
                  <dd className="font-medium text-ink">{h.time}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href={`mailto:${CONTACT.email}`} className="inline-flex items-center gap-2 rounded-full border border-taupe/40 bg-paper px-4 py-2 text-sm text-ink/80 transition hover:border-taupe/50 hover:text-ink">
                <Mail className="h-4 w-4 text-taupe-dark" /> Email
              </a>
              <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-taupe/40 bg-paper px-4 py-2 text-sm text-ink/80 transition hover:border-taupe/50 hover:text-ink">
                <MessageCircle className="h-4 w-4 text-taupe-dark" /> WhatsApp
              </a>
              <Link href="/portfolio" className="inline-flex items-center gap-2 rounded-full border border-taupe/40 bg-paper px-4 py-2 text-sm text-ink/80 transition hover:border-burgundy/50 hover:text-ink">
                <ArrowUpRight className="h-4 w-4 text-burgundy" /> Our work
              </Link>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <EnquiryForm />
        </Reveal>
      </div>
    </section>
  );
}

function NextSteps() {
  return (
    <section className="border-t border-ink/[0.06] bg-cream/40 px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-16 text-center">
          <SectionLabel tone="burgundy">Safe hands</SectionLabel>
          <h2 className="font-display font-semibold tracking-[-0.025em] mt-5 text-4xl md:text-6xl text-burgundy leading-[1.05]">
            What happens <span className="text-shine">next</span>
          </h2>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-3 md:gap-6">
          {nextSteps.map((s, i) => (
            <Reveal key={s.step} delay={i * 0.1}>
              <div className="h-full rounded-3xl border border-taupe-light bg-paper p-8 shadow-[0_20px_50px_-30px_rgba(36,27,28,0.3)]">
                <span className="text-xs text-taupe-dark">{s.step}</span>
                <h3 className="font-display font-semibold tracking-[-0.015em] mt-8 text-2xl text-burgundy">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-taupe-dark">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-20">
          <p className="mb-8 text-center text-[11px] uppercase tracking-[0.2em] text-taupe-dark">
            Trusted by
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {portfolio.map((p) => (
              <a
                key={p.url}
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="font-display text-xl font-semibold tracking-[-0.02em] text-taupe-dark transition hover:text-burgundy md:text-2xl"
              >
                {p.name}
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function DiscoverMore() {
  return (
    <section className="border-t border-ink/[0.06] px-6 py-28">
      <Reveal className="mx-auto flex max-w-6xl flex-col items-center text-center">
        <h2 className="font-display font-semibold text-2xl uppercase tracking-[0.3em] text-burgundy md:text-4xl leading-[1.05]">
          Discover more
        </h2>
        <p className="mt-5 max-w-md text-taupe-dark">Follow along for new launches, behind-the-build notes and growth tips.</p>
        <div className="mt-14">
          <SocialIcons size="lg" />
        </div>
      </Reveal>
    </section>
  );
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <main>
        <ContactHero />
        <ChannelCards />
        <EnquirySection />
        <NextSteps />
        <DiscoverMore />
      </main>
      <Footer bleed />
    </div>
  );
}

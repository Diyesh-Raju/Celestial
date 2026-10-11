import Link from "next/link";
import { CONTACT } from "@/lib/data";
import { Logo } from "./Navbar";
import { SocialIcons } from "./SocialIcons";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/#services", label: "Services" },
  { href: "/#process", label: "Process" },
  { href: "/#faq", label: "FAQ" },
  { href: "/portfolio", label: "Selected Work" },
  { href: "/contact", label: "Contact Us" },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-burgundy-deep px-6 pt-20 text-white">
      {/* Orbit rings + taupe glow */}
      <div className="pointer-events-none absolute -right-64 -top-64 h-[640px] w-[640px] rounded-full border border-white/20" />
      <div className="pointer-events-none absolute -right-40 -top-40 h-[400px] w-[400px] rounded-full border border-dashed border-white/30" />
      {/* Same rings, mirrored into the bottom-left corner */}
      <div className="pointer-events-none absolute -bottom-64 -left-64 h-[640px] w-[640px] rounded-full border border-white/20" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full border border-dashed border-white/30" />
      <div className="pointer-events-none absolute -bottom-64 -left-40 h-[500px] w-[700px] rounded-full bg-taupe/20 blur-[120px]" />

      {/* Oversized name, only a shade lighter than the background */}
      <p
        aria-hidden
        className="relative select-none text-center font-display text-[12.5vw] font-black uppercase leading-[0.86] tracking-[-0.03em] text-taupe/[0.09] md:text-[11vw] xl:text-[9.5rem]"
      >
        Celestial
        <br />
        Corporation
      </p>

      <div className="relative mx-auto mt-16 grid max-w-6xl gap-14 md:mt-24 md:grid-cols-[1fr_1.3fr_1fr]">
        <div className="flex flex-col gap-6">
          <Logo light />
          <p className="max-w-xs text-sm leading-relaxed text-white/60">
            Websites, CRMs and Meta &amp; Google ads, built as one connected growth engine.
          </p>
          <SocialIcons light />
        </div>

        <nav className="flex flex-col gap-1 md:pl-16 lg:pl-24">
          {footerLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="w-fit text-3xl font-light tracking-tight text-white/85 transition hover:translate-x-1 hover:text-taupe-light md:text-4xl"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-3 text-sm text-white/70">
          <span className="mb-2 text-[11px] uppercase tracking-[0.2em] text-taupe">Contact</span>
          {CONTACT.phones.map((n) => (
            <a key={n} href={`tel:${n.replace(/\s/g, "")}`} className="transition hover:text-white">
              {n}
            </a>
          ))}
          <a href={`mailto:${CONTACT.email}`} className="transition hover:text-white">
            {CONTACT.email}
          </a>
          <span>{CONTACT.hours[0].days}, {CONTACT.hours[0].time}</span>
          <div className="mt-4 leading-relaxed">
            {CONTACT.location.map((line) => (
              <span key={line} className="block">{line}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mx-auto mt-20 flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-white/10 py-8 text-xs text-white/50 md:flex-row">
        <span>© 2026 Celestial Corporation. All rights reserved.</span>
        <a href="#top" className="transition hover:text-white">Back to top ↑</a>
      </div>
    </footer>
  );
}

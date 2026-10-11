"use client";

import { useEffect, useRef, useState } from "react";
import Link, { type LinkProps } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CONTACT, navLinks } from "@/lib/data";
import { LOGO_C, LOGO_C_STROKE, LOGO_MOON, LOGO_STAR, LOGO_VIEWBOX } from "@/lib/logo";

/* Celestial Co mark: an open C holding a crescent moon and a star */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox={LOGO_VIEWBOX} aria-hidden className={className}>
      <path d={LOGO_C} fill="none" stroke="currentColor" strokeWidth={LOGO_C_STROKE} />
      <path d={LOGO_MOON} fill="currentColor" />
      <path d={LOGO_STAR} fill="currentColor" />
    </svg>
  );
}

/* Wordmark: "CELESTIAL CO." in wide-tracked Montserrat caps */
export function Wordmark({ className = "" }: { className?: string }) {
  return <span className={`font-brand uppercase leading-none tracking-[0.06em] ${className}`}>Celestial Co.</span>;
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Celestial Corporation home">
      <LogoMark className={`h-9 w-9 ${light ? "text-white" : "text-burgundy"}`} />
      <Wordmark className={`text-lg ${light ? "text-white" : "text-ink"}`} />
    </Link>
  );
}

/* Navbar brand, set in light taupe so it sits directly on the dark hero */
function NavBrand() {
  return (
    <Link href="/" className="flex items-center gap-2 text-paper sm:gap-3" aria-label="Celestial Corporation home">
      <LogoMark className="h-9 w-9 sm:h-10 sm:w-10" />
      <Wordmark className="text-[17px] sm:text-xl" />
    </Link>
  );
}

/* "MENU" in the wordmark's Montserrat caps beside a three-line icon, the text
   centred on the middle line; the button keeps a 48px tap target */
function MenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Open menu"
      aria-controls="site-menu"
      className="flex h-12 items-center gap-3 font-brand text-sm uppercase leading-none tracking-[0.06em] text-paper transition-opacity hover:opacity-70"
    >
      Menu
      <span aria-hidden className="flex w-6 flex-col gap-[5px]">
        <span className="h-[2px] w-full rounded-full bg-current" />
        <span className="h-[2px] w-full rounded-full bg-current" />
        <span className="h-[2px] w-full rounded-full bg-current" />
      </span>
    </button>
  );
}

const menuLinks = [...navLinks, { href: "/contact", label: "Contact" }];

const socials = [
  { href: CONTACT.socials.instagram, label: "Instagram" },
  { href: CONTACT.socials.linkedin, label: "LinkedIn" },
  { href: CONTACT.socials.x, label: "X (Twitter)" },
];

/* Jumps (no smooth scroll) to a "#hash" target, or to the top of the page */
function jumpTo(hash: string) {
  const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
  if (target) target.scrollIntoView({ behavior: "instant", block: "start" });
  else window.scrollTo({ top: 0, behavior: "instant" });
}

type NavigateHandler = NonNullable<LinkProps["onNavigate"]>;

function MenuOverlay({ onClose, onNavigate }: { onClose: () => void; onNavigate: (href: string) => NavigateHandler }) {
  return (
    <motion.div
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      initial={{ clipPath: "inset(0 0 100% 0)" }}
      animate={{ clipPath: "inset(0 0 0% 0)" }}
      exit={{ clipPath: "inset(0 0 100% 0)" }}
      transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 z-[60] flex flex-col bg-taupe px-5 py-5 text-burgundy md:px-8 md:py-6"
    >
      <div className="flex items-center justify-between">
        <Link href="/" onNavigate={onNavigate("/")} className="flex items-center gap-2.5">
          <LogoMark className="h-8 w-8" />
          <Wordmark className="text-lg" />
        </Link>
        <button
          onClick={onClose}
          aria-label="Close menu"
          autoFocus
          className="grid h-12 w-12 place-items-center text-burgundy transition hover:text-burgundy-deep active:scale-[0.92]"
        >
          <span aria-hidden className="relative block h-6 w-6">
            <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 rotate-45 rounded-full bg-current" />
            <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 -rotate-45 rounded-full bg-current" />
          </span>
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <nav className="flex flex-col items-center">
          {menuLinks.map((l, i) => (
            <motion.div
              key={l.href}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href={l.href}
                onNavigate={onNavigate(l.href)}
                className="inline-block font-display text-5xl leading-[1.1] tracking-tight transition-colors duration-300 hover:text-burgundy-deep md:text-6xl"
              >
                {l.label}
              </Link>
            </motion.div>
          ))}
        </nav>

        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-8 flex flex-col gap-1.5 text-sm"
        >
          {socials.map((s) => (
            <li key={s.label}>
              <a href={s.href} target="_blank" rel="noreferrer" className="text-burgundy/70 transition hover:text-burgundy">
                {s.label}
              </a>
            </li>
          ))}
        </motion.ul>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="grid grid-cols-2 gap-2 text-sm md:grid-cols-[1fr_1fr_auto]"
      >
        <span>© {new Date().getFullYear()} Celestial Corporation</span>
        <a href={`mailto:${CONTACT.email}`} className="hidden transition hover:text-burgundy-deep md:block">
          {CONTACT.email}
        </a>
        <Link href="/contact" onNavigate={onNavigate("/contact")} className="justify-self-end transition hover:text-burgundy-deep">
          Start a project →
        </Link>
      </motion.div>
    </motion.div>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  // Hash to land on once a cross-page navigation started from the menu commits
  const pendingHash = useRef<string | null>(null);

  // Menu links move the page while the menu still covers it, then the menu lifts
  // (bottom to top, see the exit clip-path) to reveal wherever the link pointed.
  const navigateFromMenu = (href: string): NavigateHandler => (e) => {
    e.preventDefault();
    if (pendingHash.current !== null) return;
    const url = new URL(href, window.location.href);
    if (url.pathname === window.location.pathname) {
      if (url.hash && url.hash !== window.location.hash) window.history.pushState(null, "", url.hash);
      jumpTo(url.hash);
      setOpen(false);
    } else {
      pendingHash.current = url.hash;
      router.push(href, { scroll: false });
    }
  };

  // The new page has rendered under the menu: give it a frame to lay out, put it
  // at the right spot, then lift the menu.
  useEffect(() => {
    if (pendingHash.current === null) return;
    const hash = pendingHash.current;
    const frame = requestAnimationFrame(() => {
      pendingHash.current = null;
      jumpTo(hash);
      setOpen(false);
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // While the menu is open: lock page scroll, close on Escape.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl backdrop-saturate-150 transition-[background-color,border-color,box-shadow] duration-500 ${
          scrolled
            ? "border-paper/10 bg-burgundy-deep/70 shadow-[0_10px_40px_-20px_rgba(20,3,8,0.6)]"
            : "border-paper/15 bg-paper/[0.06]"
        }`}
      >
        <nav
          className={`mx-auto flex max-w-6xl items-center justify-between px-5 transition-[height] duration-500 md:px-8 ${
            scrolled ? "h-16" : "h-20"
          }`}
        >
          <NavBrand />
          <MenuButton onClick={() => setOpen(true)} />
        </nav>
      </header>

      {/* Rendered outside <header>: its backdrop-filter would otherwise trap this
          fixed overlay inside the header's own box. */}
      <AnimatePresence>{open && <MenuOverlay onClose={() => setOpen(false)} onNavigate={navigateFromMenu} />}</AnimatePresence>
    </>
  );
}

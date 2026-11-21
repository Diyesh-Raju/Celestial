"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link, { type LinkProps } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, MotionConfig, motion, stagger, type Variants } from "framer-motion";
import { ArrowRight, ArrowUpRight, CalendarDays } from "lucide-react";
import { CONTACT, navLinks, productHref, products } from "@/lib/data";
import { LOGO_PATH, LOGO_VIEWBOX } from "@/lib/logo";

/* Celestial Developers mark: a circle split into two mirrored crescent-and-bar halves */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox={LOGO_VIEWBOX} aria-hidden className={className}>
      <path d={LOGO_PATH} fill="currentColor" />
    </svg>
  );
}

/* Wordmark: "CELESTIAL DEVELOPERS" in wide-tracked Montserrat caps */
export function Wordmark({ className = "" }: { className?: string }) {
  return <span className={`font-brand uppercase leading-none tracking-[0.06em] ${className}`}>Celestial Developers</span>;
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Celestial Developers home">
      <LogoMark className={`h-9 w-9 ${light ? "text-white" : "text-burgundy"}`} />
      <Wordmark className={`text-lg ${light ? "text-white" : "text-ink"}`} />
    </Link>
  );
}

/* Navbar brand, set in light taupe so it sits directly on the dark hero */
function NavBrand({ onNavigate }: { onNavigate: NavigateHandler }) {
  return (
    <Link
      href="/"
      onNavigate={onNavigate}
      className="flex items-center gap-2 text-paper sm:gap-3"
      aria-label="Celestial Developers home"
    >
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

const menuLinks = [...navLinks, { href: "/contact", label: "Contact Us" }];

// The menu link that lists the products beside it
const PRODUCTS_HREF = "/#services";

/* Jumps (no smooth scroll) to a "#hash" target, or to the top of the page.
   The target's place comes from layout (offsetTop), not scrollIntoView: these jumps
   run while the menu's scroll lock is on, and the lock throws scroll-driven
   transforms to their end (the About slide-over sits 100vh low), which
   scrollIntoView would include. */
function jumpTo(hash: string) {
  const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
  let top = 0;
  if (target) {
    for (let el: HTMLElement | null = target; el; el = el.offsetParent as HTMLElement | null) top += el.offsetTop;
    top -= parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  }
  window.scrollTo({ top, behavior: "instant" });
}

type NavigateHandler = NonNullable<LinkProps["onNavigate"]>;

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/* Most of the page a glide ever travels, in screen heights. From further down it
   starts this far from the top: at that speed the cut doesn't read, and the heavy
   sections in between (3D devices, pinned scenes) never have to draw a frame. */
const GLIDE_SPAN = 2.5;

/* Scrolls back to the top on a short glide of our own instead of the browser's smooth
   scroll, which takes longer the further down you are and drags every section on the
   way through a frame or two. While it runs, <html> carries .gliding (see globals.css
   and Hero.tsx). A touch, click or key press from the visitor hands control straight
   back to them. (Not the wheel: a trackpad's leftover momentum would cancel the
   glide the moment it starts.) */
function glideToTop() {
  if (window.scrollY < 2) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return jumpTo("");

  const from = Math.min(window.scrollY, window.innerHeight * GLIDE_SPAN);
  if (from < window.scrollY) window.scrollTo({ top: from, behavior: "instant" });

  const duration = 250 + (from / window.innerHeight) * 120; // ms: one screen ~370ms, the full span ~550ms
  const root = document.documentElement;
  const start = performance.now();
  let frame = 0;

  const finish = () => {
    cancelAnimationFrame(frame);
    root.classList.remove("gliding");
    for (const type of ["touchstart", "mousedown", "keydown"]) window.removeEventListener(type, finish);
  };
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    window.scrollTo({ top: from * (1 - easeOutCubic(t)), behavior: "instant" });
    if (t < 1) frame = requestAnimationFrame(step);
    else finish();
  };

  root.classList.add("gliding");
  for (const type of ["touchstart", "mousedown", "keydown"]) window.addEventListener(type, finish, { passive: true });
  frame = requestAnimationFrame(step);
}

/* Menu motion after the Rolls-Royce menu: the frosted panel drops from the top
   on an out-expo glide (quick start, long soft landing), then the links sweep in
   from the left one after another, bottom link first. Closing pulls the links
   back out and lifts the panel. */
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const panelVariants: Variants = {
  closed: { y: "-100%", transition: { duration: 0.75, delay: 0.15, ease: [0.76, 0, 0.24, 1] } },
  open: { y: "0%", transition: { duration: 1.1, ease: EASE_OUT_EXPO } },
};

const linkListVariants: Variants = {
  closed: { transition: { delayChildren: stagger(0.025) } },
  open: { transition: { delayChildren: stagger(0.07, { startDelay: 0.25, from: "last" }) } },
};

// Each link row spans the menu's width, so -100% starts its text off the left edge
const linkVariants: Variants = {
  closed: { x: "-100%", opacity: 0, transition: { duration: 0.35, ease: [0.7, 0, 0.84, 0] } },
  open: {
    x: "0%",
    opacity: 1,
    transition: { duration: 1.2, ease: EASE_OUT_EXPO, opacity: { duration: 0.8, ease: "easeOut" } },
  },
};

/* The products, listed with "Products & Services". On screens that hover and are
   1024px+ wide (.menu-flyout), hovering or tabbing to the link draws a dash out to
   its right and they fade in one under another; elsewhere they sit in a small row
   under it (.menu-inline). The motion lives in globals.css under "Site menu". Each
   opens its own page. */
function ProductFlyout({ onNavigate }: { onNavigate: (href: string) => NavigateHandler }) {
  const pathname = usePathname();
  return (
    <div className="menu-flyout absolute left-full top-1/2 -translate-y-1/2 items-center pl-4 xl:pl-6">
      <span aria-hidden className="menu-dash block h-px w-10 bg-burgundy xl:w-16" />
      <ul className="ml-3 flex flex-col text-left xl:ml-5">
        {products.map((p, i) => (
          <li key={p.slug} style={{ "--i": i } as CSSProperties}>
            <Link
              href={productHref(p.slug)}
              onNavigate={onNavigate(productHref(p.slug))}
              aria-current={pathname === productHref(p.slug) ? "page" : undefined}
              className="group/item flex items-center gap-2 whitespace-nowrap py-1.5 font-sans text-[15px] leading-snug text-burgundy/80 transition-colors duration-300 hover:text-burgundy-deep focus-visible:text-burgundy-deep focus-visible:outline-none aria-[current=page]:font-medium aria-[current=page]:text-burgundy-deep xl:text-[17px]"
            >
              {p.title}
              <ArrowRight
                aria-hidden
                className="h-4 w-4 -translate-x-1 opacity-0 transition-[translate,opacity] duration-300 group-hover/item:translate-x-0 group-hover/item:opacity-100 group-focus-visible/item:translate-x-0 group-focus-visible/item:opacity-100"
                strokeWidth={1.75}
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProductRow({ onNavigate }: { onNavigate: (href: string) => NavigateHandler }) {
  const pathname = usePathname();
  return (
    <ul className="menu-inline mx-auto mt-1 flex max-w-xs flex-wrap justify-center gap-x-5 px-4 sm:max-w-md">
      {products.map((p) => (
        <li key={p.slug}>
          <Link
            href={productHref(p.slug)}
            onNavigate={onNavigate(productHref(p.slug))}
            aria-current={pathname === productHref(p.slug) ? "page" : undefined}
            className="inline-block py-1.5 font-sans text-[13px] text-burgundy/75 transition-colors hover:text-burgundy-deep aria-[current=page]:font-medium aria-[current=page]:text-burgundy-deep sm:text-sm"
          >
            {p.short}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function MenuOverlay({ onClose, onNavigate }: { onClose: () => void; onNavigate: (href: string) => NavigateHandler }) {
  return (
    <>
      {/* Dims the page while the panel travels over it */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.5 } }}
        exit={{ opacity: 0, transition: { duration: 0.75, delay: 0.15 } }}
        className="pointer-events-none fixed inset-0 z-[60] bg-burgundy-deep/40"
      />
      {/* Frosted panel: tinted lighter than taupe so that over the dark hero it lands
          on the brand taupe (keeping the footer text readable), lighter elsewhere */}
      <motion.div
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        variants={panelVariants}
        initial="closed"
        animate="open"
        exit="closed"
        className="fixed inset-0 z-[60] flex flex-col overflow-hidden bg-[#b9aa9e]/88 px-5 py-5 text-burgundy shadow-[0_30px_80px_-20px_rgba(20,3,8,0.6)] backdrop-blur-[48px] backdrop-saturate-150 md:px-8 md:py-6"
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
          <motion.nav variants={linkListVariants} className="menu-nav flex w-full flex-col items-center">
            {/* The type shrinks with the screen's height (up to 5xl/6xl) so the list and the
                footer row fit on short screens, and on phones with its width too, so
                "Products & Services" stays on one line. From lg up it also stays within
                4.8vw, so the products listed beside it still fit on a tall, narrow window */}
            {menuLinks.map((l) => {
              const isProducts = l.href === PRODUCTS_HREF;
              const link = (
                <Link
                  href={l.href}
                  onNavigate={onNavigate(l.href)}
                  className={`menu-link inline-block font-display text-[length:clamp(1.75rem,min(6.4svh,10vw),3rem)] leading-[1.1] tracking-tight transition-[color,opacity] duration-300 hover:text-burgundy-deep md:text-[length:clamp(2rem,6.4svh,3.75rem)] lg:text-[length:clamp(2rem,min(6.4svh,4.8vw),3.75rem)] ${
                    isProducts ? "menu-products-link" : ""
                  }`}
                >
                  {l.label}
                </Link>
              );
              // The products row sits above its neighbours: its list is taller than the
              // row and hangs over them, and has to stay hoverable there
              return (
                <motion.div key={l.href} variants={linkVariants} className={isProducts ? "relative z-10 w-full" : "w-full"}>
                  {isProducts ? (
                    <>
                      <span className="menu-products relative inline-block">
                        {link}
                        <ProductFlyout onNavigate={onNavigate} />
                      </span>
                      <ProductRow onNavigate={onNavigate} />
                    </>
                  ) : (
                    link
                  )}
                </motion.div>
              );
            })}
          </motion.nav>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="grid grid-cols-[1fr_auto] items-center gap-2 text-sm md:grid-cols-[1fr_1fr_auto]"
        >
          <span>© {new Date().getFullYear()} Celestial Developers</span>
          <a href={`mailto:${CONTACT.email}`} className="hidden transition hover:text-burgundy-deep md:block">
            {CONTACT.email}
          </a>
          <a
            href={CONTACT.walkthrough}
            target="_blank"
            rel="noopener noreferrer"
            className="group/book relative inline-flex h-12 items-center gap-2.5 justify-self-end overflow-hidden rounded-full border border-paper/15 bg-gradient-to-b from-burgundy to-burgundy-deep px-4 text-[15px] font-semibold text-paper shadow-[0_12px_30px_-12px_rgba(20,3,8,0.7)] transition hover:border-paper/30 active:scale-[0.97] md:h-14 md:gap-3 md:px-6 md:text-base"
          >
            <CalendarDays aria-hidden className="h-5 w-5 text-[#e7a9b8]" />
            Book a walkthrough
            <ArrowUpRight
              aria-hidden
              className="h-5 w-5 text-paper/70 transition-transform group-hover/book:-translate-y-0.5 group-hover/book:translate-x-0.5"
            />
            {/* Soft light catching the bottom edge */}
            <span aria-hidden className="absolute inset-x-1/4 bottom-0 h-px bg-gradient-to-r from-transparent via-[#e7a9b8] to-transparent" />
          </a>
        </motion.div>
      </motion.div>
    </>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  // Hash to land on once a cross-page navigation started from the menu commits
  const pendingHash = useRef<string | null>(null);
  // The navbar logo: on the home page it glides back up to the top; anywhere else
  // it opens the home page at the top (Next's normal navigation does that).
  const goHome: NavigateHandler = (e) => {
    if (window.location.pathname !== "/") return;
    e.preventDefault();
    if (window.location.hash) window.history.pushState(null, "", "/");
    glideToTop();
  };

  // Menu links move the page while the menu still covers it, then the menu lifts
  // (see panelVariants) to reveal wherever the link pointed.
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
        className={`site-header fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl backdrop-saturate-150 transition-[background-color,border-color,box-shadow,transform] duration-500 ${
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
          <NavBrand onNavigate={goHome} />
          <MenuButton onClick={() => setOpen(true)} />
        </nav>
      </header>

      {/* Rendered outside <header>: its backdrop-filter would otherwise trap this
          fixed overlay inside the header's own box. */}
      <MotionConfig reducedMotion="user">
        <AnimatePresence>{open && <MenuOverlay onClose={() => setOpen(false)} onNavigate={navigateFromMenu} />}</AnimatePresence>
      </MotionConfig>
    </>
  );
}

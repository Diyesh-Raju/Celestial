"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  BatteryFull,
  Check,
  ChevronDown,
  ChevronLeft,
  Copy,
  Mail,
  Reply,
  Search,
  Star,
  Wifi,
} from "lucide-react";
import { TEAM_EMAIL, faqs } from "@/lib/data";
import { LogoMark } from "./Navbar";
import { Reveal } from "./Reveal";

type Faq = (typeof faqs)[number];

const mailto = (subject: string) => `mailto:${TEAM_EMAIL}?subject=${encodeURIComponent(subject)}`;
const num = (i: number) => String(i + 1).padStart(2, "0");

export function Faq() {
  const [active, setActive] = useState(0);

  return (
    <section
      className="relative overflow-hidden bg-charcoal px-6 pb-24 pt-[18rem] text-paper md:pb-32 md:pt-[24rem]"
    >
      {/* Taupe from the section above bleeding down into charcoal (eased stops, no hard edge) */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-56 md:h-80"
        style={{
          background:
            "linear-gradient(to bottom, #e8e0d8 0%, #e1d9d2 12%, #c9c1bb 28%, #9d9693 46%, #6a6466 63%, #433f41 80%, #2a2829 100%)",
        }}
      />
      {/* Burgundy light pooling behind the tablet */}
      <div className="pointer-events-none absolute -left-40 top-[55%] h-[560px] w-[760px] -translate-y-1/2 rounded-full bg-burgundy/45 blur-[140px]" />

      {/* Menu anchor sits on the content, not the section: the section opens with a tall
          gradient fade, so jumping to its top would land on empty space */}
      <div id="faq" className="relative mx-auto max-w-6xl scroll-mt-28">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-end lg:gap-14">
          <Reveal>
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-rose">
              <span className="h-px w-6 bg-rose" />
              Questions, answered
            </span>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.025em] text-paper md:text-6xl">
              What people ask us before the <span className="text-shine-dark">first call</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-md text-paper/60 lg:pb-2">
              Straight answers on price, timelines, ownership and life after launch. Pick a question and the
              reply lands on the screen.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-12 md:mt-20 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
          {/* Tablet runs past the container's left edge on wide screens to sit larger */}
          <Reveal className="lg:sticky lg:top-28 lg:self-start xl:-ml-16">
            <Tablet active={active} onPick={setActive} />
          </Reveal>

          <Reveal delay={0.1}>
            <ol className="border-b border-paper/10">
              {faqs.map((f, i) => (
                <QuestionRow key={f.q} faq={f} index={i} active={i === active} onSelect={() => setActive(i)} />
              ))}
            </ol>
            <EmailCard />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------- Right column ---------- */

function QuestionRow({
  faq,
  index,
  active,
  onSelect,
}: {
  faq: Faq;
  index: number;
  active: boolean;
  onSelect: () => void;
}) {
  const id = `faq-answer-${index}`;
  return (
    <li className="relative border-t border-paper/10">
      {active && (
        <motion.span
          layoutId="faq-active"
          transition={{ type: "spring", stiffness: 420, damping: 38 }}
          className="absolute inset-y-1 -inset-x-3 rounded-2xl bg-burgundy shadow-[0_18px_40px_-18px_rgba(86,18,38,0.9)] md:-inset-x-4"
        />
      )}
      <button
        type="button"
        onClick={onSelect}
        aria-expanded={active}
        aria-controls={id}
        className="group relative flex w-full items-center gap-4 py-5 text-left md:gap-5"
      >
        <span className={`font-condensed text-sm tracking-[0.08em] ${active ? "text-paper/70" : "text-rose/80"}`}>
          {num(index)}
        </span>
        <span
          className={`flex-1 text-base font-medium leading-snug transition-colors md:text-lg ${
            active ? "text-paper" : "text-paper/60 group-hover:text-paper"
          }`}
        >
          {faq.q}
        </span>
        {/* Desktop: points at the tablet showing the answer. Mobile: opens inline. */}
        <ArrowLeft
          aria-hidden
          strokeWidth={1.75}
          className={`hidden h-4 w-4 shrink-0 transition-all lg:block ${
            active ? "translate-x-0 text-paper opacity-100" : "translate-x-2 text-paper/40 opacity-0 group-hover:opacity-100"
          }`}
        />
        <ChevronDown
          aria-hidden
          strokeWidth={1.75}
          className={`h-4 w-4 shrink-0 transition-transform lg:hidden ${active ? "rotate-180 text-paper" : "text-paper/40"}`}
        />
      </button>

      {/* Inline answer for small screens; on desktop it stays for screen readers only,
          since the tablet (aria-hidden) shows it visually. */}
      <div id={id} role="region" className={active ? "relative pb-6 pl-9 pr-2 lg:sr-only" : "hidden"}>
        <p className="text-sm leading-relaxed text-paper/80">{faq.a}</p>
      </div>
    </li>
  );
}

function EmailCard() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(TEAM_EMAIL);
      setCopied(true);
    } catch {
      window.location.href = mailto("A question for Celestial");
    }
  };

  return (
    <div className="mt-8 flex items-center gap-3 rounded-2xl border border-paper/10 bg-charcoal-deep/60 p-3 pr-4 backdrop-blur-sm">
      <a href={mailto("A question for Celestial")} className="group flex min-w-0 flex-1 items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-burgundy text-paper">
          <Mail className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block text-xs text-paper/50">Didn&rsquo;t see your question? Email us</span>
          <span className="block truncate text-sm font-medium text-paper transition-colors group-hover:text-rose">
            {TEAM_EMAIL}
          </span>
        </span>
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Email copied" : "Copy email address"}
        title={copied ? "Copied" : "Copy"}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-paper/15 text-paper/70 transition hover:border-paper/40 hover:text-paper"
      >
        {copied ? <Check className="h-4 w-4 text-rose" strokeWidth={2} /> : <Copy className="h-4 w-4" strokeWidth={1.75} />}
      </button>
    </div>
  );
}

/* ---------- The tablet ---------- */

/* Landscape iPad running a mail-style inbox: the questions sit in the sidebar and the
   selected one opens in the reading pane. Portrait, pane-only, on small screens.
   Decorative mirror of the list beside it, so it's hidden from assistive tech. */
function Tablet({ active, onPick }: { active: number; onPick: (i: number) => void }) {
  const faq = faqs[active];
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-[400px] select-none sm:max-w-none">
      {/* Pencil docked on the top edge, and the top buttons */}
      <span className="absolute -top-[6px] left-[14%] hidden h-[7px] w-[40%] rounded-full bg-gradient-to-b from-[#efe8e1] to-taupe shadow-[0_2px_6px_rgba(0,0,0,0.35)] sm:block" />
      <span className="absolute -top-[3px] right-[10%] h-[3px] w-10 rounded-t bg-[#4a4647]" />
      <span className="absolute -top-[3px] right-[calc(10%+3rem)] h-[3px] w-6 rounded-t bg-[#4a4647]" />

      {/* Body + bezel */}
      <div className="relative rounded-[30px] bg-gradient-to-br from-[#4a4647] via-[#2f2c2d] to-[#1a1819] p-[3px] shadow-[0_60px_120px_-40px_rgba(0,0,0,0.85),0_30px_60px_-30px_rgba(86,18,38,0.55)] sm:rounded-[34px]">
        <div className="relative rounded-[27px] bg-[#0f0e0e] p-[10px] sm:rounded-[31px] sm:p-3">
          <span className="absolute left-1/2 top-[3px] h-1 w-1 -translate-x-1/2 rounded-full bg-[#2b2a33] ring-1 ring-[#3a3940] sm:top-[4px]" />

          {/* Screen */}
          <div className="relative flex aspect-[3/4] flex-col overflow-hidden rounded-[18px] bg-charcoal-deep text-paper sm:aspect-[1.43] sm:rounded-[20px]">
            <StatusBar />
            <div className="flex min-h-0 flex-1">
              <Inbox active={active} onPick={onPick} />
              <ReadingPane faq={faq} index={active} />
            </div>
            {/* Glass sheen */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.06)_0%,transparent_35%)]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="flex h-7 shrink-0 items-center justify-between px-5 text-[10px] font-semibold text-paper/80">
      <span>9:41</span>
      <span className="flex items-center gap-1.5">
        <Wifi className="h-3 w-3" strokeWidth={2.5} />
        <span>100%</span>
        <BatteryFull className="h-3.5 w-3.5" strokeWidth={2} />
      </span>
    </div>
  );
}

function Inbox({ active, onPick }: { active: number; onPick: (i: number) => void }) {
  return (
    <div className="hidden w-[37%] shrink-0 flex-col border-r border-paper/[0.07] bg-[#232122] sm:flex">
      <div className="px-4 pb-2 pt-1">
        <div className="flex items-baseline justify-between">
          <span className="text-[15px] font-semibold md:text-base">Questions</span>
          <span className="text-[9px] uppercase tracking-[0.14em] text-paper/40">{faqs.length} open</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 rounded-md bg-paper/[0.06] px-2 py-1 text-[10px] text-paper/35">
          <Search className="h-2.5 w-2.5" strokeWidth={2.5} />
          Search
        </div>
      </div>
      <ul className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {faqs.map((f, i) => {
          const on = i === active;
          return (
            <li key={f.q}>
              <button
                type="button"
                tabIndex={-1}
                onClick={() => onPick(i)}
                className={`block w-full rounded-lg px-2.5 py-[7px] text-left transition-colors ${
                  on ? "bg-burgundy" : "hover:bg-paper/[0.04]"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className={`truncate text-[10.5px] font-semibold ${on ? "text-paper" : "text-paper/85"}`}>
                    {f.topic}
                  </span>
                  <span className={`text-[8.5px] ${on ? "text-paper/70" : "text-paper/35"}`}>Q.{num(i)}</span>
                </span>
                <span className={`mt-0.5 block truncate text-[9.5px] ${on ? "text-paper/75" : "text-paper/40"}`}>
                  {f.q}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ReadingPane({ faq, index }: { faq: Faq; index: number }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      {/* Toolbar */}
      <div className="flex h-8 shrink-0 items-center justify-between border-b border-paper/[0.07] px-4 text-rose">
        <span className="flex items-center gap-0.5 text-[10.5px] sm:invisible">
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.25} />
          Questions
        </span>
        <span className="flex items-center gap-3">
          <Star className="h-3 w-3" strokeWidth={2} />
          <Reply className="h-3.5 w-3.5" strokeWidth={2} />
        </span>
      </div>

      {/* Message — remounts per question so the reply re-types */}
      <div key={index} className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-4 pt-4 md:px-6">
        <span className="text-[9px] uppercase tracking-[0.18em] text-rose">
          {faq.topic} · Q.{num(index)}
        </span>
        <h3 className="mt-1.5 font-display text-[17px] font-semibold leading-tight tracking-[-0.01em] md:text-xl">
          {faq.q}
        </h3>

        <div className="mt-3 flex items-center gap-2.5 border-b border-paper/[0.07] pb-3">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-burgundy">
            <LogoMark className="h-4 w-4 text-paper" />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block text-[11px] font-semibold">Celestial team</span>
            <span className="block truncate text-[9.5px] text-paper/40">{TEAM_EMAIL}</span>
          </span>
          <span className="ml-auto text-[9.5px] text-paper/35">now</span>
        </div>

        <TypedReply text={faq.a} />
      </div>

      {/* Reply bar */}
      <div className="shrink-0 border-t border-paper/[0.07] px-4 py-2.5">
        <a
          href={mailto(`Re: ${faq.q}`)}
          tabIndex={-1}
          className="flex items-center justify-between rounded-full bg-paper/[0.06] py-1 pl-3.5 pr-1 text-[10px] text-paper/40"
        >
          Reply to the team&hellip;
          <span className="rounded-full bg-burgundy px-3 py-1 text-[10px] font-medium text-paper">Send</span>
        </a>
      </div>
    </div>
  );
}

/* A short "typing" pause, then the reply fades in word by word */
function TypedReply({ text }: { text: string }) {
  const reduce = useReducedMotion();
  const [typing, setTyping] = useState(!reduce);

  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => setTyping(false), 650);
    return () => clearTimeout(t);
  }, [reduce]);

  if (typing) {
    return (
      <div className="mt-4 flex items-center gap-2 text-[10px] text-paper/40">
        <span className="flex gap-1">
          {[0, 1, 2].map((d) => (
            <motion.span
              key={d}
              className="h-1.5 w-1.5 rounded-full bg-rose"
              animate={{ opacity: [0.25, 1, 0.25] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }}
            />
          ))}
        </span>
        Celestial team is replying
      </div>
    );
  }

  const words = text.split(" ");
  return (
    <motion.div
      initial={reduce ? false : "hidden"}
      animate="shown"
      variants={{ shown: { transition: { staggerChildren: 0.018 } } }}
      className="mt-4 text-[12px] leading-[1.7] text-paper/80 md:text-[13px]"
    >
      <p>
        {words.map((w, i) => (
          <motion.span
            key={i}
            variants={{
              hidden: { opacity: 0, y: 3, filter: "blur(3px)" },
              shown: { opacity: 1, y: 0, filter: "blur(0px)" },
            }}
            transition={{ duration: 0.3 }}
            className="inline-block whitespace-pre"
          >
            {w + (i < words.length - 1 ? " " : "")}
          </motion.span>
        ))}
      </p>
      <motion.p
        variants={{ hidden: { opacity: 0 }, shown: { opacity: 1 } }}
        className="mt-3 text-paper/45"
      >
        — Celestial team
      </motion.p>
    </motion.div>
  );
}

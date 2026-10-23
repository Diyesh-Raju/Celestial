"use client";

import { useCallback, useRef, useState, type KeyboardEvent } from "react";
import { useReducedMotion } from "framer-motion";
import { promises } from "@/lib/data";
import { Binder, type Turn } from "./notebook/Binder";
import { Reveal, SectionLabel } from "./Reveal";

const COUNT = promises.length;

// Under the hero: four promises, each a spread of handwritten notes in a burgundy
// leather binder screwed to the wall. The buttons are tabs that turn its pages.
export function Notebook() {
  const reduce = useReducedMotion() ?? false;
  const [view, setView] = useState<{ shown: number; turn: Turn | null }>({ shown: 0, turn: null });
  // Until the first turn, the opening spread writes itself in when it comes into view
  const [fresh, setFresh] = useState(true);
  const turns = useRef(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // The spread being turned to counts as current straight away
  const active = view.turn ? view.turn.to : view.shown;

  const goTo = (i: number) => {
    if (i < 0 || i >= COUNT || i === active) return;
    setFresh(false);
    const key = ++turns.current;
    setView((v) => {
      // Clicked mid-turn: that turn jumps to its end and the new one starts from there
      const from = v.turn ? v.turn.to : v.shown;
      return reduce ? { shown: i, turn: null } : { shown: from, turn: { from, to: i, key } };
    });
  };

  const onTurnEnd = useCallback((key: number) => {
    setView((v) => (v.turn?.key === key ? { shown: v.turn.to, turn: null } : v));
  }, []);

  // Arrow keys move between tabs (and turn the pages), as in any tab list
  const onKeyDown = (e: KeyboardEvent) => {
    const next = { ArrowDown: active + 1, ArrowRight: active + 1, ArrowUp: active - 1, ArrowLeft: active - 1, Home: 0, End: COUNT - 1 }[
      e.key
    ];
    if (next === undefined) return;
    e.preventDefault();
    const i = Math.min(COUNT - 1, Math.max(0, next));
    tabRefs.current[i]?.focus();
    goTo(i);
  };

  const p = promises[active];

  return (
    <section
      id="notebook"
      aria-labelledby="notebook-title"
      className="relative scroll-mt-24 overflow-hidden px-4 py-24 sm:px-6 md:py-32"
      style={{ background: "#f6f1e9" }}
    >
      <div className="mx-auto grid max-w-6xl gap-y-12 [grid-template-areas:'head'_'book'_'list'] lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-x-14 lg:gap-y-10 lg:[grid-template-areas:'head_book'_'list_book']">
        <Reveal className="px-1 [grid-area:head] sm:px-0 lg:self-end">
          <SectionLabel tone="burgundy">The Celestial notebook</SectionLabel>
          <h2
            id="notebook-title"
            className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.025em] text-burgundy md:text-5xl"
          >
            Four promises, <span className="text-shine block">in writing.</span>
          </h2>
          <p className="mt-5 max-w-sm text-ink/65">
            What matters most goes on paper before a line of code. Pick a promise to turn to its page.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="px-1 [grid-area:list] sm:px-0 lg:self-start">
          <div role="tablist" aria-label="Our promises" aria-orientation="vertical" onKeyDown={onKeyDown} className="border-b border-ink/10">
            {promises.map((item, i) => {
              const on = i === active;
              return (
                <button
                  key={item.title}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  id={`notebook-tab-${i}`}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  aria-controls="notebook-page"
                  tabIndex={on ? 0 : -1}
                  onClick={() => goTo(i)}
                  className="group flex w-full items-center gap-4 border-t border-ink/10 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-burgundy md:py-5"
                >
                  <span
                    className={`w-7 shrink-0 font-condensed text-sm tracking-[0.08em] transition-colors duration-300 ${
                      on ? "text-burgundy" : "text-taupe group-hover:text-taupe-dark"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`flex-1 font-display text-xl font-semibold tracking-[-0.015em] transition-colors duration-300 md:text-[1.4rem] ${
                      on ? "text-burgundy" : "text-ink/45 group-hover:text-ink/75"
                    }`}
                  >
                    {item.title}
                  </span>
                  {/* A small gold stud, like the ones holding the binder, marks the open page */}
                  <span
                    aria-hidden
                    className={`h-2.5 w-2.5 shrink-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,#fffaf0,#ecca86_40%,#c99a52_70%,#6b4818)] shadow-[0_1px_2px_rgba(40,10,14,0.45)] transition duration-300 ${
                      on ? "scale-100 opacity-100" : "scale-50 opacity-0"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </Reveal>

        <Reveal delay={0.15} className="[grid-area:book] lg:self-center">
          <Binder
            shown={view.shown}
            turn={view.turn}
            fresh={fresh}
            onTurnEnd={onTurnEnd}
            onPrev={active > 0 ? () => goTo(active - 1) : undefined}
            onNext={active < COUNT - 1 ? () => goTo(active + 1) : undefined}
          />
        </Reveal>

        {/* What the open spread says, for screen readers (the binder itself is decorative) */}
        <div role="tabpanel" id="notebook-page" aria-labelledby={`notebook-tab-${active}`} className="sr-only">
          <h3>{p.heading.join(" ")}</h3>
          <p>{p.body}</p>
          <ul>
            {p.ticks.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <p>{p.note.replace(/[[\]]/g, "")}</p>
        </div>
      </div>
    </section>
  );
}

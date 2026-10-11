"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

/* A dropdown styled to sit on the light form (the native <select> menu can't be
   styled). A hidden input carries the value, so the form reads it like any field. */
export function TopicSelect({
  id,
  name,
  options,
  placeholder,
  className,
}: {
  id: string;
  name: string;
  options: string[];
  placeholder: string;
  className: string;
}) {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const listId = useId();
  const optionId = (i: number) => `${listId}-${i}`;

  // Close on a click anywhere outside
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  useEffect(() => {
    if (open) list.current?.focus();
  }, [open]);

  useEffect(() => {
    if (open) document.getElementById(optionId(active))?.scrollIntoView({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, open]);

  function show() {
    setActive(Math.max(0, options.indexOf(value)));
    setOpen(true);
  }

  function choose(i: number) {
    setValue(options[i]);
    setOpen(false);
    button.current?.focus();
  }

  function onButtonKey(e: KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      show();
    }
  }

  function onListKey(e: KeyboardEvent) {
    const last = options.length - 1;
    const moves: Record<string, () => void> = {
      ArrowDown: () => setActive((a) => Math.min(last, a + 1)),
      ArrowUp: () => setActive((a) => Math.max(0, a - 1)),
      Home: () => setActive(0),
      End: () => setActive(last),
      Enter: () => choose(active),
      " ": () => choose(active),
      Escape: () => {
        setOpen(false);
        button.current?.focus();
      },
    };
    if (e.key === "Tab") return setOpen(false);
    const move = moves[e.key];
    if (move) {
      e.preventDefault();
      move();
    }
  }

  return (
    <div ref={root} className="relative">
      <input type="hidden" name={name} value={value} />
      <button
        ref={button}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onButtonKey}
        className={`${className} flex items-center justify-between pr-5 text-left`}
      >
        <span className={value ? "text-ink" : "text-taupe"}>{value || placeholder}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-ink/65 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            ref={list}
            id={listId}
            role="listbox"
            tabIndex={-1}
            aria-labelledby={id}
            aria-activedescendant={optionId(active)}
            onKeyDown={onListKey}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-30 max-h-96 origin-top overflow-y-auto rounded-3xl border border-[rgba(255,255,255,0.7)] bg-[linear-gradient(135deg,rgba(242,236,230,0.92),rgba(232,224,216,0.88)_45%,rgba(221,212,202,0.9))] p-2 shadow-[0_24px_60px_-20px_rgba(54,10,22,0.3),inset_0_1px_0_rgba(255,255,255,0.6)] outline-none backdrop-blur-xl"
          >
            {options.map((o, i) => (
              <li
                key={o}
                id={optionId(i)}
                role="option"
                aria-selected={o === value}
                onPointerEnter={() => setActive(i)}
                onClick={() => choose(i)}
                className={`cursor-pointer rounded-2xl px-4 py-3 text-[15px] text-ink transition-colors ${
                  o === value ? "font-semibold" : ""
                } ${i === active ? "bg-[rgba(255,255,255,0.45)]" : ""}`}
              >
                {o}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

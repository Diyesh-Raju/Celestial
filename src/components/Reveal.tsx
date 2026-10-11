"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * Fades its children in when scrolled into view.
 *
 * Content is only hidden while JS is running (the `js` class set by the inline
 * script in layout.tsx), and a timeout there reveals everything if this
 * component never hydrates — so the page can never be stuck blank.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.__revealReady = true;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -60px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} data-reveal="" className={className} style={{ "--delay": `${delay}s` } as CSSProperties}>
      {children}
    </div>
  );
}

export function SectionLabel({
  children,
  tone = "taupe",
}: {
  children: ReactNode;
  tone?: "taupe" | "burgundy";
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] ${
        tone === "taupe" ? "text-taupe-dark" : "text-burgundy"
      }`}
    >
      <span className={`h-px w-6 ${tone === "taupe" ? "bg-taupe" : "bg-burgundy"}`} />
      {children}
    </span>
  );
}

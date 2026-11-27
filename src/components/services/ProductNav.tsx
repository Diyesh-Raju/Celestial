"use client";

import { useEffect, useRef, useState } from "react";
import { products, type ProductSlug } from "@/lib/data";

// How far below the top of the screen a product's section has to reach before it
// counts as the one being read: the fixed header (64px once scrolled) plus this bar
const READ_LINE = 140;

/* The five products in a bar pinned under the site header on the products & services
   page (components/services/ServicesPage.tsx). It slides out from under the header
   once the product index in the hero has scrolled away, marks the product being
   read, and tucks back up at the closing section. On phones the pills scroll
   sideways and keep the current one in view. */
export function ProductNav() {
  const [shown, setShown] = useState(false);
  const [active, setActive] = useState<ProductSlug | null>(null);
  const list = useRef<HTMLUListElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const index = document.getElementById("product-index");
      const end = document.getElementById("services-end");
      const pastIndex = !index || index.getBoundingClientRect().bottom < READ_LINE;
      const beforeEnd = !end || end.getBoundingClientRect().top > window.innerHeight * 0.6;
      setShown(pastIndex && beforeEnd);

      let current: ProductSlug | null = null;
      for (const p of products) {
        const section = document.getElementById(p.slug);
        if (section && section.getBoundingClientRect().top <= READ_LINE) current = p.slug;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Keep the current pill in view when the row is wider than the screen
  useEffect(() => {
    const row = list.current;
    const pill = active && row?.querySelector<HTMLElement>(`[data-slug="${active}"]`);
    if (!row || !pill || row.scrollWidth <= row.clientWidth) return;
    row.scrollTo({ left: pill.offsetLeft - (row.clientWidth - pill.offsetWidth) / 2, behavior: "smooth" });
  }, [active]);

  return (
    <nav
      aria-label="Products"
      inert={!shown}
      className={`fixed inset-x-0 top-16 z-40 border-b border-taupe-light/80 bg-paper/85 backdrop-blur-xl backdrop-saturate-150 transition-[translate,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        shown ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <ul
        ref={list}
        className="mx-auto flex max-w-6xl gap-1.5 overflow-x-auto px-4 py-2 [scrollbar-width:none] md:px-6 xl:justify-between xl:gap-2 [&::-webkit-scrollbar]:hidden"
      >
        {products.map((p, i) => (
          <li key={p.slug} className="shrink-0">
            <a
              href={`#${p.slug}`}
              data-slug={p.slug}
              aria-current={active === p.slug ? "true" : undefined}
              className="flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] text-ink/70 transition-colors duration-300 hover:bg-ink/[0.05] hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy aria-[current=true]:bg-burgundy aria-[current=true]:text-paper md:text-sm"
            >
              <span className="text-[10px] tabular-nums tracking-[0.15em] opacity-60">{String(i + 1).padStart(2, "0")}</span>
              <span className="xl:hidden">{p.short}</span>
              <span className="hidden xl:inline">{p.title}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

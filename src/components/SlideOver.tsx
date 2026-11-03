import type { ReactNode } from "react";

/**
 * Lets the next section slide up over this one: `under` scrolls as normal until
 * its bottom meets the bottom of the screen, then holds still (dimming a little)
 * while `children` rise over it. Landscape desktop only, like the Studio zoom;
 * elsewhere, and in browsers without scroll-driven animations, the two simply
 * follow each other. See "Slide-over" in globals.css.
 */
export function SlideOver({ under, children }: { under: ReactNode; children: ReactNode }) {
  return (
    <div className="slide-over relative">
      <div className="slide-over-under relative">
        {under}
        <div aria-hidden className="slide-over-dim pointer-events-none absolute inset-x-0 bottom-0 hidden" />
      </div>
      <div className="slide-over-cover relative z-[1]">{children}</div>
    </div>
  );
}

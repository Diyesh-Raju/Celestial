import Image from "next/image";
import type { ReactNode } from "react";

/**
 * A space black 16-inch MacBook Pro, lid open, seen square on to its display from a little
 * above so the keyboard, speaker grilles, trackpad and thumb scoop show. The body is
 * a 3D render (public/macbook/mbp.webp, 6000px supersampled down to 3000) with the
 * display cut out of it, so `children` fill .mbp-screen behind it and show through
 * round the notch. Placement: "MacBook" in globals.css.
 */
export function MacBook({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mbp ${className}`}>
      <div className="mbp-screen">
        {children}
        <span aria-hidden className="mbp-glare" />
      </div>
      <Image src="/macbook/mbp.webp" alt="" width={3000} height={2139} unoptimized draggable={false} className="mbp-body" />
    </div>
  );
}

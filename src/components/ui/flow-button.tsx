'use client';
import type { ButtonHTMLAttributes } from 'react';
import { ArrowRight } from 'lucide-react';

// Flow button (21st.dev). Colours come from three CSS variables so it can sit
// on light or dark grounds: --flow-fg (resting ink), --flow-fill (the circle
// that floods in on hover) and --flow-fg-hover (ink on top of that fill).
type FlowButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { text?: string };

export function FlowButton({ text = 'Modern Button', className = '', type = 'button', ...props }: FlowButtonProps) {
  return (
    <button
      type={type}
      {...props}
      className={`group relative flex cursor-pointer items-center gap-1 overflow-hidden rounded-[100px] border-[1.5px] border-[var(--flow-fg)]/40 bg-transparent px-8 py-3 text-sm font-semibold text-[var(--flow-fg)] transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] [--flow-fg:#111111] [--flow-fill:#111111] [--flow-fg-hover:#ffffff] hover:rounded-[12px] hover:border-transparent hover:text-[var(--flow-fg-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--flow-fg)] active:scale-[0.95] ${className}`}
    >
      {/* Left arrow (arr-2) */}
      <ArrowRight
        aria-hidden
        className="absolute left-[-25%] z-[9] h-4 w-4 fill-none stroke-[var(--flow-fg)] transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:left-4 group-hover:stroke-[var(--flow-fg-hover)]"
      />

      {/* Text */}
      <span className="relative z-[1] -translate-x-3 transition-all duration-[800ms] ease-out group-hover:translate-x-3">
        {text}
      </span>

      {/* Circle */}
      <span
        aria-hidden
        className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[var(--flow-fill)] opacity-0 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:h-[220px] group-hover:w-[220px] group-hover:opacity-100"
      />

      {/* Right arrow (arr-1) */}
      <ArrowRight
        aria-hidden
        className="absolute right-4 z-[9] h-4 w-4 fill-none stroke-[var(--flow-fg)] transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:right-[-25%] group-hover:stroke-[var(--flow-fg-hover)]"
      />
    </button>
  );
}

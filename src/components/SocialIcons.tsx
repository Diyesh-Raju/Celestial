import { CONTACT } from "@/lib/data";

// lucide-react 1.x dropped brand icons, so these are inline.
const icons = {
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-full w-full">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z" />
    </svg>
  ),
};

const labels = { instagram: "Instagram", linkedin: "LinkedIn", x: "X (Twitter)" };

export function SocialIcons({ size = "md", light = false }: { size?: "md" | "lg"; light?: boolean }) {
  const box = size === "lg" ? "h-20 w-20 rounded-3xl p-6 md:h-28 md:w-28 md:p-8" : "h-10 w-10 rounded-full p-2.5";
  const tone = light
    ? "border-white/20 bg-white/5 text-white/80 hover:border-white/50 hover:bg-white hover:text-burgundy"
    : "border-taupe-light bg-paper text-ink/80 shadow-[0_10px_30px_-15px_rgba(36,27,28,0.3)] hover:border-burgundy/40 hover:text-burgundy hover:shadow-[0_16px_40px_-12px_rgba(86,18,38,0.45)]";
  return (
    <div className={`flex ${size === "lg" ? "gap-5 md:gap-8" : "gap-3"}`}>
      {(Object.keys(icons) as (keyof typeof icons)[]).map((k) => (
        <a
          key={k}
          href={CONTACT.socials[k]}
          target="_blank"
          rel="noreferrer"
          aria-label={labels[k]}
          className={`${box} ${tone} group relative grid place-items-center border transition duration-300 hover:-translate-y-1`}
        >
          {icons[k]}
        </a>
      ))}
    </div>
  );
}

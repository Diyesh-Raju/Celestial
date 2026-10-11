import { LOGO_C, LOGO_C_STROKE, LOGO_MOON, LOGO_STAR, LOGO_VIEWBOX } from "@/lib/logo";

/* Icon artwork for app/icon.tsx and app/apple-icon.tsx (rendered by ImageResponse):
   the taupe mark on a burgundy gradient tile. */
export function AppIcon({ size, rounded }: { size: number; rounded: boolean }) {
  const mark = Math.round(size * 0.66);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #7a2340 0%, #561226 55%, #360a16 100%)",
        borderRadius: rounded ? size * 0.22 : 0,
      }}
    >
      <svg width={mark} height={mark} viewBox={LOGO_VIEWBOX}>
        <path d={LOGO_C} fill="none" stroke="#E8E0D8" strokeWidth={LOGO_C_STROKE} />
        <path d={LOGO_MOON} fill="#E8E0D8" />
        <path d={LOGO_STAR} fill="#E8E0D8" />
      </svg>
    </div>
  );
}

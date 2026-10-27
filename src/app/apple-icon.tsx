import { ImageResponse } from "next/og";
import { LOGO_PATH, LOGO_VIEWBOX } from "@/lib/logo";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// The taupe mark on a burgundy gradient tile. iOS rounds the corners itself, so the tile stays square.
export default function AppleIcon() {
  const mark = Math.round(size.width * 0.66);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #7a2340 0%, #561226 55%, #360a16 100%)",
        }}
      >
        <svg width={mark} height={mark} viewBox={LOGO_VIEWBOX}>
          <path d={LOGO_PATH} fill="#E8E0D8" />
        </svg>
      </div>
    ),
    size,
  );
}

/* Celestial Developers mark geometry (48×48 box): a circle split down the middle into two
   halves that mirror each other through the centre. Each half is a crescent arc that runs
   into a vertical bar beside the gap, the left bar hanging from the top, the right one
   standing on the bottom. Traced from the master logo artwork. Shared by the SVG mark, the
   app icons (scripts/brand-icons.mjs) and the 3D device logo so they never drift apart. */
export const LOGO_VIEWBOX = "0 0 48 48";

/* One stroke weight throughout: the ring (outer r20, inner r16.6, concentric) and the bars
   are all 3.4 thick. Gap 3.8 wide; bars end 6.4 past the centre line. Filled, with the
   right half being the left one turned 180°. */
export const LOGO_PATH =
  "M22.1 4.09V30.4H18.7V8.27A16.6 16.6 0 0 0 22.1 40.49V43.91A20 20 0 0 1 22.1 4.09Z" +
  "M25.9 43.91V17.6H29.3V39.73A16.6 16.6 0 0 0 25.9 7.51V4.09A20 20 0 0 1 25.9 43.91Z";

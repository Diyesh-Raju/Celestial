/* Celestial Developers mark geometry (48×48 box): a circle split down the middle into two
   halves that mirror each other through the centre. Each half is a crescent arc that runs
   into a vertical bar beside the gap, the left bar hanging from the top, the right one
   standing on the bottom. Traced from the master logo artwork. Shared by the SVG mark, the
   app icons (scripts/brand-icons.mjs) and the 3D device logo so they never drift apart. */
export const LOGO_VIEWBOX = "0 0 48 48";

/* Outer circle r20 at the centre; gap 4.4 wide; bars 2.44 wide and ending 6.25 past the
   centre line; each crescent's inner edge is an r16.8 circle shifted 2.28 toward its own
   bar, so the arc is thick at its ends and thin at the sides. Filled, with the right half
   being the left one turned 180°. */
export const LOGO_PATH =
  "M21.8 4.12V30.25H19.36V7.37A16.8 16.8 0 0 0 21.8 40.8V43.88A20 20 0 0 1 21.8 4.12Z" +
  "M26.2 43.88V17.75H28.64V40.63A16.8 16.8 0 0 0 26.2 7.2V4.12A20 20 0 0 1 26.2 43.88Z";

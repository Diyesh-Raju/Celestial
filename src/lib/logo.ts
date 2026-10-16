/* Celestial Developers mark geometry (48×48 box), "Phase": a half moon split into the
   initials, an outlined C on the left and a filled D on the right with a small gap
   between them. Shared by the SVG mark, the app icons and the 3D device logo so they
   never drift apart. */
export const LOGO_VIEWBOX = "0 0 48 48";

/* The C is a stroked half circle with butt caps; the D is a filled half disc whose
   edge lines up with the C's outer edge */
export const LOGO_C = "M22 7.25A16.75 16.75 0 0 0 22 40.75";
export const LOGO_C_STROKE = 3.5;
export const LOGO_D = "M26 5.5A18.5 18.5 0 0 1 26 42.5Z";

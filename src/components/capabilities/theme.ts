// Shared between the Services section (DOM) and the MacBook scene (WebGL).
// Step 0 is the intro (section heading); steps 1–6 are the capabilities.

export type StepPalette = {
  bg: string;
  fg: string; // headings
  body: string; // paragraphs
  muted: string; // labels, counters
  line: string; // hairlines, chip borders
  accent: string; // numbers, icons, active rail
  chip: string; // chip / icon tile fill
  dark: boolean;
};

const lightText = {
  fg: "#561226",
  body: "rgba(47, 43, 41, 0.74)",
  muted: "#6e6058",
  line: "rgba(86, 18, 38, 0.16)",
  accent: "#561226",
  chip: "rgba(255, 255, 255, 0.45)",
  dark: false,
};

const darkText = {
  fg: "#fbf6f0",
  body: "rgba(251, 246, 240, 0.86)",
  muted: "rgba(251, 246, 240, 0.72)",
  line: "rgba(251, 246, 240, 0.22)",
  accent: "#f0c9cd",
  chip: "rgba(255, 255, 255, 0.08)",
  dark: true,
};

// Colours belong to the capability, not the slot: Automation and CTO Support
// have swapped theirs, so the run goes light, light, dark, light, dark, dark.
export const palettes: StepPalette[] = [
  { bg: "#e8e0d8", ...lightText }, // intro — the site's paper, so the section blends in
  { bg: "#faf7f2", ...lightText }, // 01 Web — white
  { bg: "#eadfcd", ...lightText }, // 02 CRM — beige
  { bg: "#2c1c16", ...darkText }, // 03 Automation — dark chocolate
  { bg: "#bba796", ...lightText, fg: "#360a16", body: "rgba(36, 24, 22, 0.82)", muted: "#4a3c35", accent: "#360a16" }, // 04 Ads — taupe
  { bg: "#4a3026", ...darkText }, // 05 API — chocolate brown
  { bg: "#76635a", ...darkText }, // 06 CTO — dark taupe
];

/** Colour of the leading ring on the background wipe. */
export const WIPE_RIM = "#7a2340";

export type Device = "laptop" | "phone";

/** Odd capabilities (and the intro) show the MacBook, even ones the iPhone. */
export const deviceFor = (step: number): Device => (step > 0 && step % 2 === 0 ? "phone" : "laptop");

export type DeviceLayout = {
  device: Device;
  fx: number; // centre, as a fraction of stage width
  fy: number; // centre, as a fraction of stage height
  fw: number; // max width, fraction of stage width
  fh: number; // max height, fraction of stage height
  maxPx: number; // hard cap on rendered width
  open: number; // laptop lid: 0 closed → 1 open
  tilt: number; // rotation towards the camera (rad)
  yaw: number; // turn (rad); + faces right
};

const isMobileWidth = (w: number) => w < 768;

/** Where the device rests for a step, given the stage width in px. */
export function deviceLayout(step: number, w: number): DeviceLayout {
  const mobile = isMobileWidth(w);
  if (step === 0) {
    return mobile
      ? { device: "laptop", fx: 0.5, fy: 0.6, fw: 0.62, fh: 0.26, maxPx: 400, open: 0, tilt: 0.8, yaw: 0 }
      : { device: "laptop", fx: 0.5, fy: 0.6, fw: 0.28, fh: 0.3, maxPx: 420, open: 0, tilt: 0.8, yaw: 0 };
  }
  // Odd steps: device right, copy left. Even steps: the reverse.
  const right = step % 2 === 1;
  if (deviceFor(step) === "phone") {
    return mobile
      ? { device: "phone", fx: 0.5, fy: 0.36, fw: 0.4, fh: 0.32, maxPx: 200, open: 1, tilt: 0.06, yaw: right ? -0.3 : 0.3 }
      : { device: "phone", fx: right ? 0.69 : 0.31, fy: 0.5, fw: 0.22, fh: 0.6, maxPx: 300, open: 1, tilt: 0.06, yaw: right ? -0.34 : 0.34 };
  }
  if (mobile) {
    return { device: "laptop", fx: 0.5, fy: 0.35, fw: 0.76, fh: 0.3, maxPx: 440, open: 1, tilt: 0.24, yaw: right ? -0.28 : 0.28 };
  }
  return { device: "laptop", fx: right ? 0.69 : 0.31, fy: 0.5, fw: 0.37, fh: 0.56, maxPx: 640, open: 1, tilt: 0.24, yaw: right ? -0.38 : 0.38 };
}

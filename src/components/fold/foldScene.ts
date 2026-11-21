import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { whenIdle } from "../capabilities/threeKit";
import {
  createClockLayers,
  createLayers,
  paintClock,
  paintCover,
  paintInner,
  readFonts,
  type ClockLayers,
  type ClockSpot,
  type FoldFonts,
  type ScreenLayers,
} from "./foldScreens";

// A book-style foldable ("iPhone Duo") built from primitives, after Apple's
// product viewer. The left half folds over the right on a vertical hinge;
// its back carries the cover display. The caller owns the animation loop and
// calls render(state) only when something changed.
//
//   fold  1 = open (inner display: typical agency | Celestial) … 0 = closed
//         (cover display: Celestial only). Desktop holds it landscape; on
//         phones it's held upright, so the top half folds down over the
//         bottom like a lid and the cover reads sideways.
//   fall  the entrance, after the iPhone 18 Pro page: 0 = lying flat, seen
//         edge-on, 1 = swivelled down from its top edge to face the viewer.
//
// The body copies Apple's: a polished natural-titanium frame whose edge is
// rounded front and back (swept as one smooth surface, so the reflections
// run unbroken round the corners), a hair-thin black border round each
// display, flat titanium buttons, pale antenna breaks, and a rounded hinge
// spine that shows down the side when it's closed. A studio environment
// (overhead box, strip lights, dark flags) gives the metal its highlights.
// As on Apple's page the right half stays square on while the left swings
// out towards the camera, and the camera's perspective (wider once it has
// landed) gives the fold its depth.
//
// The displays are painted at several times the on-screen pixel density
// (about 4K across the open screen on a desktop) and sampled down through
// mipmaps, so they stay sharp at rest and while the folding half swings
// towards the camera. At rest they face the camera square on, exactly on the
// plane the layout is measured at, and the view is nudged by sub-pixel
// amounts to sit them on the pixel grid.

// Model (world units at scale 1): open width, height, thickness of each half
const W = 2.8;
const H = 2.0;
const T = 0.055;
const R = 0.21; // outer corner radius
const RH = 0.03; // corner radius beside the hinge
const G = 0; // gap between the halves
const B = 0.037; // frame edge to display edge: a sliver of metal, then the black border
const LIP = 0.016; // how much of the frame shows in front of the glass
const RF = 0.021; // rounding of the frame's front and back edges
const AX = 0.003; // hinge axis, just in front of the display plane
const FRONT = -0.0015; // front of the frame, behind the displays (which sit at z = 0)
const BACK = FRONT - T;
const ZMID = (FRONT + BACK) / 2;
const DW = W - 2 * B; // inner display (both halves)
const DH = H - 2 * B;
const CW = W / 2 - G / 2 - 2 * B; // cover display
const RD = R - B; // display corners, concentric with the frame's
const RDH = 0.05; // the cover display's corners beside the hinge
/** How far in front of the display plane the cover display sits when closed (scale 1). */
const Z_COVER = 2 * AX - BACK + 0.0012;

// Camera. While it lies flat and swivels in, a long lens (as on Apple's
// iPhone page: a wide one would make the near edge balloon); once it has
// landed, a wider one, as in Apple's foldable viewer, so the half swinging
// out comes towards you. The display plane's scale is the same through
// either, so changing lens never moves or resizes a display at rest.
const FOV_FALL = 9;
const FOV_FOLD = 24; // held landscape
const FOV_FOLD_UPRIGHT = 18; // held upright on a phone: less, so the near edge stays inside the screen
const HALF_H = 3.6; // half the view's height at the display plane, world units
const camDist = (fov: number) => HALF_H / Math.tan(THREE.MathUtils.degToRad(fov / 2));
/** The canvas reaches this far (fraction of the stage height) above and below the stage, for the fold's perspective. */
const OVERFLOW = 0.24;
/** On phones it also reaches this far past each side (px), into the section's padding. */
const OVERFLOW_X = 16;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = THREE.MathUtils.lerp;
const frac = (v: number) => v - Math.floor(v);
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export type FoldState = {
  fold: number;
  fall: number;
  /** How far the inner display's points have cascaded in, 0–1. */
  innerReveal: number;
  /** The same for the cover display. */
  coverReveal: number;
  /** How visible the inner display's points are (they fade slowly as it folds), 0–1. */
  innerFade: number;
  coverFade: number;
  /** The status bar clock rolling from one time to the next; t 0 → 1. */
  clockFrom: string;
  clockTo: string;
  clockT: number;
};

// The displays' shader. Composites the base layer (background and boxes)
// with the points layer, which cascades in top to bottom (the left box a
// beat ahead of the right), each line rising a few pixels as it fades in,
// and fades out as a whole while the device folds. On top goes the status
// bar clock, whose changed digits roll up and away as the new ones roll in.
// Blending happens on the sRGB values, exactly as the 2D canvas composites,
// so at rest the result is the painted screen pixel for pixel.
const SCREEN_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
const SCREEN_FRAG = /* glsl */ `
uniform sampler2D uBase;
uniform sampler2D uRows;
uniform sampler2D uClockS; // clock digits that stay
uniform sampler2D uClockA; // digits leaving
uniform sampler2D uClockB; // digits arriving
uniform vec4 uClockRect;   // x, y, width, height on the screen (0–1, from the top left)
uniform float uClockT;
uniform float uReveal;
uniform float uFade;
uniform float uBright;
uniform float uGrad;  // extra darkening towards the outer edge (the left half's copy, turning away)
uniform vec2 uOrigin; // texture position of the screen's top-left corner
uniform vec2 uDown;   // texture direction of the screen's "down"
uniform vec2 uRight;  // and of its "right"
varying vec2 vUv;
vec3 toLinear(vec3 c) {
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(vec3(0.04045), c));
}
vec4 clockAt(sampler2D t, vec2 p) {
  float inside = step(0.0, p.x) * step(p.x, 1.0) * step(0.0, p.y) * step(p.y, 1.0);
  return texture2D(t, vec2(p.x, 1.0 - p.y)) * inside;
}
void main() {
  vec2 d = vUv - uOrigin;
  float sx = dot(d, uRight);
  float sy = dot(d, uDown);
  float r = clamp(uReveal * 1.92 - (sy * 0.78 + sx * 0.14), 0.0, 1.0);
  r = r * r * (3.0 - 2.0 * r);
  float a = r * uFade;
  vec4 rows = texture2D(uRows, vUv - uDown * (1.0 - r) * 0.014);
  vec3 c = texture2D(uBase, vUv).rgb * (1.0 - rows.a * a) + rows.rgb * a;
  vec2 cl = vec2((sx - uClockRect.x) / uClockRect.z, (sy - uClockRect.y) / uClockRect.w);
  if (cl.x >= 0.0 && cl.x <= 1.0 && cl.y >= 0.0 && cl.y <= 1.0) {
    // Soft top and bottom edges while the digits roll (none at rest)
    float edge = mix(1.0, smoothstep(0.0, 0.3, cl.y) * smoothstep(1.0, 0.7, cl.y), 4.0 * uClockT * (1.0 - uClockT));
    vec4 still = clockAt(uClockS, cl);
    vec4 gone = clockAt(uClockA, cl + vec2(0.0, uClockT * 0.75)) * (1.0 - uClockT) * edge;
    vec4 come = clockAt(uClockB, cl - vec2(0.0, (1.0 - uClockT) * 0.75)) * uClockT * edge;
    c = c * (1.0 - still.a) + still.rgb;
    c = c * (1.0 - gone.a) + gone.rgb;
    c = c * (1.0 - come.a) + come.rgb;
  }
  float g = uGrad * smoothstep(0.5, 0.0, vUv.x);
  gl_FragColor = vec4(toLinear(c * uBright * (1.0 - g)), 1.0);
  #include <colorspace_fragment>
}`;

export type FoldSceneApi = {
  render: (s: FoldState) => void;
  dispose: () => void;
};

type Radii = [tl: number, tr: number, br: number, bl: number];

function cornerShape(x0: number, y0: number, x1: number, y1: number, [tl, tr, br, bl]: Radii) {
  const s = new THREE.Shape();
  s.moveTo(x0 + bl, y0);
  s.lineTo(x1 - br, y0);
  if (br) s.quadraticCurveTo(x1, y0, x1, y0 + br);
  s.lineTo(x1, y1 - tr);
  if (tr) s.quadraticCurveTo(x1, y1, x1 - tr, y1);
  s.lineTo(x0 + tl, y1);
  if (tl) s.quadraticCurveTo(x0, y1, x0, y1 - tl);
  s.lineTo(x0, y0 + bl);
  if (bl) s.quadraticCurveTo(x0, y0, x0 + bl, y0);
  return s;
}

/** A flat rounded face towards +z, UVs spanning `uv` (x0, y0, x1, y1). */
function face(x0: number, y0: number, x1: number, y1: number, radii: Radii, uv: [number, number, number, number] = [x0, y0, x1, y1]) {
  const geo = new THREE.ShapeGeometry(cornerShape(x0, y0, x1, y1, radii), 24);
  const pos = geo.attributes.position;
  const uvs = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    uvs.setXY(i, (pos.getX(i) - uv[0]) / (uv[2] - uv[0]), (pos.getY(i) - uv[1]) / (uv[3] - uv[1]));
  }
  return geo;
}

/**
 * A half's glass, front or back: its outline drawn in by `inset`, at depth z,
 * facing +z or (back) −z. With `hinge`, it runs right up to that side, so
 * the two halves' glass meets edge to edge across the fold, like the one
 * flexible display, and its black border runs on unbroken.
 */
function glassFace(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  radii: Radii,
  inset: number,
  z: number,
  back: boolean,
  hinge?: "left" | "right",
) {
  const r = radii.map((v) => Math.max(0.002, v - inset)) as Radii;
  const HR = 0.014; // corner beside the hinge, kept inside the frame's
  if (hinge === "left") r[0] = r[3] = HR;
  if (hinge === "right") r[1] = r[2] = HR;
  const geo = new THREE.ShapeGeometry(
    cornerShape(hinge === "left" ? x0 : x0 + inset, y0 + inset, hinge === "right" ? x1 : x1 - inset, y1 - inset, r),
    24,
  );
  geo.translate(0, 0, z);
  if (back) {
    // Same outline, turned round to face −z
    const idx = geo.index!;
    for (let i = 0; i < idx.count; i += 3) {
      const a = idx.getX(i + 1);
      idx.setX(i + 1, idx.getX(i + 2));
      idx.setX(i + 2, a);
    }
    geo.computeVertexNormals();
  }
  return geo;
}

type Edge = "top" | "bottom" | "left" | "right";
type Break = { edge: Edge; at: number };
const BREAK_W = 0.014; // antenna break width

/**
 * One half's frame: its rounded-rectangle outline swept with the frame's
 * cross-section (front lip, rounded edge, side, rounded edge, back lip),
 * with normals worked out exactly, so the metal shades smoothly all the way
 * round. Group 0 is the metal, group 1 the antenna breaks.
 */
function frameGeometry(x0: number, y0: number, x1: number, y1: number, radii: Radii, breaks: Break[]) {
  const [tl, tr, br, bl] = radii;
  // Outline, counter-clockwise, with outward normals. `band` marks the
  // segment starting at each point as an antenna break.
  const px: number[] = [];
  const py: number[] = [];
  const nx: number[] = [];
  const ny: number[] = [];
  const band: boolean[] = [];
  const straight = (ax: number, ay: number, bx: number, by: number, onx: number, ony: number, edge: Edge) => {
    const len = Math.hypot(bx - ax, by - ay);
    if (len < 1e-6) return;
    const horizontal = edge === "top" || edge === "bottom";
    const spans: [number, number][] = [];
    const ts = [0];
    for (const b of breaks) {
      if (b.edge !== edge) continue;
      const c = horizontal ? (b.at - ax) / (bx - ax) : (b.at - ay) / (by - ay);
      const hw = BREAK_W / 2 / len;
      if (c - hw > 0 && c + hw < 1) {
        spans.push([c - hw, c + hw]);
        ts.push(c - hw, c + hw);
      }
    }
    const n = Math.max(1, Math.ceil(len / 0.1));
    for (let i = 1; i < n; i++) ts.push(i / n);
    ts.sort((p, q) => p - q);
    const uniq = ts.filter((t, i) => i === 0 || t - ts[i - 1] > 1e-5);
    uniq.forEach((t, i) => {
      const next = uniq[i + 1] ?? 1;
      const mid = (t + next) / 2;
      px.push(ax + (bx - ax) * t);
      py.push(ay + (by - ay) * t);
      nx.push(onx);
      ny.push(ony);
      band.push(spans.some(([s0, s1]) => mid > s0 && mid < s1));
    });
  };
  const arc = (cx: number, cy: number, r: number, a0: number) => {
    const n = 6 + Math.round(r * 100);
    for (let i = 0; i < n; i++) {
      const a = a0 + (Math.PI / 2) * (i / n);
      px.push(cx + r * Math.cos(a));
      py.push(cy + r * Math.sin(a));
      nx.push(Math.cos(a));
      ny.push(Math.sin(a));
      band.push(false);
    }
  };
  straight(x0 + bl, y0, x1 - br, y0, 0, -1, "bottom");
  arc(x1 - br, y0 + br, br, -Math.PI / 2);
  straight(x1, y0 + br, x1, y1 - tr, 1, 0, "right");
  arc(x1 - tr, y1 - tr, tr, 0);
  straight(x1 - tr, y1, x0 + tl, y1, 0, 1, "top");
  arc(x0 + tl, y1 - tl, tl, Math.PI / 2);
  straight(x0, y1 - tl, x0, y0 + bl, -1, 0, "left");
  arc(x0 + bl, y0 + bl, bl, Math.PI);

  // Cross-section, front to back round the outside: d = outward offset, z, and the normal in (d, z)
  const prof: { d: number; z: number; nr: number; nz: number }[] = [];
  const IN = -(LIP + 0.014); // tucked under the glass
  const N = 12;
  prof.push({ d: IN, z: FRONT, nr: 0, nz: 1 });
  for (let i = 0; i <= N; i++) {
    const a = (Math.PI / 2) * (1 - i / N);
    prof.push({ d: -RF + RF * Math.cos(a), z: FRONT - RF + RF * Math.sin(a), nr: Math.cos(a), nz: Math.sin(a) });
  }
  for (let i = 0; i <= N; i++) {
    const a = -(Math.PI / 2) * (i / N);
    prof.push({ d: -RF + RF * Math.cos(a), z: BACK + RF + RF * Math.sin(a), nr: Math.cos(a), nz: Math.sin(a) });
  }
  prof.push({ d: IN, z: BACK, nr: 0, nz: -1 });

  const np = px.length;
  const nq = prof.length;
  const pos = new Float32Array(np * nq * 3);
  const nor = new Float32Array(np * nq * 3);
  for (let i = 0; i < np; i++) {
    for (let j = 0; j < nq; j++) {
      const q = prof[j];
      const k = (i * nq + j) * 3;
      pos[k] = px[i] + nx[i] * q.d;
      pos[k + 1] = py[i] + ny[i] * q.d;
      pos[k + 2] = q.z;
      nor[k] = nx[i] * q.nr;
      nor[k + 1] = ny[i] * q.nr;
      nor[k + 2] = q.nz;
    }
  }
  const metal: number[] = [];
  const bands: number[] = [];
  for (let i = 0; i < np; i++) {
    const i2 = (i + 1) % np;
    const out = band[i] ? bands : metal;
    for (let j = 0; j < nq - 1; j++) {
      const a = i * nq + j;
      const b = i2 * nq + j;
      const c = i2 * nq + j + 1;
      const d = i * nq + j + 1;
      out.push(a, d, b, b, d, c);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  geo.setIndex([...metal, ...bands]);
  geo.addGroup(0, metal.length, 0);
  geo.addGroup(metal.length, bands.length, 1);
  return geo;
}

/**
 * The hinge spine: half an elliptical tube behind the hinge axis (local z ≤ 0),
 * `a` either side of it, `b` deep, `h` long, with rounded ends. Trimmed by
 * `phi0` at its edges so, open, it stays hidden behind the displays.
 */
function spineGeometry(a: number, b: number, h: number, end: number, phi0: number) {
  const NU = 32;
  const NE = 10;
  const rows: [y: number, s: number][] = [];
  for (let k = 0; k <= NE; k++) {
    const t = (k / NE) * (Math.PI / 2);
    rows.push([-h / 2 + end * (1 - Math.cos(t)), Math.max(0.02, Math.sin(t))]);
  }
  for (let k = NE; k >= 0; k--) {
    const t = (k / NE) * (Math.PI / 2);
    rows.push([h / 2 - end * (1 - Math.cos(t)), Math.max(0.02, Math.sin(t))]);
  }
  const pos: number[] = [];
  for (const [y, s] of rows) {
    for (let u = 0; u <= NU; u++) {
      const p = phi0 + (Math.PI - 2 * phi0) * (u / NU);
      pos.push(a * s * Math.cos(p), y, -b * s * Math.sin(p));
    }
  }
  const idx: number[] = [];
  for (let r = 0; r < rows.length - 1; r++) {
    for (let u = 0; u < NU; u++) {
      const A = r * (NU + 1) + u;
      const Bq = A + 1;
      const C = A + NU + 1;
      const D = C + 1;
      idx.push(A, Bq, C, Bq, D, C);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

/**
 * The studio the metal reflects, in world space (the camera looks down −z).
 * Laid out for the sliver of frame seen round each display, which (like
 * Apple's) reads from the glass outwards as a bright polished line, a dark
 * band, then a pale rim: tall strip lights out to either side of the camera,
 * dark flags level with the phone, and soft walls behind it. Above, a big
 * overhead box and one high behind the camera light the top edges; a black
 * card straight behind the camera keeps the glass black at rest.
 */
function studioScene() {
  const s = new THREE.Scene();
  const walls = new THREE.Mesh(
    new THREE.SphereGeometry(30, 64, 32),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      vertexShader: /* glsl */ `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        varying vec3 vDir;
        void main() {
          float y = vDir.y;
          vec3 ground = vec3(0.12, 0.114, 0.108);
          vec3 horizon = vec3(0.56, 0.54, 0.51);
          vec3 sky = vec3(0.95, 0.93, 0.9);
          vec3 c = mix(ground, horizon, smoothstep(-0.55, 0.0, y));
          c = mix(c, sky, smoothstep(0.08, 0.95, y));
          gl_FragColor = vec4(c, 1.0);
        }`,
    }),
  );
  s.add(walls);
  const panel = (w: number, h: number, intensity: number, at: [number, number, number], tint = 0xffffff) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(tint).multiplyScalar(intensity), side: THREE.DoubleSide }),
    );
    m.position.set(...at);
    m.lookAt(0, 0, 0);
    s.add(m);
  };
  panel(16, 6, 3.2, [0, 12, 1]); // overhead
  panel(3, 16, 3.6, [-9, 1, 9], 0xfff6ee); // strip lights either side of the camera
  panel(3, 16, 3.0, [9, 1, 9], 0xf4f6ff);
  panel(12, 3, 2.6, [0, 9, 9]); // high behind the camera
  panel(12, 3, 0.7, [0, -9, 9]); // a little bounce from below
  panel(7, 20, 0, [-13, 0, 1]); // flags level with the phone
  panel(7, 20, 0, [13, 0, 1]);
  panel(9, 7, 0, [0, 0, 14]); // black card behind the camera
  panel(22, 12, 1.2, [0, 1, -16]); // backdrop
  return s;
}

/**
 * Largest scale ≤ `guess` at which a display `worldW` wide renders to a whole
 * number of device pixels, and its height (worldW × aspect) very nearly does too.
 */
function snapScale(guess: number, worldW: number, aspect: number, pxPerUnit: number) {
  const n0 = Math.floor(worldW * guess * pxPerUnit);
  let best = n0;
  let err = 1;
  // A few pixels at most, so open and closed never visibly differ in size
  for (let n = n0; n > n0 - 5 && n > 8; n--) {
    const h = n * aspect;
    const e = Math.abs(h - Math.round(h));
    if (e < err - 1e-6) {
      err = e;
      best = n;
    }
    if (e < 0.04) break;
  }
  return best / (worldW * pxPerUnit);
}

export async function createFoldScene({
  canvas,
  context,
  reduced,
}: {
  canvas: HTMLCanvasElement;
  context: WebGL2RenderingContext;
  reduced: boolean;
}): Promise<FoldSceneApi> {
  const host = canvas.parentElement!;
  const renderer = new THREE.WebGLRenderer({ canvas, context, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV_FALL, 1, 1, 100);
  let camFov = NaN;

  await whenIdle();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const studio = studioScene();
  const envTarget = pmrem.fromScene(studio, 0.02, 0.1, 100, { size: 512 });
  studio.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.geometry.dispose();
      (o.material as THREE.Material).dispose();
    }
  });
  scene.environment = envTarget.texture;

  // A little direct light for the glass and the buttons' edges
  const key = new THREE.DirectionalLight(0xffffff, 0.6);
  key.position.set(-3, 6, 5);
  scene.add(key);

  await whenIdle();

  /* ── Materials ── */
  // Natural titanium, polished
  const titanium = new THREE.MeshPhysicalMaterial({ color: "#cdc7bd", metalness: 1, roughness: 0.17 });
  const breakMat = new THREE.MeshStandardMaterial({ color: "#d9d5ce", metalness: 0, roughness: 0.5 });
  const blackGlass = new THREE.MeshPhysicalMaterial({ color: 0x020203, metalness: 0, roughness: 0.05 });
  const backGlass = new THREE.MeshStandardMaterial({ color: "#c7c0b5", metalness: 0.2, roughness: 0.5 });

  // Each display: its layers (see foldScreens.ts) as raw sRGB textures
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const layerTex = (img: HTMLCanvasElement, overlay: boolean) => {
    const t = new THREE.CanvasTexture(img);
    t.anisotropy = maxAniso;
    t.premultiplyAlpha = overlay; // clean edges for the transparent layers once mipmapped
    return t;
  };
  type Screen = {
    layers: ScreenLayers;
    clock: ClockLayers;
    tex: THREE.CanvasTexture[]; // base, rows
    clockTex: THREE.CanvasTexture[]; // still, leaving, arriving
    uniforms: Record<string, THREE.IUniform>;
    spot: ClockSpot | null;
    scale: number;
    clockFrom: string;
    clockTo: string;
  };
  const makeScreen = (): Screen => {
    const layers = createLayers();
    const clock = createClockLayers();
    const tex = [layerTex(layers.base, false), layerTex(layers.rows, true)];
    const clockTex = [layerTex(clock.still, true), layerTex(clock.from, true), layerTex(clock.to, true)];
    return {
      layers,
      clock,
      tex,
      clockTex,
      spot: null,
      scale: 1,
      clockFrom: "",
      clockTo: "",
      uniforms: {
        uBase: { value: tex[0] },
        uRows: { value: tex[1] },
        uClockS: { value: clockTex[0] },
        uClockA: { value: clockTex[1] },
        uClockB: { value: clockTex[2] },
        uClockRect: { value: new THREE.Vector4(0, 0, 0.0001, 0.0001) },
        uClockT: { value: 1 },
        uReveal: { value: 0 },
        uFade: { value: 1 },
        uOrigin: { value: new THREE.Vector2(0, 1) },
        uDown: { value: new THREE.Vector2(0, -1) },
        uRight: { value: new THREE.Vector2(1, 0) },
      },
    };
  };
  /** Upload a texture, giving it fresh storage if its canvas changed size (WebGL2 storage is fixed-size). */
  const upload = (t: THREE.CanvasTexture) => {
    const img = t.image as HTMLCanvasElement;
    if (t.userData.w !== img.width || t.userData.h !== img.height) {
      t.dispose();
      t.userData.w = img.width;
      t.userData.h = img.height;
    }
    t.needsUpdate = true;
    renderer.initTexture(t);
  };
  const inner = makeScreen();
  const cover = makeScreen();
  // Displays are unlit, so they read as light rather than paint. The left
  // half's copy dims as it turns away; the cover lights as it comes round.
  const screenMat = (sc: Screen) =>
    new THREE.ShaderMaterial({
      vertexShader: SCREEN_VERT,
      fragmentShader: SCREEN_FRAG,
      uniforms: { ...sc.uniforms, uBright: { value: 1 }, uGrad: { value: 0 } },
      toneMapped: false,
    });
  const innerRightMat = screenMat(inner);
  const innerLeftMat = screenMat(inner);
  const coverMat = screenMat(cover);
  // The cover glass: reflections only (black, added on top), stronger at a
  // glancing angle, like real glass. Shown only while it moves, so at rest
  // the screens stay perfectly clean. The right half never moves once it has
  // landed, so its glass only catches the light during the entrance. Kept
  // faint (see render): it adds to the finished colour, so any more turns a
  // display milky as it swings, where Apple's simply goes dark.
  const glass = () =>
    new THREE.MeshPhysicalMaterial({
      color: 0x000000,
      metalness: 0,
      roughness: 0.04,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0,
      envMapIntensity: 0.25,
    });
  const glassMoving = glass();
  const glassStill = glass();
  const shadowTex = shadowTexture();
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, alphaMap: shadowTex, transparent: true, depthWrite: false, opacity: 0 });

  /* ── Device ── */
  const fallPivot = new THREE.Group(); // the top edge, for the entrance
  const body = new THREE.Group(); // centre: scale, orientation
  const shift = new THREE.Group(); // keeps the visible part centred as it folds
  scene.add(fallPivot);
  fallPivot.add(body);
  body.add(shift);

  const innerUV: [number, number, number, number] = [-DW / 2, -DH / 2, DW / 2, DH / 2];
  const glassMeshes: THREE.Mesh[] = [];
  const addDisplay = (parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, glassMat: THREE.Material, flip = false) => {
    const m = new THREE.Mesh(geo, mat);
    const g = new THREE.Mesh(geo, glassMat);
    g.position.z = 0.0012;
    g.renderOrder = 2;
    glassMeshes.push(g);
    if (flip) {
      // Faces backwards (mirror x), for the outer side of a half
      const holder = new THREE.Group();
      holder.rotation.y = Math.PI;
      holder.position.z = BACK - 0.0012;
      holder.add(m, g);
      parent.add(holder);
    } else parent.add(m, g);
    return m;
  };
  const titaniumParts = [titanium, breakMat];

  // Right half: stays put
  const RIGHT_R: Radii = [RH, R, R, RH];
  const right = new THREE.Group();
  shift.add(right);
  right.add(
    new THREE.Mesh(
      frameGeometry(G / 2, -H / 2, W / 2, H / 2, RIGHT_R, [
        { edge: "top", at: 0.26 },
        { edge: "top", at: 1.12 },
        { edge: "bottom", at: 0.44 },
        { edge: "bottom", at: 1.12 },
        { edge: "right", at: 0.72 },
        { edge: "right", at: -0.72 },
      ]),
      titaniumParts,
    ),
  );
  right.add(new THREE.Mesh(glassFace(G / 2, -H / 2, W / 2, H / 2, RIGHT_R, LIP, FRONT + 0.0004, false, "left"), blackGlass));
  right.add(new THREE.Mesh(glassFace(G / 2, -H / 2, W / 2, H / 2, RIGHT_R, LIP, BACK - 0.0004, true), backGlass));
  const rightGeo = face(0, -DH / 2, DW / 2, DH / 2, [0, RD, RD, 0], innerUV);
  addDisplay(right, rightGeo, innerRightMat, glassStill);
  const shadow = new THREE.Mesh(face(0, -DH / 2, DW / 2, DH / 2, [0, RD, RD, 0]), shadowMat);
  shadow.position.z = 0.0006;
  shadow.renderOrder = 1;
  right.add(shadow);
  // Buttons, flat titanium: two on the top edge, one on the side
  for (const [x, y, w, h] of [
    [0.73, H / 2 - 0.004, 0.16, 0.026],
    [0.95, H / 2 - 0.004, 0.16, 0.026],
    [W / 2 - 0.004, 0.27, 0.026, 0.3],
  ]) {
    const btn = new THREE.Mesh(new RoundedBoxGeometry(w, h, 0.026, 3, 0.011), titanium);
    btn.position.set(x, y, ZMID);
    right.add(btn);
  }

  // Left half: folds about the hinge axis
  const LEFT_R: Radii = [R, RH, RH, R];
  const leftPivot = new THREE.Group();
  leftPivot.position.z = AX;
  shift.add(leftPivot);
  const left = new THREE.Group();
  left.position.z = -AX;
  leftPivot.add(left);
  left.add(
    new THREE.Mesh(
      frameGeometry(-W / 2, -H / 2, -G / 2, H / 2, LEFT_R, [
        { edge: "top", at: -0.26 },
        { edge: "top", at: -1.12 },
        { edge: "bottom", at: -0.44 },
        { edge: "bottom", at: -1.12 },
        { edge: "left", at: 0.72 },
        { edge: "left", at: -0.72 },
      ]),
      titaniumParts,
    ),
  );
  left.add(new THREE.Mesh(glassFace(-W / 2, -H / 2, -G / 2, H / 2, LEFT_R, LIP, FRONT + 0.0004, false, "right"), blackGlass));
  left.add(new THREE.Mesh(glassFace(-W / 2, -H / 2, -G / 2, H / 2, LEFT_R, LIP, BACK - 0.0004, true), blackGlass));
  addDisplay(left, face(-DW / 2, -DH / 2, 0, DH / 2, [RD, 0, 0, RD], innerUV), innerLeftMat, glassMoving);
  // Cover display on its back, laid out as seen when closed (hinge on the left)
  addDisplay(left, face(G / 2 + B, -DH / 2, W / 2 - B, DH / 2, [RDH, RD, RD, RDH]), coverMat, glassMoving, true);

  // Spine: half an elliptical tube round the hinge, turning half as far as
  // the fold. Closed, it runs down the side, covering both halves' edges;
  // open, it tucks in behind the displays. Set a hair inboard so, closed,
  // it meets the body with no light between.
  const SPINE_B = 0.042; // how far it stands out, closed (less the inboard offset)
  const SPINE_PHI = 0.13;
  const SPINE_A = (AX - BACK) / Math.cos(SPINE_PHI) + 0.001;
  const spine = new THREE.Mesh(spineGeometry(SPINE_A, SPINE_B, H - 0.012, 0.05, SPINE_PHI), titanium);
  spine.position.set(0.006, 0, AX);
  shift.add(spine);

  await whenIdle();

  /* ── Layout ── */
  const L = {
    cw: 1,
    ch: 1,
    dpr: 1,
    ppu: 1,
    sOpen: 1,
    sClosed: 1,
    rollOpen: 0,
    upright: false,
    fovFold: FOV_FOLD,
    offOpen: [0, 0],
    offClosed: [0, 0],
  };
  let fonts: FoldFonts | null = null;
  let disposed = false;
  let last: FoldState | null = null;
  let viewX = NaN;
  let viewY = NaN;

  // How much finer than CSS pixels the displays are painted: a power-of-two
  // multiple of the device pixels, at least 4 (so ~4K across the open screen
  // on a desktop), within the GPU's texture limit. At rest each screen pixel
  // then comes from exactly one mipmap level, so it stays crisp. 3x phone
  // screens are already finer than the eye; they get exactly one texel per
  // pixel, which keeps their GPU memory in check.
  const maxTex = Math.min(4096, renderer.capabilities.maxTextureSize);
  const texScale = (cssW: number, cssH: number) => {
    const ratio = L.dpr >= 2.5 ? 1 : Math.pow(2, Math.max(1, Math.ceil(Math.log2(4 / L.dpr))));
    return Math.min(L.dpr * ratio, maxTex / Math.max(cssW, cssH));
  };

  let paintRun = 0;
  /** Paints and uploads both displays a piece at a time, between frames. */
  const paint = async () => {
    const run = ++paintRun;
    const stale = () => disposed || run !== paintRun;
    fonts = readFonts();
    // Each display as it appears on the page (screen orientation): the open
    // one at rest, and the cover when closed
    const ow = (L.upright ? DH : DW) * L.sOpen * L.ppu;
    const oh = (L.upright ? DW : DH) * L.sOpen * L.ppu;
    const cw = (L.upright ? DH : CW) * L.sClosed * L.ppu;
    const ch = (L.upright ? CW : DH) * L.sClosed * L.ppu;
    const jobs: [Screen, number, number, (sc: Screen, k: number) => ClockSpot][] = [
      [inner, ow, oh, (sc, k) => paintInner(sc.layers, ow, oh, k, L.upright, fonts!)],
      [cover, cw, ch, (sc, k) => paintCover(sc.layers, cw, ch, k, L.upright, fonts!)],
    ];
    for (const [sc, w, h, draw] of jobs) {
      await whenIdle();
      if (stale()) return;
      sc.scale = texScale(w, h);
      const spot = draw(sc, sc.scale);
      await whenIdle();
      if (stale()) return;
      upload(sc.tex[0]);
      await whenIdle();
      if (stale()) return;
      upload(sc.tex[1]);
      // Which way is "down" on the screen (held upright, the screen's top
      // runs along the texture's left edge), and where its clock sits
      sc.uniforms.uOrigin.value.set(0, L.upright ? 0 : 1);
      sc.uniforms.uDown.value.set(L.upright ? 1 : 0, L.upright ? 0 : -1);
      sc.uniforms.uRight.value.set(L.upright ? 0 : 1, L.upright ? 1 : 0);
      sc.uniforms.uClockRect.value.set(spot.x / w, spot.y / h, spot.w / w, spot.h / h);
      sc.spot = spot;
      sc.clockFrom = sc.clockTo = ""; // repaint the clock at the new size
    }
    if (last) render(last, true);
  };

  const layout = () => {
    const sw = Math.max(1, host.clientWidth);
    const sh = Math.max(1, host.clientHeight);
    L.upright = sw < 768;
    const over = Math.round(sh * OVERFLOW);
    const overX = L.upright ? OVERFLOW_X : 0;
    canvas.style.top = `${-over}px`;
    canvas.style.height = `${sh + over * 2}px`;
    canvas.style.left = `${-overX}px`;
    canvas.style.width = `${sw + overX * 2}px`;
    L.cw = sw + overX * 2;
    L.ch = sh + over * 2;
    // Full device resolution (up to 3x), so nothing is scaled up by the browser
    L.dpr = Math.min(window.devicePixelRatio || 1, 3);
    renderer.setPixelRatio(L.dpr);
    renderer.setSize(L.cw, L.ch, false);
    camera.aspect = L.cw / L.ch;
    L.ppu = L.ch / (2 * HALF_H);
    L.fovFold = L.upright ? FOV_FOLD_UPRIGHT : FOV_FOLD;
    const px = L.ppu * L.dpr;
    if (!L.upright) {
      const target = Math.min(sw - 48, 1000, (sh - 8) * (W / H));
      L.sOpen = snapScale(target / (W * L.ppu), DW, DH / DW, px);
      L.sClosed = snapScale(L.sOpen, CW, DH / CW, px);
      L.rollOpen = 0;
    } else {
      const open = Math.min((sw - 28) / (H * L.ppu), (sh - 8) / (W * L.ppu));
      L.sOpen = snapScale(open, DH, DW / DH, px);
      L.sClosed = snapScale(L.sOpen, DH, CW / DH, px);
      L.rollOpen = -Math.PI / 2;
    }
    // Sub-pixel view offsets that put each rest pose's display on whole pixels
    const bw = Math.floor(L.cw * L.dpr);
    const bh = Math.floor(L.ch * L.dpr);
    const ow = (L.upright ? DH : DW) * L.sOpen * px;
    const oh = (L.upright ? DW : DH) * L.sOpen * px;
    L.offOpen = [frac((bw - ow) / 2), frac((bh - oh) / 2)];
    const cw = (L.upright ? DH : CW) * L.sClosed * px;
    const chh = (L.upright ? CW : DH) * L.sClosed * px;
    L.offClosed = [frac((bw - cw) / 2), frac((bh - chh) / 2)];
    viewX = viewY = NaN;
  };

  let repaintTimer = 0;
  const onResize = () => {
    layout();
    // Repaint the screens once the size settles, then show them
    clearTimeout(repaintTimer);
    repaintTimer = window.setTimeout(paint, 140);
    if (last) render(last, true);
  };
  layout();
  await paint();
  if (document.fonts && document.fonts.status !== "loaded")
    document.fonts.ready.then(() => {
      if (!disposed) void paint();
    });
  const ro = new ResizeObserver(onResize);
  ro.observe(host);

  /* ── Pose ── */
  function render(s: FoldState, force = false) {
    if (
      !force &&
      last &&
      last.fold === s.fold &&
      last.fall === s.fall &&
      last.innerReveal === s.innerReveal &&
      last.coverReveal === s.coverReveal &&
      last.innerFade === s.innerFade &&
      last.coverFade === s.coverFade &&
      last.clockFrom === s.clockFrom &&
      last.clockTo === s.clockTo &&
      last.clockT === s.clockT
    )
      return;
    last = s;
    const fold = clamp01(s.fold);
    const fall = clamp01(s.fall);
    const theta = Math.PI * (1 - fold);
    const c = (1 - Math.cos(theta)) / 2; // 0 open → 1 closed, eased at both ends
    const sinT = Math.sin(theta);
    const motion = reduced ? 0 : 1;

    // The lens widens as it lands (see FOV_FALL)
    const fov = lerp(FOV_FALL, L.fovFold, smoothstep(0.45, 1, fall));
    const dist = camDist(fov);
    if (fov !== camFov) {
      camFov = fov;
      camera.fov = fov;
      camera.position.set(0, 0, dist);
      camera.near = Math.max(0.5, dist - 14);
      camera.far = dist + 14;
      viewX = viewY = NaN; // re-apply the view offset, which rebuilds the projection
    }

    const scale = lerp(L.sOpen, L.sClosed, c);
    const roll = L.rollOpen;
    // On-screen height, for the entrance pivot (the top edge)
    const wLocal = W - (W / 2) * c;
    const hs = (Math.abs(Math.cos(roll)) * H + Math.abs(Math.sin(roll)) * wLocal) * scale;
    const pivotY = hs / 2;
    // Edge-on to the camera while flat, then swivelling down to face it
    const flat = -(Math.PI / 2 - Math.atan2(pivotY, dist));
    fallPivot.position.set(0, pivotY, 0);
    fallPivot.rotation.x = flat * (1 - fall);
    // Closed, step back so the cover display sits on the display plane
    body.position.set(0, -pivotY, -Z_COVER * scale * c);
    body.scale.setScalar(scale);
    // Square on, as on Apple's page: the right half never turns, and the
    // perspective alone shows the edges as the left half swings out
    body.rotation.set(0, 0, roll);
    // Keep what's visible centred, moving evenly with the slider
    shift.position.x = -(W / 4 + G / 4) * (1 - fold);
    leftPivot.rotation.y = theta;
    spine.rotation.y = theta / 2;

    // Light, as on Apple's: the folding half's display goes dark as it turns
    // away (darkest at its outer edge, like black glass catching nothing),
    // the cover lights as it comes round, and the folding half throws a
    // shadow across the right half that deepens and widens as it closes
    innerLeftMat.uniforms.uBright.value = 0.03 + 0.97 * Math.pow(Math.max(0, Math.cos(theta)), 2);
    innerLeftMat.uniforms.uGrad.value = Math.min(0.8, 1.6 * sinT);
    coverMat.uniforms.uBright.value = 0.03 + 0.97 * Math.pow(Math.max(0, -Math.cos(theta)), 1.6);
    inner.uniforms.uReveal.value = clamp01(s.innerReveal);
    cover.uniforms.uReveal.value = clamp01(s.coverReveal);
    inner.uniforms.uFade.value = clamp01(s.innerFade);
    cover.uniforms.uFade.value = clamp01(s.coverFade);
    // The live clock: repaint its small layers when the time changes
    for (const sc of [inner, cover]) {
      if (sc.spot && fonts && (sc.clockFrom !== s.clockFrom || sc.clockTo !== s.clockTo)) {
        paintClock(sc.clock, sc.spot, sc.scale, fonts, s.clockFrom, s.clockTo);
        sc.clockTex.forEach(upload);
        sc.clockFrom = s.clockFrom;
        sc.clockTo = s.clockTo;
      }
      sc.uniforms.uClockT.value = clamp01(s.clockT);
    }
    shadowMat.opacity = Math.min(1, 0.7 * c + 0.15 * sinT) * (fold < 1 ? 1 : 0);
    shadowTex.repeat.x = 1 / lerp(0.7, 1.6, c);
    shadow.visible = shadowMat.opacity > 0.004;
    glassMoving.opacity = 0.1 * Math.max(Math.pow(sinT, 0.6), 1 - fall) * motion;
    glassStill.opacity = 0.15 * (1 - fall) * motion;
    for (const g of glassMeshes) g.visible = (g.material as THREE.Material).opacity > 0.004;

    // Crisp text: line the rest pose's display up with the pixel grid
    const ox = lerp(L.offOpen[0], L.offClosed[0], c);
    const oy = lerp(L.offOpen[1], L.offClosed[1], c);
    if (ox !== viewX || oy !== viewY) {
      viewX = ox;
      viewY = oy;
      const bw = Math.floor(L.cw * L.dpr);
      const bh = Math.floor(L.ch * L.dpr);
      camera.setViewOffset(bw, bh, ox, oy, bw, bh);
    }
    renderer.render(scene, camera);
  }

  // Compile every shader up front (off the main thread where supported), with
  // everything that can appear switched on
  for (const g of glassMeshes) g.visible = true;
  shadow.visible = true;
  camera.position.set(0, 0, camDist(FOV_FALL));
  camera.updateProjectionMatrix();
  await renderer.compileAsync(scene, camera);

  return {
    render: (s) => render(s),
    dispose() {
      disposed = true;
      clearTimeout(repaintTimer);
      ro.disconnect();
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
        }
      });
      [...inner.tex, ...cover.tex, ...inner.clockTex, ...cover.clockTex, shadowTex].forEach((t) => t.dispose());
      envTarget.dispose();
      pmrem.dispose();
      renderer.resetState();
      renderer.dispose();
    },
  };
}

/** Soft dark falloff from the left edge: the folding half's shadow on the right display. */
function shadowTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 4;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 256, 0);
  g.addColorStop(0, "#fff");
  g.addColorStop(0.35, "#888");
  g.addColorStop(1, "#000");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 4);
  return new THREE.CanvasTexture(c);
}

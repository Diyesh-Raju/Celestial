import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { paintScreen, PHONE_H, PHONE_W } from "./screens";
import { deviceLayout, type Device } from "./theme";
import { LOGO_C, LOGO_C_STROKE, LOGO_MOON, LOGO_STAR } from "@/lib/logo";

// A MacBook and an iPhone built from primitives (no model files to download),
// posed purely from scroll position — stop scrolling and it stops exactly
// where it is:
//   intro → 01  lid opens, screen powers on, laptop glides to its side
//   01 → 02 …   the device flies across with a full turn. Mid-turn it shrinks
//               away (the laptop folding shut as it goes) and the other device
//               grows out of the same point: odd capabilities are the laptop,
//               even ones the phone
// The caller owns the animation loop and calls render(position) each frame.

// Model dimensions (world units at scale 1)
const W = 3.1;
const D = 2.2;
const BASE_H = 0.085;
const LID_H = 0.045;
const LID_GAP = 0.007; // gap between closed lid and deck
const CORNER = 0.14;
const OPEN_ANGLE = THREE.MathUtils.degToRad(106);
const BASE_TOP = BASE_H / 2;

// iPhone (upright, display facing +z)
const PW = 1;
const PH = 2.077;
const PT = 0.112;
const P_CORNER = 0.165;
const P_BEZEL = 0.046;
const PSW = PW - P_BEZEL * 2; // display, matched to the painted screen's aspect
const PSH = PSW * (PHONE_H / PHONE_W);

// Camera
const FOV = 30;
const CAM_DIST = 14;
const HALF_H = CAM_DIST * Math.tan(THREE.MathUtils.degToRad(FOV / 2));

const TAU = Math.PI * 2;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = THREE.MathUtils.lerp;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
/** Angle wrapped to (-π, π]. */
const wrap = (a: number) => a - TAU * Math.floor((a + Math.PI) / TAU);

type Pose = { device: Device; x: number; y: number; s: number; yaw: number; tilt: number; open: number };

export type SceneApi = {
  /** Draw the scene at `position`: 0 = intro, 1–6 = capability, fractions = in between. */
  render: (position: number, now: number) => void;
  dispose: () => void;
};

export type SceneOptions = {
  canvas: HTMLCanvasElement;
  reduced: boolean;
};

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** A flat slab with rounded corners in plan view, centred on the origin, thickness along y. */
function slab(w: number, h: number, d: number, r: number) {
  const geo = new THREE.ExtrudeGeometry(roundedRect(w, d, r), {
    depth: h,
    bevelEnabled: false,
    curveSegments: 18,
  });
  geo.rotateX(-Math.PI / 2);
  geo.center();
  return geo;
}

/** A rounded-rectangle decal lying flat; `up` true faces +y, false faces −y. */
function plate(w: number, d: number, r: number, up: boolean) {
  const geo = new THREE.ShapeGeometry(roundedRect(w, d, r), 12);
  geo.rotateX(up ? -Math.PI / 2 : Math.PI / 2);
  return geo;
}

/** A rounded slab standing upright: rounded corners in the xy plane, thickness along z. */
function upright(w: number, h: number, d: number, r: number) {
  const geo = new THREE.ExtrudeGeometry(roundedRect(w, h, r), { depth: d, bevelEnabled: false, curveSegments: 18 });
  geo.center();
  return geo;
}

/** A rounded-rectangle face towards +z, with UVs spanning its bounds (for screen textures). */
function face(w: number, h: number, r: number) {
  const geo = new THREE.ShapeGeometry(roundedRect(w, h, r), 16);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / h + 0.5);
  return geo;
}

function radialTexture(inner: string, outer: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** A faint diagonal glare band, baked so the screen glass can never wash out the display. */
function sheenTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 256, 256);
  g.addColorStop(0, "rgba(255,255,255,0.10)");
  g.addColorStop(0.32, "rgba(255,255,255,0.05)");
  g.addColorStop(0.38, "rgba(255,255,255,0.09)");
  g.addColorStop(0.46, "rgba(255,255,255,0.02)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** The Celestial mark (C, crescent moon and star) as an alpha mask. */
function logoTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, 512, 512);
  ctx.scale(512 / 48, 512 / 48);
  ctx.strokeStyle = "#fff";
  ctx.fillStyle = "#fff";
  ctx.lineWidth = LOGO_C_STROKE;
  ctx.stroke(new Path2D(LOGO_C));
  ctx.fill(new Path2D(LOGO_MOON));
  ctx.fill(new Path2D(LOGO_STAR));
  return new THREE.CanvasTexture(c);
}

function buildKeyboard(material: THREE.Material) {
  // Key widths in units; every row adds up to 15
  const rows = [
    Array(15).fill(1),
    [...Array(13).fill(1), 2],
    [1.5, ...Array(12).fill(1), 1.5],
    [1.75, ...Array(11).fill(1), 2.25],
    [2.25, ...Array(10).fill(1), 2.75],
    [1, 1, 1, 1.25, 5.5, 1.25, 1, 1, 1, 1],
  ];
  const span = 2.62;
  const unit = span / 15;
  const gap = 0.022;
  const count = rows.reduce((n, r) => n + r.length, 0);
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), material, count);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  let i = 0;
  let z = -0.86;
  rows.forEach((row, ri) => {
    const depth = ri === 0 ? 0.09 : 0.158;
    let x = -span / 2;
    row.forEach((u) => {
      const kw = u * unit - gap;
      m.compose(
        new THREE.Vector3(x + (u * unit) / 2, BASE_TOP + 0.0026, z + depth / 2),
        q,
        new THREE.Vector3(kw, 0.004, depth),
      );
      mesh.setMatrixAt(i++, m);
      x += u * unit;
    });
    z += depth + gap;
  });
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

export function createMacbookScene({ canvas, reduced }: SceneOptions): SceneApi {
  const host = canvas.parentElement!;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 1, 40);
  camera.position.set(0, 0, CAM_DIST);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const envTarget = pmrem.fromScene(room, 0.04);
  room.dispose();
  scene.environment = envTarget.texture;
  scene.environmentIntensity = 0.95;
  // Turn the studio so its brightest panel isn't mirrored straight back when the lid faces the camera
  scene.environmentRotation.set(0.35, 0.7, 0);

  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(-3, 6, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffe6da, 1.1);
  rim.position.set(4, 2.5, -5);
  scene.add(rim);

  /* ── Materials ── */
  // Charcoal grey anodised finish
  const aluminium = new THREE.MeshStandardMaterial({ color: 0x3a3a3d, metalness: 1, roughness: 0.42 });
  const padMat = new THREE.MeshStandardMaterial({ color: 0x323235, metalness: 1, roughness: 0.28 });
  const wellMat = new THREE.MeshStandardMaterial({ color: 0x1d1b1a, metalness: 0.3, roughness: 0.75 });
  const keyMat = new THREE.MeshStandardMaterial({ color: 0x0e0d0d, metalness: 0.1, roughness: 0.55 });
  const bezelMat = new THREE.MeshStandardMaterial({ color: 0x050505, metalness: 0.4, roughness: 0.2 });
  const hingeMat = new THREE.MeshStandardMaterial({ color: 0x2a2826, metalness: 0.6, roughness: 0.4 });
  const logoTex = logoTexture();
  const logoMat = new THREE.MeshStandardMaterial({
    color: 0xeeebe6,
    metalness: 1,
    roughness: 0.06,
    alphaMap: logoTex,
    transparent: true,
  });
  const shadowTex = radialTexture("rgba(20,10,8,1)", "rgba(20,10,8,0)");
  const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.32, depthWrite: false });

  // All six displays are painted once and uploaded up front, so switching
  // screens mid-flight costs nothing.
  const screenTex = [1, 2, 3, 4, 5, 6].map((step) => {
    const tex = new THREE.CanvasTexture(paintScreen(step));
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    renderer.initTexture(tex);
    return tex;
  });
  const screenMat = new THREE.MeshBasicMaterial({ map: screenTex[0], toneMapped: false });
  const phoneScreenMat = new THREE.MeshBasicMaterial({ map: screenTex[1], toneMapped: false });
  // A fixed, faint sheen over the display. (A mirror-like glass reflected the
  // studio's brightest panel at some angles and hid the screen entirely.)
  const sheenTex = sheenTexture();
  const glassMat = new THREE.MeshBasicMaterial({
    map: sheenTex,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });

  /* ── MacBook ── */
  const laptop = new THREE.Group(); // positioned / scaled / rotated each frame
  const model = new THREE.Group(); // offset so the laptop pivots around its visual centre
  laptop.add(model);
  scene.add(laptop);

  const base = new THREE.Mesh(slab(W, BASE_H, D, CORNER), aluminium);
  model.add(base);

  const well = new THREE.Mesh(plate(2.74, 1.1, 0.05, true), wellMat);
  well.position.set(0, BASE_TOP + 0.0006, -0.36);
  model.add(well);
  const keyboard = buildKeyboard(keyMat);
  model.add(keyboard);

  const pad = new THREE.Mesh(plate(1.36, 0.8, 0.06, true), padMat);
  pad.position.set(0, BASE_TOP + 0.0006, 0.6);
  model.add(pad);

  const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 2.5, 20), hingeMat);
  hinge.rotation.z = Math.PI / 2;
  hinge.position.set(0, BASE_TOP - 0.012, -D / 2 + 0.018);
  model.add(hinge);

  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(W * 1.45, D * 1.6), shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -BASE_H / 2 - 0.02;
  shadow.renderOrder = -1;
  model.add(shadow);

  // Lid pivots on the hinge line (back edge of the deck)
  const lid = new THREE.Group();
  lid.position.set(0, BASE_TOP, -D / 2);
  model.add(lid);

  const lidShell = new THREE.Mesh(slab(W, LID_H, D, CORNER), aluminium);
  lidShell.position.set(0, LID_GAP + LID_H / 2, D / 2);
  lid.add(lidShell);

  const bezel = new THREE.Mesh(plate(W - 0.05, D - 0.05, CORNER - 0.02, false), bezelMat);
  bezel.position.set(0, LID_GAP - 0.0004, D / 2);
  lid.add(bezel);

  const screenGeo = new THREE.PlaneGeometry(2.92, 1.9);
  screenGeo.rotateX(Math.PI / 2); // faces −y; texture top → +z (the lid's free edge)
  const screen = new THREE.Mesh(screenGeo, screenMat);
  screen.position.set(0, LID_GAP - 0.0008, 1.15);
  lid.add(screen);
  const glass = new THREE.Mesh(screenGeo, glassMat);
  glass.position.set(0, LID_GAP - 0.0012, 1.15);
  lid.add(glass);

  const notchGeo = new THREE.CircleGeometry(0.014, 16);
  notchGeo.rotateX(Math.PI / 2);
  const notch = new THREE.Mesh(notchGeo, new THREE.MeshStandardMaterial({ color: 0x15171c, roughness: 0.1, metalness: 0.5 }));
  notch.position.set(0, LID_GAP - 0.001, D - 0.05);
  lid.add(notch);

  const logoGeo = new THREE.PlaneGeometry(0.46, 0.46);
  logoGeo.rotateX(-Math.PI / 2); // faces +y; upright when the closed laptop is seen from the front
  const logo = new THREE.Mesh(logoGeo, logoMat);
  logo.position.set(0, LID_GAP + LID_H + 0.0008, D / 2);
  lid.add(logo);

  /* ── iPhone ── */
  // Charcoal grey, matching the MacBook
  // The frame gets its own, dimmer copy of the studio reflections (envMapIntensity is
  // ignored for scene.environment); at full strength they turn the thin edge white.
  const titanium = new THREE.MeshStandardMaterial({
    color: 0x3a3a3d,
    metalness: 1,
    roughness: 0.42,
    envMap: envTarget.texture,
    envMapIntensity: 0.3,
  });
  titanium.envMapRotation.copy(scene.environmentRotation);
  const backGlass = new THREE.MeshStandardMaterial({ color: 0x343437, metalness: 0.2, roughness: 0.5 });
  const plateauMat = new THREE.MeshStandardMaterial({ color: 0x3d3d40, metalness: 0.3, roughness: 0.24 });
  const lensMat = new THREE.MeshStandardMaterial({ color: 0x0b0c10, metalness: 0.5, roughness: 0.08 });
  const islandMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

  const phone = new THREE.Group();
  scene.add(phone);
  phone.add(new THREE.Mesh(upright(PW, PH, PT, P_CORNER), titanium));

  const front = new THREE.Mesh(face(PW - 0.024, PH - 0.024, P_CORNER - 0.012), bezelMat);
  front.position.z = PT / 2 + 0.001;
  phone.add(front);
  const phoneScreenGeo = face(PSW, PSH, P_CORNER - P_BEZEL);
  const phoneScreen = new THREE.Mesh(phoneScreenGeo, phoneScreenMat);
  phoneScreen.position.z = PT / 2 + 0.002;
  phone.add(phoneScreen);
  const phoneGlass = new THREE.Mesh(phoneScreenGeo, glassMat);
  phoneGlass.position.z = PT / 2 + 0.003;
  phone.add(phoneGlass);
  const island = new THREE.Mesh(face(0.235, 0.068, 0.034), islandMat);
  island.position.set(0, PSH / 2 - 0.066, PT / 2 + 0.004);
  phone.add(island);

  // Back: frosted glass, the camera plateau (top left when seen from behind) and the mark
  const back = new THREE.Mesh(face(PW - 0.024, PH - 0.024, P_CORNER - 0.012), backGlass);
  back.rotation.y = Math.PI;
  back.position.z = -PT / 2 - 0.001;
  phone.add(back);
  const camX = PW / 2 - 0.25;
  const camY = PH / 2 - 0.25;
  const plateau = new THREE.Mesh(upright(0.4, 0.4, 0.03, 0.1), plateauMat);
  plateau.position.set(camX, camY, -PT / 2 - 0.015);
  phone.add(plateau);
  const ringGeo = new THREE.CylinderGeometry(0.086, 0.086, 0.024, 32);
  ringGeo.rotateX(Math.PI / 2);
  const lensGeo = new THREE.CylinderGeometry(0.068, 0.068, 0.03, 32);
  lensGeo.rotateX(Math.PI / 2);
  for (const [dx, dy] of [
    [0.085, 0.085],
    [0.085, -0.085],
    [-0.085, 0],
  ]) {
    const ring = new THREE.Mesh(ringGeo, titanium);
    ring.position.set(camX + dx, camY + dy, -PT / 2 - 0.042);
    phone.add(ring);
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.position.set(camX + dx, camY + dy, -PT / 2 - 0.046);
    phone.add(lens);
  }
  const flashGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.01, 20);
  flashGeo.rotateX(Math.PI / 2);
  const flash = new THREE.Mesh(flashGeo, new THREE.MeshStandardMaterial({ color: 0xf2eadf, roughness: 0.35 }));
  flash.position.set(camX - 0.085, camY + 0.115, -PT / 2 - 0.034);
  phone.add(flash);
  const phoneLogoGeo = new THREE.PlaneGeometry(0.3, 0.3);
  phoneLogoGeo.rotateY(Math.PI);
  const phoneLogo = new THREE.Mesh(phoneLogoGeo, logoMat);
  phoneLogo.position.set(0, 0.04, -PT / 2 - 0.003);
  phone.add(phoneLogo);

  // Side buttons: action + volume on the left, power on the right
  for (const [x, y, h] of [
    [-1, 0.56, 0.075],
    [-1, 0.36, 0.15],
    [-1, 0.17, 0.15],
    [1, 0.3, 0.24],
  ]) {
    const btn = new THREE.Mesh(new THREE.BoxGeometry(0.022, h, 0.04), titanium);
    btn.position.set(x * (PW / 2 + 0.006), y, 0);
    phone.add(btn);
  }

  /* ── Layout & choreography ── */
  let width = 1;
  let height = 1;

  function restPose(step: number): Pose {
    const L = deviceLayout(step, width);
    const halfW = HALF_H * (width / height);
    const isPhone = L.device === "phone";
    // Rendered height relative to width: closed slab seen from above vs. open laptop vs. phone
    const hRatio = isPhone ? PH / PW : lerp(0.6, 0.82, L.open);
    const px = Math.min(L.fw * width, L.maxPx, (L.fh * height) / hRatio);
    return {
      device: L.device,
      x: (L.fx * 2 - 1) * halfW,
      y: (1 - L.fy * 2) * HALF_H,
      s: ((px / width) * 2 * halfW) / (isPhone ? PW : W),
      yaw: L.yaw,
      tilt: L.tilt,
      open: L.open,
    };
  }

  function resize() {
    width = Math.max(1, host.clientWidth);
    height = Math.max(1, host.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  // Pointer parallax (desktop only), eased in render()
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  const finePointer = window.matchMedia("(pointer: fine)").matches && !reduced;
  const onPointer = (e: PointerEvent) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  if (finePointer) window.addEventListener("pointermove", onPointer, { passive: true });

  let lastNow = 0;

  function render(position: number, now: number) {
    const dt = lastNow ? Math.min(0.1, (now - lastNow) / 1000) : 0;
    lastNow = now;
    const time = now / 1000;

    // Segment k → k+1, t = how far along
    const p = Math.min(6, Math.max(0, position));
    const k = Math.min(5, Math.floor(p));
    const t = p - k;
    const A = restPose(k);
    const B = restPose(k + 1);
    const spin = !reduced && k >= 1;
    const e = easeSine(t);
    const turn = easeInOut(t);
    const bump = spin ? Math.sin(Math.PI * e) : 0;

    const yaw0 = A.yaw + (wrap(B.yaw - A.yaw) + (spin ? TAU : 0)) * turn;

    // Device swap: the outgoing one shrinks away mid-turn and the incoming one
    // grows out of the same point. Sine-shaped so it passes through zero with
    // momentum rather than pausing there.
    const swap = A.device !== B.device;
    const incoming = swap && t >= 0.5;
    const cur = incoming ? B : A;
    const morph = swap ? Math.sin((clamp01(Math.abs(t - 0.5) / 0.32) * Math.PI) / 2) : 1;
    const size = (swap ? cur.s : lerp(A.s, B.s, e)) * morph * (1 - 0.12 * bump);
    const showLaptop = cur.device === "laptop" && size > 1e-4;
    const showPhone = cur.device === "phone" && size > 1e-4;
    laptop.visible = showLaptop;
    phone.visible = showPhone;

    pointer.sx += (pointer.x - pointer.sx) * (1 - Math.exp(-dt * 4));
    pointer.sy += (pointer.y - pointer.sy) * (1 - Math.exp(-dt * 4));
    const motion = reduced ? 0 : 1;
    const idle = k === 0 ? Math.sin(time * 0.45) * 0.18 * (1 - e) : 0;

    const target = showLaptop ? laptop : phone;
    target.position.set(
      lerp(A.x, B.x, e),
      lerp(A.y, B.y, e) + (Math.sin(time * 1.2) * 0.03 + bump * 0.1 * HALF_H) * motion,
      0,
    );
    target.scale.setScalar(Math.max(size, 1e-4));
    const yaw = yaw0 + (idle + pointer.sx * 0.1) * motion;
    target.rotation.set(lerp(A.tilt, B.tilt, e) + pointer.sy * 0.05 * motion, yaw, 0);

    // Which capability the visible device shows
    const shown = k === 0 ? 1 : swap ? (incoming ? k + 1 : k) : t < 0.5 ? k : k + 1;

    if (showLaptop) {
      // Intro: the lid opens. Leaving for the phone it folds shut as it shrinks;
      // arriving from the phone it opens as it grows.
      const open =
        k === 0
          ? smooth(0.12, 0.8, t)
          : swap
            ? incoming
              ? smooth(0.6, 0.96, t)
              : 1 - smooth(0.04, 0.4, t)
            : 1 - 0.3 * bump;
      model.position.set(0, -lerp(0.04, 1.0, open), lerp(0, 0.35, open));
      lid.rotation.x = -OPEN_ANGLE * open;

      // Nothing inside is visible with the lid shut; skip it
      const inside = open > 0.01;
      keyboard.visible = well.visible = pad.visible = screen.visible = glass.visible = inside;
      if (screenMat.map !== screenTex[shown - 1]) screenMat.map = screenTex[shown - 1];
      screenMat.color.setScalar(smooth(0.3, 0.9, open));
    }
    if (showPhone && phoneScreenMat.map !== screenTex[shown - 1]) phoneScreenMat.map = screenTex[shown - 1];

    renderer.render(scene, camera);
  }

  // Repaint the displays once web fonts are in
  let disposed = false;
  document.fonts?.ready.then(() => {
    if (disposed) return;
    screenTex.forEach((tex, i) => {
      paintScreen(i + 1, tex.image as HTMLCanvasElement);
      tex.needsUpdate = true;
    });
  });

  return {
    render,
    dispose() {
      disposed = true;
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
        }
      });
      [logoTex, shadowTex, sheenTex, ...screenTex].forEach((t) => t.dispose());
      envTarget.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}

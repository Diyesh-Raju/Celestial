import * as THREE from "three";
import { createFluid } from "./fluid";

// The hero's backdrop: an oxblood void with a disc of stars orbiting the
// globe (drawn in the DOM by Hero.tsx) the way a planet's ring does: inner
// stars faster than outer ones, with a gap like Saturn's Cassini division.
// Over all of it drifts a slow smoke simulation that stirs itself:
//   • the smoke's velocity bends the frame (stars and headline),
//     splitting it into a faint prism fringe where the flow is fast
//   • the smoke's density fills the outlined headline word, so as it drifts
//     across it pours light into the letters
//   • a click sends a shockwave through the smoke and flares the glow
// The headline itself is a real <h1> laid out by the browser; the caller
// paints it into a mask (see setHeadline) so the glass can bend it.
// The caller owns the animation loop and calls render(frame) each frame.

const BRAND = {
  void: "#14040A",
  glow: "#3E0C1C",
  ink: "#E8E0D8",
  rose: "#B8978A",
  wine: "#8A2846",
  spark: "#FF3D6E",
};

const FOV = 32;
const CAM_DIST = 13;
/** Smoke-path motion (uv per frame) to fluid velocity (sim px per second). */
const FORCE = 5200;
/** Fluid velocity to how far it bends the frame (uv). */
const DISTORT = 0.00017;
const INTRO_SWEEP_S = 2.6;
const RING_COUNT = 2600;
const DUST_COUNT = 700;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export type Frame = {
  /** Seconds since the last frame, already clamped. */
  dt: number;
  /** How far the hero has scrolled out of view, 0..1. */
  scroll: number;
  /** False under prefers-reduced-motion: nothing moves unless the pointer moves it. */
  motion: boolean;
};

export type MonolithApi = {
  /** CSS size of the hero and the pixel ratio to draw at. */
  resize: (w: number, h: number, dpr: number, lite: boolean) => void;
  /** The headline mask: R solid letters, G the outline of the outlined word, B its inside. */
  setHeadline: (mask: HTMLCanvasElement) => void;
  /** Where the globe sits (uv y of its centre), and the line the opening sweep of smoke follows. */
  setLayout: (focusY: number, sweepY: number) => void;
  burst: (x: number, y: number) => void;
  render: (frame: Frame) => void;
  dispose: () => void;
};

const COMPOSITE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const COMPOSITE_FRAG = /* glsl */ `
  precision highp float;
  uniform sampler2D tScene;
  uniform sampler2D tText;
  uniform sampler2D tDye;
  uniform sampler2D tVel;
  uniform vec2 uRes;
  uniform float uTime;
  uniform float uDistort;
  uniform float uHasText;
  uniform float uFlare;
  uniform vec2 uFocus;
  uniform vec3 uVoid;
  uniform vec3 uGlow;
  uniform vec3 uInk;
  uniform vec3 uRose;
  varying vec2 vUv;

  vec3 aces(vec3 x) {
    return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
  }
  vec3 toSRGB(vec3 c) {
    return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
  }
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  // Headline coverage from one sample of the mask: solid letters and the
  // outline always, the outlined word's inside only where smoke has filled it.
  float ink(vec3 t, float fill) {
    return max(max(t.r, t.g), t.b * fill);
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uRes.x / uRes.y;

    // The flow bends everything behind it. Capped, so a violent flick
    // ripples the frame without tearing it apart.
    vec2 off = texture2D(tVel, uv).xy * uDistort;
    off *= min(1.0, 0.03 / max(length(off), 1e-5));
    vec2 split = off * 0.22;

    vec4 dye = texture2D(tDye, uv - off * 0.5);
    float fill = smoothstep(0.08, 0.6, dye.a);

    vec2 p = (uv - uFocus) * vec2(aspect, 1.0);
    vec3 col = uVoid + uGlow * exp(-dot(p, p) * 3.6) * (1.0 + uFlare * 1.5);

    vec2 tuv = uv - off;
    vec3 a = vec3(
      ink(texture2D(tText, tuv + split).rgb, fill),
      ink(texture2D(tText, tuv).rgb, fill),
      ink(texture2D(tText, tuv - split).rgb, fill)
    ) * uHasText;
    // Letters the smoke has filled run warm.
    col = mix(col, mix(uInk, uInk * 0.9 + uRose * 0.35, fill * 0.6), a);

    vec2 suv = uv - off * 1.3;
    vec4 s = texture2D(tScene, suv);
    s.r = texture2D(tScene, suv + split).r;
    s.b = texture2D(tScene, suv - split).b;
    col = col * (1.0 - s.a) + aces(s.rgb);

    // Bloom from the scene's own mip chain: only what burns past a level
    // survives, which in practice means the brightest stars.
    vec3 bloom =
        max(textureLod(tScene, suv, 2.0).rgb - 1.0, 0.0) * 0.7
      + max(textureLod(tScene, suv, 3.5).rgb - 0.45, 0.0) * 1.2
      + max(textureLod(tScene, suv, 5.0).rgb - 0.2, 0.0) * 1.6;
    col += bloom;

    col += (1.0 - exp(-dye.rgb * 2.0)) * 0.24;

    vec2 q = (uv - 0.5) * vec2(aspect, 1.0);
    col *= 1.0 - 0.5 * smoothstep(0.35, 1.3, length(q));

    vec3 outc = toSRGB(max(col, 0.0));
    outc += (hash(floor(uv * uRes) + fract(uTime) * 91.0) - 0.5) * 0.028;
    gl_FragColor = vec4(outc, 1.0);
  }
`;

// The ring: each star keeps its own radius and phase and is turned about the
// globe on the GPU, at a rate that falls off with distance (Kepler: ω ∝ r^-1.5).
const RING_VERT = /* glsl */ `
  attribute float aRadius;
  attribute float aAngle;
  attribute float aSize;
  attribute float aSeed;
  uniform float uSpin;
  uniform float uTime;
  uniform float uScale;
  varying float vSeed;
  varying float vTwinkle;
  void main() {
    float ang = aAngle + uSpin * 3.2 / pow(aRadius, 1.5);
    vec3 p = vec3(cos(ang) * aRadius, position.y, sin(ang) * aRadius);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    vTwinkle = 0.55 + 0.45 * sin(uTime * (1.2 + aSeed * 3.0) + aSeed * 40.0);
    vSeed = aSeed;
    gl_PointSize = aSize * uScale / -mv.z;
  }
`;

const DUST_VERT = /* glsl */ `
  attribute float aSize;
  attribute float aSeed;
  uniform float uTime;
  uniform float uScale;
  varying float vSeed;
  varying float vTwinkle;
  void main() {
    vec3 p = position;
    p.y = mod(p.y + uTime * (0.05 + aSeed * 0.08) + 8.0, 16.0) - 8.0;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    vTwinkle = 0.4 + 0.6 * sin(uTime * (0.6 + aSeed * 2.0) + aSeed * 23.0);
    vSeed = aSeed;
    gl_PointSize = aSize * uScale / -mv.z;
  }
`;

const STAR_FRAG = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uGain;
  varying float vSeed;
  varying float vTwinkle;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    a *= a;
    gl_FragColor = vec4(mix(uColorA, uColorB, vSeed) * a * vTwinkle * uGain, 1.0);
  }
`;

function starMaterial(vertexShader: string, a: string, b: string, gain: number) {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader: STAR_FRAG,
    uniforms: {
      uSpin: { value: 0 },
      uTime: { value: 0 },
      uScale: { value: 1 },
      uGain: { value: gain },
      uColorA: { value: new THREE.Color(a) },
      uColorB: { value: new THREE.Color(b) },
    },
    transparent: true,
    depthWrite: false,
    // Light adds to the colour but leaves alpha alone, so stars never punch
    // holes in what the composite lays underneath.
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
    blendSrcAlpha: THREE.ZeroFactor,
    blendDstAlpha: THREE.OneFactor,
  });
}

function makeRing() {
  const pos = new Float32Array(RING_COUNT * 3);
  const radius = new Float32Array(RING_COUNT);
  const angle = new Float32Array(RING_COUNT);
  const size = new Float32Array(RING_COUNT);
  const seed = new Float32Array(RING_COUNT);
  for (let i = 0; i < RING_COUNT; i++) {
    let r = 0;
    // A clear division partway out, like Saturn's.
    do r = 2.5 + 2.4 * Math.pow(Math.random(), 0.75);
    while (r > 3.45 && r < 3.68);
    radius[i] = r;
    angle[i] = Math.random() * Math.PI * 2;
    // Thin, and a touch thicker toward the outer edge.
    const g = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
    pos[i * 3 + 1] = g * 0.05 * r;
    // Mostly fine dust, a few bright stars.
    size[i] = 2.5 + 11 * Math.pow(Math.random(), 6);
    seed[i] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aRadius", new THREE.BufferAttribute(radius, 1));
  geo.setAttribute("aAngle", new THREE.BufferAttribute(angle, 1));
  geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  // The vertex shader moves every point; the bounds have to cover the whole orbit.
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 6);
  const points = new THREE.Points(geo, starMaterial(RING_VERT, BRAND.ink, BRAND.spark, 0.55));
  points.frustumCulled = false;
  return points;
}

function makeDust() {
  const pos = new Float32Array(DUST_COUNT * 3);
  const size = new Float32Array(DUST_COUNT);
  const seed = new Float32Array(DUST_COUNT);
  for (let i = 0; i < DUST_COUNT; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 30;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
    pos[i * 3 + 2] = -3 - Math.random() * 12;
    size[i] = 3 + 12 * Math.pow(Math.random(), 6);
    seed[i] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  const points = new THREE.Points(geo, starMaterial(DUST_VERT, BRAND.rose, BRAND.ink, 0.35));
  points.frustumCulled = false;
  return points;
}

export function createMonolith(canvas: HTMLCanvasElement): MonolithApi {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, depth: false, powerPreference: "high-performance" });
  renderer.autoClear = false;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);

  const world = new THREE.Group();
  scene.add(world);

  const ringTilt = new THREE.Group();
  ringTilt.rotation.set(0.3, 0, -0.2);
  const ring = makeRing();
  ringTilt.add(ring);
  world.add(ringTilt);

  const dust = makeDust();
  scene.add(dust);

  let disposed = false;
  const fluid = createFluid(renderer);

  // The scene renders to a half-float target first, so bright stars can burn
  // past 1.0 and the composite can blur its mip chain into a bloom.
  const sceneRT = new THREE.WebGLRenderTarget(1, 1, {
    type: THREE.HalfFloatType,
    samples: 4,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: true,
  });

  let textTex: THREE.CanvasTexture | null = null;
  const empty = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
  empty.needsUpdate = true;

  const composite = new THREE.ShaderMaterial({
    vertexShader: COMPOSITE_VERT,
    fragmentShader: COMPOSITE_FRAG,
    uniforms: {
      tScene: { value: sceneRT.texture },
      tText: { value: empty },
      tDye: { value: null },
      tVel: { value: null },
      uRes: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uDistort: { value: DISTORT },
      uHasText: { value: 0 },
      uFlare: { value: 0 },
      uFocus: { value: new THREE.Vector2(0.5, 0.5) },
      uVoid: { value: new THREE.Color(BRAND.void) },
      uGlow: { value: new THREE.Color(BRAND.glow) },
      uInk: { value: new THREE.Color(BRAND.ink) },
      uRose: { value: new THREE.Color(BRAND.rose) },
    },
    depthTest: false,
    depthWrite: false,
  });
  const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), composite);
  quad.frustumCulled = false;
  const quadScene = new THREE.Scene();
  quadScene.add(quad);

  let width = 1;
  let height = 1;
  let pixelRatio = 1;
  let focusY = 0.5;
  let sweepY = 0.35;
  let time = 0;
  let ringSpin = 0;
  let flare = 0;
  let introAt = -1;
  const ghost = { x: NaN, y: NaN };
  const smokeA = new THREE.Color(BRAND.wine);
  const smokeB = new THREE.Color(BRAND.rose);
  const smoke = new THREE.Color();

  const smokeColor = (gain: number) => smoke.copy(smokeA).lerp(smokeB, 0.5 + 0.5 * Math.sin(time * 0.7)).multiplyScalar(gain);

  /** Splat along the path from the ghost's last point to (x, y). */
  const ghostTo = (x: number, y: number, gain: number) => {
    if (!Number.isNaN(ghost.x)) {
      fluid.splat(x, y, (x - ghost.x) * FORCE * 0.6, (y - ghost.y) * FORCE * 0.6, smokeColor(gain), gain * 3, 0.003);
    }
    ghost.x = x;
    ghost.y = y;
  };

  return {
    resize(w, h, dpr, lite) {
      width = w;
      height = h;
      pixelRatio = dpr;
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      const pw = Math.max(1, Math.round(w * dpr));
      const ph = Math.max(1, Math.round(h * dpr));
      sceneRT.setSize(pw, ph);
      fluid.resize(pw, ph, lite);
      composite.uniforms.uRes.value.set(pw, ph);
      camera.aspect = w / h;
      // Portrait screens pull the camera back so the ring still fits.
      camera.position.z = CAM_DIST * Math.sqrt(Math.max(1, 1.5 / camera.aspect));
      camera.updateProjectionMatrix();
    },

    setHeadline(mask) {
      if (!textTex || textTex.image.width !== mask.width || textTex.image.height !== mask.height) {
        textTex?.dispose();
        textTex = new THREE.CanvasTexture(mask);
        textTex.minFilter = THREE.LinearFilter;
        textTex.generateMipmaps = false;
      } else {
        textTex.image = mask;
        textTex.needsUpdate = true;
      }
      composite.uniforms.tText.value = textTex;
      composite.uniforms.uHasText.value = 1;
    },

    setLayout(f, s) {
      focusY = f;
      sweepY = s;
    },

    burst(x, y) {
      // A ring of outward pushes: the smoke blows open around the click.
      const n = 14;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const dx = Math.cos(a);
        const dy = Math.sin(a);
        fluid.splat(x + (dx * 0.012 * height) / width, y + dy * 0.012, dx * 700, dy * 700, smokeColor(0.05), 0.15, 0.0012);
      }
      flare = 1;
    },

    render(frame) {
      if (disposed) return;
      const { dt, motion } = frame;
      time += dt;

      // The smoke moves itself: first one sweep along the outlined word so it
      // fills in on arrival, then a slow figure through the frame.
      if (motion && introAt < 0) introAt = time;
      const sinceIntro = introAt < 0 ? -1 : time - introAt - 0.9;
      if (motion && sinceIntro >= 0 && sinceIntro < INTRO_SWEEP_S) {
        const t = easeInOut(sinceIntro / INTRO_SWEEP_S);
        ghostTo(-0.05 + 1.1 * t, sweepY + 0.03 * Math.sin(sinceIntro * 6), 0.06);
      } else if (motion && sinceIntro >= INTRO_SWEEP_S) {
        ghostTo(0.5 + 0.4 * Math.sin(time * 0.31), focusY + 0.28 * Math.sin(time * 0.53 + 1.2), 0.025);
      } else {
        ghost.x = NaN;
      }

      fluid.step(dt);

      flare *= Math.exp(-dt * 2.2);

      const visibleH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
      world.position.y = (focusY - 0.5) * visibleH + frame.scroll * 2.4;
      world.scale.setScalar(1 + frame.scroll * 0.18);
      camera.lookAt(0, world.position.y * 0.15, 0);

      if (motion) ringSpin += dt * (0.18 + flare * 1.5 + frame.scroll * 0.8);
      const rs = ring.material as THREE.ShaderMaterial;
      const ds = dust.material as THREE.ShaderMaterial;
      const scale = pixelRatio * (height / 900) * 13;
      rs.uniforms.uSpin.value = ringSpin;
      rs.uniforms.uTime.value = time;
      rs.uniforms.uScale.value = scale;
      ds.uniforms.uTime.value = motion ? time : 0;
      ds.uniforms.uScale.value = scale;

      renderer.setRenderTarget(sceneRT);
      renderer.setClearColor(0x000000, 0);
      renderer.clear();
      renderer.render(scene, camera);

      const u = composite.uniforms;
      u.tDye.value = fluid.dye;
      u.tVel.value = fluid.velocity;
      u.uTime.value = time;
      u.uFlare.value = flare;
      u.uFocus.value.set(0.5, focusY + frame.scroll * 0.2);
      renderer.setRenderTarget(null);
      renderer.render(quadScene, quadCam);
    },

    dispose() {
      disposed = true;
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.geometry) return;
        mesh.geometry.dispose();
        (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((m) => m.dispose());
      });
      fluid.dispose();
      sceneRT.dispose();
      textTex?.dispose();
      empty.dispose();
      composite.dispose();
      quad.geometry.dispose();
      renderer.dispose();
    },
  };
}

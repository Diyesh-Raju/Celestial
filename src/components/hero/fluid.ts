import * as THREE from "three";

// A small stable-fluids solver (after Pavel Dobryakov's WebGL Fluid
// Simulation) on three.js render targets. Two fields come out of it:
//   velocity — sim pixels per second in .xy, used to bend the whole frame
//   dye      — premultiplied smoke colour in .rgb, its density in .a
// The caller owns the renderer and the loop: splat() while the pointer moves,
// step() once a frame, then sample `velocity` and `dye` in a composite pass.

const BASE_VERT = /* glsl */ `
  uniform vec2 texelSize;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  void main() {
    vUv = uv;
    vL = vUv - vec2(texelSize.x, 0.0);
    vR = vUv + vec2(texelSize.x, 0.0);
    vT = vUv + vec2(0.0, texelSize.y);
    vB = vUv - vec2(0.0, texelSize.y);
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const HEAD = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
`;

const SPLAT = /* glsl */ `${HEAD}
  uniform sampler2D uTarget;
  uniform float aspectRatio;
  uniform vec4 color;
  uniform vec2 point;
  uniform float radius;
  void main() {
    vec2 p = vUv - point;
    p.x *= aspectRatio;
    gl_FragColor = texture2D(uTarget, vUv) + exp(-dot(p, p) / radius) * color;
  }
`;

const ADVECT = /* glsl */ `${HEAD}
  uniform sampler2D uVelocity;
  uniform sampler2D uSource;
  uniform vec2 velTexel;
  uniform float dt;
  uniform float dissipation;
  void main() {
    vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * velTexel;
    gl_FragColor = texture2D(uSource, coord) / (1.0 + dissipation * dt);
  }
`;

const DIVERGENCE = /* glsl */ `${HEAD}
  uniform sampler2D uVelocity;
  void main() {
    float L = texture2D(uVelocity, vL).x;
    float R = texture2D(uVelocity, vR).x;
    float T = texture2D(uVelocity, vT).y;
    float B = texture2D(uVelocity, vB).y;
    vec2 C = texture2D(uVelocity, vUv).xy;
    // Walls: the flow reflects off the frame's edges.
    if (vL.x < 0.0) L = -C.x;
    if (vR.x > 1.0) R = -C.x;
    if (vT.y > 1.0) T = -C.y;
    if (vB.y < 0.0) B = -C.y;
    gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
  }
`;

const CURL = /* glsl */ `${HEAD}
  uniform sampler2D uVelocity;
  void main() {
    float L = texture2D(uVelocity, vL).y;
    float R = texture2D(uVelocity, vR).y;
    float T = texture2D(uVelocity, vT).x;
    float B = texture2D(uVelocity, vB).x;
    gl_FragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
  }
`;

// Vorticity confinement: puts back the small eddies the grid smooths away,
// which is what makes it curl like smoke instead of spreading like ink.
const VORTICITY = /* glsl */ `${HEAD}
  uniform sampler2D uVelocity;
  uniform sampler2D uCurl;
  uniform float curl;
  uniform float dt;
  void main() {
    float L = texture2D(uCurl, vL).x;
    float R = texture2D(uCurl, vR).x;
    float T = texture2D(uCurl, vT).x;
    float B = texture2D(uCurl, vB).x;
    float C = texture2D(uCurl, vUv).x;
    vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
    force /= length(force) + 0.0001;
    force *= curl * C;
    force.y *= -1.0;
    vec2 vel = texture2D(uVelocity, vUv).xy + force * dt;
    gl_FragColor = vec4(clamp(vel, -1000.0, 1000.0), 0.0, 1.0);
  }
`;

const PRESSURE = /* glsl */ `${HEAD}
  uniform sampler2D uPressure;
  uniform sampler2D uDivergence;
  void main() {
    float L = texture2D(uPressure, vL).x;
    float R = texture2D(uPressure, vR).x;
    float T = texture2D(uPressure, vT).x;
    float B = texture2D(uPressure, vB).x;
    float div = texture2D(uDivergence, vUv).x;
    gl_FragColor = vec4((L + R + B + T - div) * 0.25, 0.0, 0.0, 1.0);
  }
`;

const GRADIENT = /* glsl */ `${HEAD}
  uniform sampler2D uPressure;
  uniform sampler2D uVelocity;
  void main() {
    float L = texture2D(uPressure, vL).x;
    float R = texture2D(uPressure, vR).x;
    float T = texture2D(uPressure, vT).x;
    float B = texture2D(uPressure, vB).x;
    vec2 vel = texture2D(uVelocity, vUv).xy - vec2(R - L, T - B);
    gl_FragColor = vec4(vel, 0.0, 1.0);
  }
`;

const FADE = /* glsl */ `${HEAD}
  uniform sampler2D uTexture;
  uniform float value;
  void main() {
    gl_FragColor = value * texture2D(uTexture, vUv);
  }
`;

/** Tuning: how quickly things settle (per second), and how hard the solver works. */
const VELOCITY_DISSIPATION = 0.9;
const DYE_DISSIPATION = 0.75;
const PRESSURE_FADE = 0.8;
const PRESSURE_ITERATIONS = 18;
const CURL_STRENGTH = 28;

type Double = { read: THREE.WebGLRenderTarget; write: THREE.WebGLRenderTarget; swap: () => void };

export type Fluid = {
  readonly velocity: THREE.Texture;
  readonly dye: THREE.Texture;
  /** Push the fluid at uv (x, y) with velocity (dx, dy) and add `density` of smoke in `color` (linear RGB). */
  splat: (x: number, y: number, dx: number, dy: number, color: THREE.Color, density: number, radius?: number) => void;
  step: (dt: number) => void;
  /** Size the grids for a drawing surface of w × h pixels. */
  resize: (w: number, h: number, lite: boolean) => void;
  /** Compiles every pass's shader (in parallel where supported), resolving when all are ready. */
  compile: () => Promise<unknown>;
  dispose: () => void;
};

/** Grid size along each axis: `res` cells on the short side. */
function gridOf(res: number, w: number, h: number) {
  const aspect = w / h;
  const long = Math.round(res * (aspect < 1 ? 1 / aspect : aspect));
  return aspect >= 1 ? { w: long, h: res } : { w: res, h: long };
}

export function createFluid(renderer: THREE.WebGLRenderer): Fluid {
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
  quad.frustumCulled = false;
  const stage = new THREE.Scene();
  stage.add(quad);

  const mat = (fragmentShader: string, uniforms: Record<string, THREE.IUniform>) =>
    new THREE.ShaderMaterial({
      vertexShader: BASE_VERT,
      fragmentShader,
      uniforms: { texelSize: { value: new THREE.Vector2() }, ...uniforms },
      depthTest: false,
      depthWrite: false,
    });

  const M = {
    splat: mat(SPLAT, {
      uTarget: { value: null },
      aspectRatio: { value: 1 },
      color: { value: new THREE.Vector4() },
      point: { value: new THREE.Vector2() },
      radius: { value: 0.002 },
    }),
    advect: mat(ADVECT, {
      uVelocity: { value: null },
      uSource: { value: null },
      velTexel: { value: new THREE.Vector2() },
      dt: { value: 0 },
      dissipation: { value: 0 },
    }),
    divergence: mat(DIVERGENCE, { uVelocity: { value: null } }),
    curl: mat(CURL, { uVelocity: { value: null } }),
    vorticity: mat(VORTICITY, {
      uVelocity: { value: null },
      uCurl: { value: null },
      curl: { value: CURL_STRENGTH },
      dt: { value: 0 },
    }),
    pressure: mat(PRESSURE, { uPressure: { value: null }, uDivergence: { value: null } }),
    gradient: mat(GRADIENT, { uPressure: { value: null }, uVelocity: { value: null } }),
    fade: mat(FADE, { uTexture: { value: null }, value: { value: PRESSURE_FADE } }),
  };

  const target = (w: number, h: number) =>
    new THREE.WebGLRenderTarget(w, h, {
      type: THREE.HalfFloatType,
      format: THREE.RGBAFormat,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      depthBuffer: false,
      generateMipmaps: false,
    });
  const double = (w: number, h: number): Double => {
    const d = { read: target(w, h), write: target(w, h), swap: () => ([d.read, d.write] = [d.write, d.read]) };
    return d;
  };

  let velocity = double(1, 1);
  let dye = double(1, 1);
  let pressure = double(1, 1);
  let divergence = target(1, 1);
  let curl = target(1, 1);
  const velTexel = new THREE.Vector2(1, 1);
  const dyeTexel = new THREE.Vector2(1, 1);
  let aspect = 1;

  const pass = (m: THREE.ShaderMaterial, dst: THREE.WebGLRenderTarget, texel: THREE.Vector2) => {
    m.uniforms.texelSize.value.copy(texel);
    quad.material = m;
    renderer.setRenderTarget(dst);
    renderer.render(stage, camera);
  };

  const all = () => [velocity.read, velocity.write, dye.read, dye.write, pressure.read, pressure.write, divergence, curl];

  const scratch = new THREE.Vector4();

  return {
    get velocity() {
      return velocity.read.texture;
    },
    get dye() {
      return dye.read.texture;
    },

    resize(w, h, lite) {
      aspect = w / h;
      const v = gridOf(lite ? 64 : 128, w, h);
      const d = gridOf(lite ? 256 : 512, w, h);
      if (velocity.read.width === v.w && velocity.read.height === v.h && dye.read.width === d.w && dye.read.height === d.h) return;
      // Resizing wipes the fields: a resize mid-stir loses the smoke, which
      // nobody notices, and saves resampling every grid.
      all().forEach((t) => t.dispose());
      velocity = double(v.w, v.h);
      pressure = double(v.w, v.h);
      divergence = target(v.w, v.h);
      curl = target(v.w, v.h);
      dye = double(d.w, d.h);
      velTexel.set(1 / v.w, 1 / v.h);
      dyeTexel.set(1 / d.w, 1 / d.h);
    },

    splat(x, y, dx, dy, color, density, radius = 0.0022) {
      const u = M.splat.uniforms;
      u.aspectRatio.value = aspect;
      u.point.value.set(x, y);
      // The splat is a circle on screen, so its radius stretches with a wide frame.
      u.radius.value = aspect > 1 ? radius * aspect : radius;
      u.uTarget.value = velocity.read.texture;
      u.color.value.copy(scratch.set(dx, dy, 0, 0));
      pass(M.splat, velocity.write, velTexel);
      velocity.swap();
      u.uTarget.value = dye.read.texture;
      u.color.value.set(color.r, color.g, color.b, density);
      pass(M.splat, dye.write, dyeTexel);
      dye.swap();
    },

    step(rawDt) {
      const dt = Math.min(rawDt, 1 / 60);

      M.curl.uniforms.uVelocity.value = velocity.read.texture;
      pass(M.curl, curl, velTexel);

      M.vorticity.uniforms.uVelocity.value = velocity.read.texture;
      M.vorticity.uniforms.uCurl.value = curl.texture;
      M.vorticity.uniforms.dt.value = dt;
      pass(M.vorticity, velocity.write, velTexel);
      velocity.swap();

      M.divergence.uniforms.uVelocity.value = velocity.read.texture;
      pass(M.divergence, divergence, velTexel);

      M.fade.uniforms.uTexture.value = pressure.read.texture;
      pass(M.fade, pressure.write, velTexel);
      pressure.swap();

      M.pressure.uniforms.uDivergence.value = divergence.texture;
      for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
        M.pressure.uniforms.uPressure.value = pressure.read.texture;
        pass(M.pressure, pressure.write, velTexel);
        pressure.swap();
      }

      M.gradient.uniforms.uPressure.value = pressure.read.texture;
      M.gradient.uniforms.uVelocity.value = velocity.read.texture;
      pass(M.gradient, velocity.write, velTexel);
      velocity.swap();

      const a = M.advect.uniforms;
      a.velTexel.value.copy(velTexel);
      a.dt.value = dt;
      a.uVelocity.value = velocity.read.texture;
      a.uSource.value = velocity.read.texture;
      a.dissipation.value = VELOCITY_DISSIPATION;
      pass(M.advect, velocity.write, velTexel);
      velocity.swap();

      a.uVelocity.value = velocity.read.texture;
      a.uSource.value = dye.read.texture;
      a.dissipation.value = DYE_DISSIPATION;
      pass(M.advect, dye.write, dyeTexel);
      dye.swap();
    },

    compile() {
      // One quad per pass, so they all compile together instead of one by one in the first step()
      const passes = new THREE.Scene();
      for (const m of Object.values(M)) {
        const q = new THREE.Mesh(quad.geometry, m);
        q.frustumCulled = false;
        passes.add(q);
      }
      // Bound so the shaders are built for drawing into the grids, as step() does
      renderer.setRenderTarget(velocity.read);
      const done = renderer.compileAsync(passes, camera);
      renderer.setRenderTarget(null);
      return done;
    },

    dispose() {
      all().forEach((t) => t.dispose());
      Object.values(M).forEach((m) => m.dispose());
      quad.geometry.dispose();
    },
  };
}

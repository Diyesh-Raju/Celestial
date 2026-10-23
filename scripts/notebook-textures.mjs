// Generates the notebook section's tileable textures (public/notebook):
// pebbled burgundy leather, lit from the top left and calibrated to average
// exactly #2A070C, and warm ivory paper with fibres. Deterministic, so re-running
// it reproduces the committed files.
// usage: node scripts/notebook-textures.mjs
import sharp from "sharp";

const out = new URL("../public/notebook", import.meta.url).pathname;

/* ---------- deterministic noise helpers ---------- */
function hash2(x, y, seed) {
  let h = (x * 374761393 + y * 668265263 + seed * 1442695041) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
const smooth = (t) => t * t * (3 - 2 * t);
const smoothstep = (a, b, v) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
/** Tileable value noise; u,v in [0,1), period = cells */
function vnoise(u, v, cells, seed) {
  const x = u * cells, y = v * cells;
  const x0 = Math.floor(x), y0 = Math.floor(y);
  const fx = smooth(x - x0), fy = smooth(y - y0);
  const w = (i) => ((i % cells) + cells) % cells;
  const a = hash2(w(x0), w(y0), seed), b = hash2(w(x0 + 1), w(y0), seed);
  const c = hash2(w(x0), w(y0 + 1), seed), d = hash2(w(x0 + 1), w(y0 + 1), seed);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}
function fbm(u, v, cells, oct, seed) {
  let s = 0, amp = 0.5, tot = 0;
  for (let i = 0; i < oct; i++) {
    s += amp * vnoise(u, v, cells << i, seed + i * 17);
    tot += amp;
    amp *= 0.5;
  }
  return s / tot;
}
/** Tileable Worley: returns [F1, F2] in cell units */
function worley(u, v, cells, seed, jitter = 0.9) {
  const x = u * cells, y = v * cells;
  const cx = Math.floor(x), cy = Math.floor(y);
  let f1 = 9, f2 = 9;
  for (let j = -2; j <= 2; j++)
    for (let i = -2; i <= 2; i++) {
      const gx = cx + i, gy = cy + j;
      const wx = ((gx % cells) + cells) % cells, wy = ((gy % cells) + cells) % cells;
      const px = gx + 0.5 + (hash2(wx, wy, seed) - 0.5) * jitter;
      const py = gy + 0.5 + (hash2(wx, wy, seed + 7) - 0.5) * jitter;
      // slightly anisotropic metric: real grain is stretched along the hide
      const dx = (px - x) * 1.0, dy = (py - y) * 1.12;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < f1) { f2 = f1; f1 = d; } else if (d < f2) f2 = d;
    }
  return [f1, f2];
}

/** Like worley(), plus a smooth-min F1 so cells read as rounded pebbles, not facets */
function worleySmooth(u, v, cells, seed, k = 9) {
  const x = u * cells, y = v * cells;
  const cx = Math.floor(x), cy = Math.floor(y);
  let f1 = 9, f2 = 9, acc = 0;
  for (let j = -2; j <= 2; j++)
    for (let i = -2; i <= 2; i++) {
      const gx = cx + i, gy = cy + j;
      const wx = ((gx % cells) + cells) % cells, wy = ((gy % cells) + cells) % cells;
      const px = gx + 0.5 + (hash2(wx, wy, seed) - 0.5) * 0.92;
      const py = gy + 0.5 + (hash2(wx, wy, seed + 7) - 0.5) * 0.92;
      const dx = px - x, dy = (py - y) * 1.1;
      const d = Math.sqrt(dx * dx + dy * dy);
      acc += Math.exp(-k * d);
      if (d < f1) { f2 = f1; f1 = d; } else if (d < f2) f2 = d;
    }
  return [f1, f2, -Math.log(acc) / k];
}

/* ---------- leather ---------- */
/** Separable gaussian blur on a tileable S×S field */
function blur(F, S, sigma) {
  const r = Math.ceil(sigma * 3);
  const k = [];
  let ks = 0;
  for (let i = -r; i <= r; i++) { const w = Math.exp(-(i * i) / (2 * sigma * sigma)); k.push(w); ks += w; }
  const tmp = new Float32Array(S * S), outF = new Float32Array(S * S);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      let s = 0;
      for (let i = -r; i <= r; i++) s += F[y * S + (((x + i) % S) + S) % S] * k[i + r];
      tmp[y * S + x] = s / ks;
    }
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      let s = 0;
      for (let i = -r; i <= r; i++) s += tmp[((((y + i) % S) + S) % S) * S + x] * k[i + r];
      outF[y * S + x] = s / ks;
    }
  return outF;
}

async function leather(S, file) {
  const cells = 50; // pebbles across the tile
  const normal = 1.9; // relief strength when lighting the height field
  const peb = new Float32Array(S * S);
  const fine = new Float32Array(S * S);
  const net = new Float32Array(S * S);
  const micro = new Float32Array(S * S);
  const crinkle = new Float32Array(S * S);
  const albedoVar = new Float32Array(S * S);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const u = x / S, v = y / S;
      const i = y * S + x;
      // domain warp so pebbles aren't uniform blobs
      const wu = u + (fbm(u, v, 6, 3, 11) - 0.5) * 0.04;
      const wv = v + (fbm(u, v, 6, 3, 23) - 0.5) * 0.04;
      const [a1, a2, as] = worleySmooth(wu, wv, cells, 3);
      const [b1, b2, bs] = worleySmooth(wu + 0.37, wv + 0.11, Math.round(cells * 1.55), 5);
      const mixT = smoothstep(0.3, 0.7, fbm(u, v, 5, 3, 41));
      const ea = a2 - a1, eb = b2 - b1;
      // each pebble a soft dome: rounded crown, smooth valley where pebbles meet
      const domeA = 1 - Math.min(1, Math.pow(Math.max(0, as + 0.22) / 0.8, 2));
      const domeB = 1 - Math.min(1, Math.pow(Math.max(0, bs + 0.22) / 0.8, 2));
      peb[i] = domeA * (1 - mixT * 0.6) + domeB * mixT * 0.6;
      fine[i] = (1 - smoothstep(0, 0.07, ea)) * (1 - mixT * 0.6) + (1 - smoothstep(0, 0.08, eb)) * mixT * 0.6;
      // a looser network of deeper folds, as where the hide flexes
      const nu = u + (fbm(u, v, 9, 3, 51) - 0.5) * 0.06, nv = v + (fbm(u, v, 9, 3, 57) - 0.5) * 0.06;
      const [c1, c2] = worley(nu, nv, 17, 9, 1.0);
      net[i] = 1 - smoothstep(0, 0.045, c2 - c1);
      // hairline crinkles running across the crowns
      const r1 = 1 - Math.abs(2 * fbm(u, v, 24, 3, 61) - 1);
      crinkle[i] = smoothstep(0.93, 0.99, r1);
      micro[i] = fbm(u, v, 128, 2, 77) - 0.5;
      albedoVar[i] = fbm(u, v, 4, 4, 133) - 0.5;
    }
  const pebB = blur(peb, S, 1.1);
  const fineB = blur(fine, S, 0.6);
  const netB = blur(net, S, 0.9);
  const crB = blur(crinkle, S, 0.6);
  const H = new Float32Array(S * S);
  for (let i = 0; i < S * S; i++) H[i] = 0.8 * pebB[i] - 0.3 * fineB[i] - 0.26 * netB[i] - 0.12 * crB[i] + 0.05 * micro[i];
  const at = (x, y) => H[(((y % S) + S) % S) * S + (((x % S) + S) % S)];
  const L = norm([-0.42, -0.62, 0.66]); // light from top-left (y is down)
  const Hh = norm([L[0], L[1], L[2] + 1]);
  const rgb = new Float32Array(S * S * 3);
  let mr = 0, mg = 0, mb = 0;
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * normal;
      const dy = (at(x, y + 1) - at(x, y - 1)) * normal;
      const n = norm([-dx, -dy, 1]);
      const ndl = Math.max(0, dot(n, L));
      const diff = 0.42 + 0.58 * (ndl / L[2]);
      const h = at(x, y);
      const ao = 0.55 + 0.45 * smoothstep(-0.45, 0.75, h);
      const nh = Math.max(0, dot(n, Hh));
      // satin finish: a soft lobe plus a faint tight glint on pebble crowns
      const spec = Math.pow(nh, 10) * 0.14 + Math.pow(nh, 48) * 0.2;
      const av = 1 + albedoVar[y * S + x] * 0.3;
      const i = (y * S + x) * 3;
      const shade = diff * ao * av;
      rgb[i] = 42 * shade + spec * 120;
      rgb[i + 1] = 7 * shade + spec * 70;
      rgb[i + 2] = 12 * shade + spec * 78;
      mr += rgb[i]; mg += rgb[i + 1]; mb += rgb[i + 2];
    }
  const N = S * S;
  // calibrate so the average colour is exactly #2A070C
  const kr = 42 / (mr / N), kg = 7 / (mg / N), kb = 12 / (mb / N);
  const buf = Buffer.alloc(N * 3);
  for (let i = 0; i < N; i++) {
    buf[i * 3] = clamp255(rgb[i * 3] * kr);
    buf[i * 3 + 1] = clamp255(rgb[i * 3 + 1] * kg);
    buf[i * 3 + 2] = clamp255(rgb[i * 3 + 2] * kb);
  }
  await sharp(buf, { raw: { width: S, height: S, channels: 3 } }).webp({ quality: 88, smartSubsample: true }).toFile(file);
}

/* ---------- paper ---------- */
async function paper(S, file) {
  const buf = new Float32Array(S * S);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const u = x / S, v = y / S;
      // fine tooth + soft cloudiness ("formation") of real paper
      buf[y * S + x] =
        (fbm(u, v, 256, 2, 5) - 0.5) * 0.05 + (fbm(u, v, 16, 4, 9) - 0.5) * 0.045 + (fbm(u, v, 64, 2, 13) - 0.5) * 0.03;
    }
  // fibres: short faint curved strokes, wrapped so the tile stays seamless
  let seed = 1;
  const rnd = () => ((seed = Math.imul(seed ^ (seed >>> 15), 2246822507) + 0x9e3779b9), (seed >>> 0) / 4294967296);
  for (let f = 0; f < 900; f++) {
    let x = rnd() * S, y = rnd() * S;
    let ang = rnd() * Math.PI * 2;
    const len = 6 + rnd() * 26;
    const curve = (rnd() - 0.5) * 0.18;
    const tone = (rnd() < 0.7 ? -1 : 1) * (0.02 + rnd() * 0.035);
    for (let s = 0; s < len; s += 0.5) {
      ang += curve * 0.5;
      x += Math.cos(ang) * 0.5;
      y += Math.sin(ang) * 0.5;
      const xi = Math.floor(x), yi = Math.floor(y);
      const fx = x - xi, fy = y - yi;
      const put = (px, py, w) => {
        const k = ((((py % S) + S) % S) * S) + (((px % S) + S) % S);
        buf[k] += tone * w * 0.5;
      };
      put(xi, yi, (1 - fx) * (1 - fy));
      put(xi + 1, yi, fx * (1 - fy));
      put(xi, yi + 1, (1 - fx) * fy);
      put(xi + 1, yi + 1, fx * fy);
    }
  }
  const N = S * S;
  const out = Buffer.alloc(N * 3);
  const base = [251, 247, 239]; // warm ivory
  for (let i = 0; i < N; i++) {
    const k = 1 + buf[i];
    out[i * 3] = clamp255(base[0] * k);
    out[i * 3 + 1] = clamp255(base[1] * k);
    out[i * 3 + 2] = clamp255(base[2] * (k - 0.004));
  }
  await sharp(out, { raw: { width: S, height: S, channels: 3 } }).webp({ quality: 86 }).toFile(file);
}

function norm(v) { const l = Math.hypot(...v); return v.map((c) => c / l); }
function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function clamp255(v) { return Math.max(0, Math.min(255, Math.round(v))); }

await leather(1024, `${out}/leather.webp`);
await paper(512, `${out}/paper.webp`);

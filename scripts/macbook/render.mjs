// Renders the home page's MacBook (scripts/macbook/render.html) to public/macbook/mbp.webp
// and prints where its display sits, for "MacBook" in globals.css and NOTCH_STRIP in
// components/Services.tsx. The scene is drawn at 6000px wide in 2048px tiles (one
// projection, cropped with setViewOffset, so the tiles meet exactly), stitched, and
// supersampled down to 3000px.
//
// usage: PLAYWRIGHT_CORE=/path/to/playwright-core node scripts/macbook/render.mjs [query]
//   e.g. query "finish=silver" (the default is space black). Needs a Chromium with WebGL (Metal on a Mac).
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import sharp from "sharp";

const root = new URL("../..", import.meta.url).pathname;
const out = join(root, "public/macbook/mbp.webp");
const FULL = 6000;
const TILE = 2048;
const query = process.argv[2] ?? "";

const types = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript" };
const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname));
  try {
    const body = await readFile(join(root, path));
    res.writeHead(200, { "content-type": types[extname(path)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
}).listen(0, "127.0.0.1");
await new Promise((r) => server.once("listening", r));
const { port } = server.address();

const { chromium } = await import(process.env.PLAYWRIGHT_CORE ?? "playwright-core");
const browser = await chromium.launch({
  headless: true,
  channel: "chromium",
  args: ["--headless=new", "--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"],
});
try {
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
  await page.goto(`http://127.0.0.1:${port}/scripts/macbook/render.html?w=${FULL}&tile=1&${query}`);
  await page.waitForFunction(() => window.__ready, null, { timeout: 60000 });
  const info = await page.evaluate(() => window.__info);
  const [FW, FH] = info.frame;
  const tiles = [];
  for (let y = 0; y < FH; y += TILE) {
    for (let x = 0; x < FW; x += TILE) {
      const w = Math.min(TILE, FW - x);
      const h = Math.min(TILE, FH - y);
      const url = await page.evaluate(([x, y, w, h]) => window.__renderTile(x, y, w, h), [x, y, w, h]);
      tiles.push({ input: Buffer.from(url.split(",")[1], "base64"), left: x, top: y });
    }
  }
  const full = await sharp({ create: { width: FW, height: FH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(tiles)
    .png()
    .toBuffer();
  const saved = await sharp(full)
    .resize(FULL / 2, null, { kernel: "lanczos3" })
    .webp({ quality: 90, alphaQuality: 100, effort: 6, smartSubsample: true })
    .toFile(out);

  // The display, grown by 0.05% of the width each side so the cut's soft edge has photo under it
  const [l, t] = info.dispTL;
  const [r, b] = info.dispBR;
  const g = 0.0005 * FW;
  const pct = (v) => `${v.toFixed(3)}%`;
  console.log(`${out}: ${saved.width}x${saved.height}, ${saved.size} bytes`);
  console.log(`.mbp aspect-ratio: ${FW} / ${FH}`);
  console.log(
    `.mbp-screen left ${pct(((l - g) / FW) * 100)} top ${pct(((t - g) / FH) * 100)} width ${pct(((r - l + 2 * g) / FW) * 100)} height ${pct(((b - t + 2 * g) / FH) * 100)}`,
  );
  console.log(`NOTCH_STRIP ${((info.stripY - t) / (b - t)).toFixed(4)}, display aspect ${((r - l) / (b - t)).toFixed(4)}`);
} finally {
  await browser.close();
  server.close();
}

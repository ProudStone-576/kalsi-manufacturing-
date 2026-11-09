// Downloads the site photographs from Wikimedia Commons, resizes them and writes src/content/image-credits.json.
// Re-run only when changing the photo set: node scripts/fetch-images.mjs
import sharp from "sharp";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const UA = { "User-Agent": "ss-kalsi-website/1.0 (image fetch)" };

/** name → Commons file title. All are CC0 / public domain / CC BY / CC BY-SA (commercial use allowed with credit). */
const PHOTOS = {
  "guillotine-shear-blade": "File:Gasparini sheet metal hydraulic guillotine power shear.jpg",
  "grinding-sparks": "File:Peça acer planejada amb rectificadora.jpg",
  "surface-grinder": "File:FlickGrinder.jpg",
  "heat-treatment-furnace": "File:Computerised Heat Treatment Furnance.jpg",
  "fabrication-cutting": "File:Steel iron construction worker - 8378.jpg",
  "fabrication-sparks": "File:Steel iron construction worker - 8338.jpg",
  "steel-coils": "File:Leeco Steel Trading - Coils.jpg",
};

const strip = (s = "") => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

await mkdir("public/images", { recursive: true });
const creditsFile = "src/content/image-credits.json";
const credits = existsSync(creditsFile) ? JSON.parse(await readFile(creditsFile, "utf8")) : {};

async function getJson(url) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(url, { headers: UA });
    if (res.ok) return res.json();
    await sleep(5000 * (attempt + 1)); // Commons rate limit: back off
  }
  throw new Error(`Failed: ${url}`);
}

for (const [name, title] of Object.entries(PHOTOS)) {
  if (credits[name] && existsSync(`public/images/${name}.jpg`)) continue;
  await sleep(2500);
  const api = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=2000&format=json`;
  const page = Object.values((await getJson(api)).query.pages)[0];
  const ii = page.imageinfo[0];
  const m = ii.extmetadata;
  const src = ii.width > 2000 ? ii.thumburl : ii.url;
  const buf = Buffer.from(await (await fetch(src, { headers: UA })).arrayBuffer());
  const out = await sharp(buf).rotate().resize({ width: 2000, withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toBuffer({ resolveWithObject: true });
  await writeFile(`public/images/${name}.jpg`, out.data);
  credits[name] = {
    title: title.replace(/^File:/, "").replace(/\.jpe?g$/i, ""),
    author: strip(m.Artist?.value) || "Unknown",
    license: m.LicenseShortName?.value ?? "",
    licenseUrl: m.LicenseUrl?.value ?? null,
    source: ii.descriptionurl,
    width: out.info.width,
    height: out.info.height,
  };
  await writeFile(creditsFile, JSON.stringify(credits, null, 2) + "\n");
  console.log(name, out.info.width, out.info.height, Math.round(out.data.length / 1024) + "KB", credits[name].license);
}

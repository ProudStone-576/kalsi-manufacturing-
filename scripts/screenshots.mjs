// Captures full-page screenshots of every page at desktop and mobile widths and reports console errors.
// Usage: node scripts/screenshots.mjs [baseUrl] [outDir]
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const base = process.argv[2] ?? "http://localhost:3400";
const out = process.argv[3] ?? "screenshots";
const pages = ["/", "/credits", "/products", "/products/shearing-blades", "/manufacturing", "/about", "/contact?type=quote", "/privacy", "/does-not-exist"];
const sizes = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } };

await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL ?? "chrome" });
let problems = 0;
for (const [label, viewport] of Object.entries(sizes)) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") {
      problems++;
      console.log(`[${label}] console.${m.type()}: ${m.text()}`);
    }
  });
  page.on("pageerror", (e) => {
    problems++;
    console.log(`[${label}] pageerror: ${e.message}`);
  });
  for (const p of pages) {
    await page.goto(base + p, { waitUntil: "networkidle" });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 0) {
      problems++;
      console.log(`[${label}] horizontal overflow ${overflow}px on ${p}`);
    }
    // Scroll through so lazy-loaded images load before the full-page capture.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForLoadState("networkidle");
    const name = p === "/" ? "home" : p.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
    await page.screenshot({ path: `${out}/${label}-${name}.png`, fullPage: true });
  }
  await ctx.close();
}
await browser.close();
console.log(problems ? `${problems} problem(s)` : "no console errors, no overflow");

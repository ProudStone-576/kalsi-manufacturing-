import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { watchConsole } from "./helpers";

const PAGES = [
  { path: "/", h1: /Precision tools built to cut and mark/ },
  { path: "/products", h1: /Precision tools to cut and mark/ },
  { path: "/products/shearing-blades", h1: /Shearing blades/ },
  { path: "/manufacturing", h1: /How our tools are made/ },
  { path: "/about", h1: /S\.S\. Kalsi Industries: precision tools built to cut and mark/ },
  { path: "/contact", h1: /Tell us about the tool you need/ },
  { path: "/privacy", h1: /Privacy notice/ },
  { path: "/credits", h1: /Photographs on this site/ },
];

test.describe("every page", () => {
  for (const p of PAGES) {
    test(`${p.path} renders, has one h1, no console/CSP errors, no horizontal scroll, passes axe`, async ({ page }) => {
      const errors = watchConsole(page);
      const res = await page.goto(p.path);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toHaveText(p.h1);
      await expect(page).toHaveTitle(/S\.S\. Kalsi Industries/);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      // Audit the settled page: scroll-driven reveal animations would otherwise be measured mid-fade.
      await page.emulateMedia({ reducedMotion: "reduce" });
      const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      expect(axe.violations.map((v) => `${v.id}: ${v.nodes.length} — ${v.nodes[0]?.target.join(" ")}`)).toEqual([]);
      expect(errors).toEqual([]);
    });
  }

  test("unknown pages return the 404 page", async ({ page }) => {
    const res = await page.goto("/products/not-a-blade");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/could not be found/);
    await page.getByRole("link", { name: "Product catalogue" }).click();
    await expect(page).toHaveURL(/\/products$/);
  });
});

test.describe("navigation", () => {
  test("primary navigation reaches every section", async ({ page, isMobile }) => {
    await page.goto("/");
    const targets = ["Products", "Manufacturing & Quality", "About", "Contact"];
    for (const name of targets) {
      if (isMobile) {
        await page.getByRole("button", { name: "Open menu" }).click();
        await page.locator("#mobile-nav").getByRole("link", { name }).click();
        await expect(page.locator("#mobile-nav")).toHaveCount(0);
      } else {
        await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name }).click();
      }
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator(`nav a[aria-current="page"]`).first()).toBeAttached();
    }
  });

  test("mobile menu closes with Escape and returns focus", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile only");
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Open menu" });
    await toggle.click();
    await expect(page.locator("#mobile-nav")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#mobile-nav")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
  });

  test("skip link moves focus to main content", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard flow");
    await page.goto("/about");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });

  test("home category rows open a filtered catalogue", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Trimming & slitting cutters.*narrow strips/ }).click();
    await expect(page).toHaveURL(/category=trimming-slitting/);
    await expect(page.getByRole("status").first()).toContainText("2 of 5");
  });

  test("footer links all resolve", async ({ page, request }) => {
    await page.goto("/");
    const hrefs = await page.locator("footer a[href^='/']").evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute("href")!))]);
    expect(hrefs.length).toBeGreaterThan(10);
    for (const h of hrefs) {
      const res = await request.get(h.split("#")[0]!);
      expect(res.status(), h).toBe(200);
    }
  });
});

test.describe("hero slide banner", () => {
  test("arrows, tabs and pause control the slides", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    const slides = page.locator(".hero-slide");
    await expect(slides).toHaveCount(4);
    const active = page.locator('.hero-slide[data-active="true"]');
    await expect(active).toHaveAttribute("aria-label", "1 of 4");
    await page.getByRole("button", { name: "Next slide" }).click();
    await expect(active).toHaveAttribute("aria-label", "2 of 4");
    await expect(active.getByRole("link", { name: /Shearing blades/ })).toBeVisible();
    await page.getByRole("button", { name: "Previous slide" }).click();
    await page.getByRole("button", { name: "Previous slide" }).click();
    await expect(active).toHaveAttribute("aria-label", "4 of 4");
    await page.getByRole("button", { name: /Slide 03/ }).click();
    await expect(active).toHaveAttribute("aria-label", "3 of 4");
    await page.getByRole("button", { name: "Stop automatic slide show" }).click();
    await expect(page.getByRole("button", { name: "Start automatic slide show" })).toBeVisible();
    // hidden slides cannot be reached by keyboard or screen readers
    await expect(slides.nth(0)).toHaveAttribute("aria-hidden", "true");
  });

  test("slide call-to-action opens the filtered catalogue", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Next slide" }).click();
    await page.locator('.hero-slide[data-active="true"]').getByRole("link", { name: /Shearing blades/ }).click();
    await expect(page).toHaveURL(/category=shearing-blades/);
  });

  test("all photographs load and are credited", async ({ page, request }) => {
    await page.goto("/credits");
    const imgs = page.locator(".credits-list img");
    await expect(imgs).toHaveCount(7);
    for (const src of await imgs.evaluateAll((els) => els.map((e) => (e as HTMLImageElement).currentSrc || (e as HTMLImageElement).src))) {
      const res = await request.get(src);
      expect(res.status(), src).toBe(200);
      expect(res.headers()["content-type"]).toMatch(/^image\//);
    }
    await expect(page.getByRole("link", { name: "Source" })).toHaveCount(7);
  });
});

test.describe("site search", () => {
  test("keyboard shortcut opens search and Enter opens the top result", async ({ page, isMobile }) => {
    await page.goto("/");
    if (isMobile) await page.getByRole("button", { name: /Search/ }).click();
    else await page.keyboard.press("/");
    const box = page.getByRole("combobox", { name: "Search" });
    await expect(box).toBeFocused();
    await box.fill("stamps");
    await expect(page.getByRole("option").first()).toContainText("Steel stamps");
    await box.press("Enter");
    await expect(page).toHaveURL(/\/products\/steel-stamps$/);
    await expect(page.locator("h1")).toHaveText("Steel stamps");
  });

  test("arrow keys move the selection and Escape closes", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard flow");
    await page.goto("/about");
    await page.keyboard.press("Control+k");
    const box = page.getByRole("combobox", { name: "Search" });
    await box.fill("steel");
    await box.press("ArrowDown");
    await expect(page.getByRole("option").nth(1)).toHaveAttribute("aria-selected", "true");
    await box.press("Escape");
    await expect(page.locator("dialog[open]")).toHaveCount(0);
  });

  test("no matches shows a helpful message", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Search/ }).click();
    await page.getByRole("combobox", { name: "Search" }).fill("qwertyuiop");
    await expect(page.getByText(/Nothing matches/)).toBeVisible();
  });
});

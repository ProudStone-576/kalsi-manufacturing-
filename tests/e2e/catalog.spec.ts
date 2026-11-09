import { expect, test } from "@playwright/test";

test.describe("catalogue filtering", () => {
  test("filters update results and the URL; chips remove filters", async ({ page }) => {
    await page.goto("/products");
    const status = page.getByRole("status").first();
    await expect(status).toContainText("5 of 5");

    await page.getByRole("checkbox", { name: /Trimming & slitting cutters/ }).check();
    await expect(page).toHaveURL(/category=trimming-slitting/);
    await expect(status).toContainText("2 of 5");
    await expect(page.getByRole("checkbox", { name: /Trimming & slitting cutters/ })).toBeChecked();

    await page.getByRole("checkbox", { name: /Steel stamps/ }).check();
    await expect(page).toHaveURL(/category=steel-stamps/);
    await expect(status).toContainText("3 of 5");
    await expect(page.getByRole("heading", { level: 2, name: "Steel stamps" })).toBeVisible();

    await page.getByRole("link", { name: "Remove filter Trimming & slitting cutters" }).click();
    await expect(page).not.toHaveURL(/category=trimming-slitting/);
    await expect(page.getByRole("checkbox", { name: /Trimming & slitting cutters/ })).not.toBeChecked();

    await page.getByRole("link", { name: "Clear all" }).click();
    await expect(status).toContainText("5 of 5");
  });

  test("text search narrows results and keeps focus while typing", async ({ page }) => {
    await page.goto("/products");
    const box = page.getByRole("searchbox", { name: "Search" });
    await box.pressSequentially("decoiler", { delay: 40 });
    await expect(page).toHaveURL(/q=decoiler/);
    await expect(box).toBeFocused();
    await expect(box).toHaveValue("decoiler");
    await expect(page.getByRole("status").first()).toContainText("1 of 5");
  });

  test("an impossible combination shows the empty state with a way out", async ({ page }) => {
    await page.goto("/products?category=steel-stamps&q=decoiler");
    await expect(page.getByText("No products match these filters.")).toBeVisible();
    await page.getByRole("link", { name: "Ask about a custom tool" }).click();
    await expect(page).toHaveURL(/\/contact\?type=quote/);
  });

  test("hostile query parameters are ignored and safely echoed", async ({ page }) => {
    const res = await page.goto("/products?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E&category=%3Cimg%3E");
    expect(res?.status()).toBe(200);
    await expect(page.locator("script:text('alert(1)')")).toHaveCount(0);
    await expect(page.getByRole("searchbox", { name: "Search" })).toHaveValue("<script>alert(1)</script>");
  });

  test("product cards open product pages", async ({ page }) => {
    await page.goto("/products");
    await page.getByRole("link", { name: "Slitting cutters", exact: true }).click();
    await expect(page).toHaveURL(/\/products\/slitting-cutters$/);
    await expect(page.locator("aside").getByRole("img", { name: /Technical illustration/ })).toBeVisible();
  });
});

test.describe("catalogue without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the filter form still works as a plain GET form", async ({ page }) => {
    await page.goto("/products");
    await page.getByRole("checkbox", { name: /Trimming & slitting cutters/ }).check();
    await page.getByRole("button", { name: "Apply filters" }).click();
    await expect(page).toHaveURL(/category=trimming-slitting/);
    await expect(page.getByRole("status").first()).toContainText("2 of 5");
  });
});

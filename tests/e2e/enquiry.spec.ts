import { expect, test } from "@playwright/test";
import { asFreshClient, findRecord, PDF_BYTES, readOutbox } from "./helpers";

test.beforeEach(async ({ page }) => {
  await asFreshClient(page);
});

test.describe("quote list", () => {
  test("add from product pages, edit, and carry into the quote form", async ({ page }) => {
    await page.goto("/products/guillotine-shear-blades");
    await page.getByRole("button", { name: "Add to quote list" }).click();
    await expect(page.getByText("Guillotine shear blades added to your quote list.")).toBeVisible();
    await expect(page.getByRole("link", { name: "In your quote list" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Quote list, 1 item" })).toBeVisible();

    await page.goto("/products/paper-guillotine-knives");
    await page.getByRole("button", { name: "Add to quote list" }).click();
    await expect(page.getByRole("link", { name: "Quote list, 2 items" })).toBeVisible();

    // persists across reloads
    await page.reload();
    await expect(page.getByRole("link", { name: "Quote list, 2 items" })).toBeVisible();

    await page.getByRole("link", { name: "Quote list, 2 items" }).click();
    await expect(page).toHaveURL(/type=quote/);
    const rows = page.locator(".items-table tbody tr");
    await expect(rows).toHaveCount(2);
    await page.getByRole("spinbutton", { name: "Quantity of Guillotine shear blades" }).fill("6");
    await page.getByRole("button", { name: "Remove Paper guillotine knives" }).click();
    await expect(rows).toHaveCount(1);
    await expect(page.getByRole("link", { name: "Quote list, 1 item" })).toBeVisible();

    await page.getByLabel("Add a blade type").selectOption("scrap-shear-blades");
    await page.getByRole("button", { name: "Add", exact: true }).click();
    await expect(rows).toHaveCount(2);
  });

  test("a product's quote button pre-fills that blade", async ({ page }) => {
    await page.goto("/products/rotary-slitter-knives");
    await page.locator("main").getByRole("link", { name: "Request a quote" }).first().click();
    await expect(page.getByRole("radio", { name: "Request a quote" })).toBeChecked();
    await expect(page.locator(".items-table")).toContainText("Rotary slitter knives & spacers");
  });
});

test.describe("enquiry form", () => {
  test("client-side validation shows errors and focuses the first problem", async ({ page }) => {
    await page.goto("/contact");
    await page.getByRole("button", { name: "Send enquiry" }).click();
    await expect(page.locator(".alert--error")).toContainText("Please correct the highlighted fields.");
    const name = page.getByLabel("Name", { exact: true });
    await expect(name).toBeFocused();
    await expect(name).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByText("Name is required.").or(page.getByText(/Name must be at least/))).toBeVisible();
    await expect(page.getByText("Enter a valid email address.")).toBeVisible();
    await expect(page.getByText("Please agree so we can reply to you.")).toBeVisible();

    await name.fill("Ravi Sandhu");
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByRole("button", { name: "Send enquiry" }).click();
    await expect(page.getByLabel("Email")).toBeFocused();
  });

  test("rejected attachments are reported before sending", async ({ page }) => {
    await page.goto("/contact");
    await page.locator('input[type="file"]').setInputFiles({ name: "virus.exe", mimeType: "application/octet-stream", buffer: Buffer.from("MZ") });
    await expect(page.getByText("“virus.exe” is not an accepted file type.")).toBeVisible();
    await page.getByRole("button", { name: "Remove virus.exe" }).click();
    await expect(page.getByText(/not an accepted file type/)).toHaveCount(0);
  });

  test("a full quote request with a drawing is stored and emailed", async ({ page }) => {
    await page.goto("/contact?type=quote&product=hot-crop-and-flying-shear-blades");
    await expect(page.locator(".items-table")).toContainText("Hot crop & flying shear blades");
    await page.getByRole("spinbutton", { name: /Quantity of Hot crop/ }).fill("4");
    await page.getByLabel("Machine make & model").fill("Crank flying shear, bar mill");
    await page.getByLabel("Material being cut").fill("Hot billet");
    await page.getByLabel("Blade length (mm)").fill("850");
    await page.locator('input[name="cuttingEdges"][value="2"]').check();
    await page.getByLabel("Name", { exact: true }).fill("Gurpreet Singh");
    await page.getByLabel("Company (optional)").fill("Example Steel <Rolling> Mills");
    await page.getByLabel("Email").fill("gurpreet@example.com");
    await page.getByLabel("Phone (optional)").fill("+91 98765 43210");
    await page.getByLabel("Anything else we should know").fill("Current blades crack after two weeks.\nNeed delivery to Ludhiana.");
    await page.locator('input[type="file"]').setInputFiles({ name: "blade-drawing.pdf", mimeType: "application/pdf", buffer: PDF_BYTES });
    await expect(page.getByText("blade-drawing.pdf")).toBeVisible();
    await page.getByLabel(/I agree that S\.K\. Kalsi/).check();
    await page.getByRole("button", { name: "Send quote request" }).click();

    const status = page.getByRole("status").filter({ hasText: "your enquiry has been received" });
    await expect(status).toBeVisible();
    const reference = (await status.locator("strong").nth(1).textContent())!.trim();
    expect(reference).toMatch(/^SKK-\d{6}-[0-9A-Z]{5}$/);
    await expect(page.getByRole("link", { name: "Quote list, empty" })).toBeVisible();

    const rec = (await findRecord(reference)) as { enquiry: Record<string, unknown>; attachments: { filename: string }[] };
    expect(rec.enquiry).toMatchObject({
      kind: "quote",
      name: "Gurpreet Singh",
      company: "Example Steel <Rolling> Mills",
      items: [{ slug: "hot-crop-and-flying-shear-blades", quantity: 4 }],
      bladeLength: 850,
      cuttingEdges: "2",
    });
    expect(rec.attachments[0]?.filename).toBe("blade-drawing.pdf");

    const eml = await readOutbox(reference);
    expect(eml).toContain(`Subject: [${reference}] RFQ from Example Steel <Rolling> Mills`);
    expect(eml).toMatch(/Reply-To: "?Gurpreet Singh"? <gurpreet@example\.com>/);
    expect(eml).toContain("Example Steel &lt;Rolling&gt; Mills");
    expect(eml).toContain('filename=blade-drawing.pdf');

    await page.getByRole("button", { name: "Send another enquiry" }).click();
    await expect(page.getByRole("button", { name: /Send (quote request|enquiry)/ })).toBeVisible();
  });

  test("a general question can be sent", async ({ page }) => {
    await page.goto("/contact");
    await page.getByLabel("Name", { exact: true }).fill("Maria Lopez");
    await page.getByLabel("Email").fill("maria@example.org");
    await page.getByLabel("Message").fill("Can D2 blades be reground, and how often?");
    await page.getByLabel(/I agree/).check();
    await page.getByRole("button", { name: "Send enquiry" }).click();
    await expect(page.getByText("Thank you — your enquiry has been received.")).toBeVisible();
  });
});

test.describe("enquiry form without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("posts as a normal form and lands on the thank-you page", async ({ page }) => {
    await page.goto("/contact?type=quote&product=granulator-knives");
    await expect(page.getByText("Granulator knives × 1")).toBeVisible();
    await page.getByLabel("Name", { exact: true }).fill("No Script User");
    await page.getByLabel("Email").fill("noscript@example.com");
    await page.getByLabel("Anything else we should know").fill("Twelve rotor knives for a 600 mm granulator.");
    await page.getByLabel(/I agree/).check();
    await page.getByRole("button", { name: "Send quote request" }).click();
    await expect(page).toHaveURL(/\/contact\/thank-you\?ref=SKK-/);
    const ref = new URL(page.url()).searchParams.get("ref")!;
    await expect(page.getByText(ref)).toBeVisible();
    const rec = (await findRecord(ref)) as { enquiry: { items: unknown[] } };
    expect(rec.enquiry.items).toEqual([{ slug: "granulator-knives", quantity: 1 }]);
  });

  test("server-side validation sends the visitor back with a message", async ({ page }) => {
    await page.goto("/contact");
    await page.getByLabel("Name", { exact: true }).fill("X");
    await page.getByRole("button", { name: "Send enquiry" }).click();
    await expect(page).toHaveURL(/\/contact\?status=invalid/);
    await expect(page.locator(".alert--error")).toContainText("Some details were missing or invalid");
  });
});

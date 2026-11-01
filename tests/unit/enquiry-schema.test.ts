import { describe, expect, it } from "vitest";
import { enquirySchema, fieldErrors, formDataToInput } from "@/lib/enquiry-schema";

const base = {
  kind: "general",
  name: "Asha Mehta",
  email: "asha@example.com",
  message: "Do you make blades for a 3 m guillotine?",
  consent: "yes",
};

function fd(obj: Record<string, string | string[]>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(obj)) for (const x of Array.isArray(v) ? v : [v]) f.append(k, x);
  return f;
}

describe("enquirySchema", () => {
  it("accepts a minimal general enquiry and normalises optional fields", () => {
    const r = enquirySchema.parse(formDataToInput(fd(base)));
    expect(r.name).toBe("Asha Mehta");
    expect(r.company).toBe("");
    expect(r.items).toEqual([]);
    expect(r.bladeLength).toBeNull();
  });

  it("trims and normalises text", () => {
    const r = enquirySchema.parse(formDataToInput(fd({ ...base, name: "  Asha  ", email: " asha@example.com " })));
    expect(r.name).toBe("Asha");
    expect(r.email).toBe("asha@example.com");
  });

  it.each([
    ["name", "A"],
    ["name", "x".repeat(101)],
    ["email", "not-an-email"],
    ["message", "short"],
    ["phone", "call me maybe"],
    ["consent", "no"],
  ])("rejects invalid %s", (field, value) => {
    const r = enquirySchema.safeParse(formDataToInput(fd({ ...base, [field]: value })));
    expect(r.success).toBe(false);
    if (!r.success) expect(fieldErrors(r.error)[field]).toBeTruthy();
  });

  it("rejects header-injection attempts in single-line fields", () => {
    for (const field of ["name", "company", "email"]) {
      const r = enquirySchema.safeParse(formDataToInput(fd({ ...base, [field]: "Evil\r\nBcc: victim@example.com" })));
      expect(r.success, field).toBe(false);
    }
  });

  it("rejects control characters in the message but keeps newlines", () => {
    expect(enquirySchema.safeParse(formDataToInput(fd({ ...base, message: "Line one\nLine two is fine" }))).success).toBe(true);
    expect(enquirySchema.safeParse(formDataToInput(fd({ ...base, message: "bad \u0007 bell character" }))).success).toBe(false);
  });

  it("parses quote items, quantities and millimetre values", () => {
    const r = enquirySchema.parse(
      formDataToInput(
        fd({
          ...base,
          kind: "quote",
          itemSlug: ["guillotine-shear-blades", "rotary-slitter-knives"],
          itemQty: ["4", "12"],
          bladeLength: "3100",
          bladeThickness: "25,5",
          cuttingEdges: "4",
        }),
      ),
    );
    expect(r.items).toEqual([
      { slug: "guillotine-shear-blades", quantity: 4 },
      { slug: "rotary-slitter-knives", quantity: 12 },
    ]);
    expect(r.bladeLength).toBe(3100);
    expect(r.bladeThickness).toBe(25.5);
    expect(r.cuttingEdges).toBe("4");
  });

  it("rejects unknown products, duplicates, bad quantities and bad numbers", () => {
    const bad: Record<string, string | string[]>[] = [
      { itemSlug: "made-up-blade", itemQty: "1" },
      { itemSlug: ["guillotine-shear-blades", "guillotine-shear-blades"], itemQty: ["1", "1"] },
      { itemSlug: "guillotine-shear-blades", itemQty: "0" },
      { itemSlug: "guillotine-shear-blades", itemQty: "1.5" },
      { itemSlug: "guillotine-shear-blades", itemQty: "1", bladeLength: "-3" },
      { itemSlug: "guillotine-shear-blades", itemQty: "1", bladeLength: "1e5" },
      { itemSlug: "guillotine-shear-blades", itemQty: "1", cuttingEdges: "3" },
    ];
    for (const b of bad) {
      expect(enquirySchema.safeParse(formDataToInput(fd({ ...base, kind: "quote", ...b }))).success, JSON.stringify(b)).toBe(false);
    }
  });

  it("requires something to quote on a quote request", () => {
    const r = enquirySchema.safeParse(formDataToInput(fd({ ...base, kind: "quote" })));
    expect(r.success).toBe(false);
    if (!r.success) expect(fieldErrors(r.error).items).toMatch(/at least one blade/);
    expect(enquirySchema.safeParse(formDataToInput(fd({ ...base, kind: "quote", machine: "Hydraulic shear 3 m" }))).success).toBe(true);
  });

  it("caps the number of items", () => {
    const slugs = Array.from({ length: 30 }, () => "guillotine-shear-blades");
    expect(enquirySchema.safeParse(formDataToInput(fd({ ...base, kind: "quote", itemSlug: slugs, itemQty: slugs.map(() => "1") }))).success).toBe(false);
  });

  it("rejects an unknown enquiry type", () => {
    expect(enquirySchema.safeParse(formDataToInput(fd({ ...base, kind: "admin" }))).success).toBe(false);
  });
});

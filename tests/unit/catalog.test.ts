import { describe, expect, it } from "vitest";
import { catalogHref, filterProducts, parseCatalogQuery } from "@/lib/catalog";
import { search } from "@/lib/search";
import { products, relatedProducts } from "@/content/products";
import { industries } from "@/content/industries";
import { materials } from "@/content/materials";

describe("catalogue query parsing", () => {
  it("keeps only known values from untrusted params", () => {
    const q = parseCatalogQuery({
      q: "  rebar\u0000 ",
      category: ["rolling-mill", "<script>"],
      industry: "steel-mills,nope",
      machine: "Cold shears",
    });
    expect(q).toEqual({ q: "rebar", category: ["rolling-mill"], industry: ["steel-mills"], machine: ["Cold shears"] });
  });

  it("truncates very long search text", () => {
    expect(parseCatalogQuery({ q: "x".repeat(500) }).q).toHaveLength(80);
  });
});

describe("filtering", () => {
  const empty = { q: "", category: [], industry: [], machine: [] };

  it("returns everything with no filters", () => {
    expect(filterProducts(empty)).toHaveLength(products.length);
  });

  it("filters by category, industry and machine (AND across groups, OR within)", () => {
    const mills = filterProducts({ ...empty, category: ["rolling-mill"] });
    expect(mills.map((p) => p.slug)).toEqual(["hot-crop-and-flying-shear-blades", "billet-and-bloom-shear-blades", "bar-and-rebar-shear-blades"]);
    const both = filterProducts({ ...empty, category: ["rolling-mill", "paper-converting"] });
    expect(both).toHaveLength(4);
    const recyclingMills = filterProducts({ ...empty, category: ["rolling-mill"], industry: ["recycling"] });
    expect(recyclingMills.map((p) => p.slug)).toEqual(["billet-and-bloom-shear-blades"]);
  });

  it("matches text by word prefix across all tokens", () => {
    expect(filterProducts({ ...empty, q: "rebar" }).map((p) => p.slug)).toContain("bar-and-rebar-shear-blades");
    expect(filterProducts({ ...empty, q: "slit knif" }).map((p) => p.slug)).toContain("rotary-slitter-knives");
    expect(filterProducts({ ...empty, q: "zzzz" })).toHaveLength(0);
  });

  it("builds shareable URLs", () => {
    expect(catalogHref({ category: ["recycling"], q: "scrap" })).toBe("/products?q=scrap&category=recycling");
    expect(catalogHref({})).toBe("/products");
  });
});

describe("site search", () => {
  it("ranks title matches first", () => {
    const r = search("granulator");
    expect(r[0]?.href).toBe("/products/granulator-knives");
  });
  it("finds materials and pages", () => {
    expect(search("H13").some((e) => e.kind === "Material")).toBe(true);
    expect(search("contact").some((e) => e.href === "/contact")).toBe(true);
  });
  it("returns nothing for empty input", () => {
    expect(search("   ")).toEqual([]);
  });
});

describe("content integrity", () => {
  it("has unique slugs and valid references", () => {
    const slugs = products.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    const ind = new Set(industries.map((i) => i.id));
    const mat = new Set(materials.map((m) => m.id));
    for (const p of products) {
      expect(p.slug).toMatch(/^[a-z0-9-]+$/);
      for (const i of p.industries) expect(ind.has(i), `${p.slug}: ${i}`).toBe(true);
      for (const g of p.grades) expect(mat.has(g), `${p.slug}: ${g}`).toBe(true);
    }
  });
  it("every industry has at least one product", () => {
    for (const i of industries) expect(products.some((p) => p.industries.includes(i.id)), i.id).toBe(true);
  });
  it("related products exclude the product itself", () => {
    for (const p of products) expect(relatedProducts(p).some((r) => r.slug === p.slug)).toBe(false);
  });
});

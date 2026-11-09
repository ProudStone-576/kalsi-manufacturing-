import { describe, expect, it } from "vitest";
import { catalogHref, filterProducts, parseCatalogQuery } from "@/lib/catalog";
import { search } from "@/lib/search";
import { categories, products, relatedProducts } from "@/content/products";

describe("catalogue query parsing", () => {
  it("keeps only known values from untrusted params", () => {
    const q = parseCatalogQuery({
      q: "  punch\u0000 ",
      category: ["piercing-punches", "<script>"],
      industry: "steel-mills",
    });
    expect(q).toEqual({ q: "punch", category: ["piercing-punches"] });
  });

  it("truncates very long search text", () => {
    expect(parseCatalogQuery({ q: "x".repeat(500) }).q).toHaveLength(80);
  });
});

describe("filtering", () => {
  const empty = { q: "", category: [] };

  it("returns everything with no filters", () => {
    expect(filterProducts(empty)).toHaveLength(products.length);
  });

  it("filters by category (OR within the group)", () => {
    const cutters = filterProducts({ ...empty, category: ["trimming-slitting"] });
    expect(cutters.map((p) => p.slug)).toEqual(["trimming-cutters", "slitting-cutters"]);
    const both = filterProducts({ ...empty, category: ["trimming-slitting", "steel-stamps"] });
    expect(both).toHaveLength(3);
  });

  it("matches text by word prefix across all tokens", () => {
    expect(filterProducts({ ...empty, q: "decoiler" }).map((p) => p.slug)).toEqual(["slitting-cutters"]);
    expect(filterProducts({ ...empty, q: "pierc punch" }).map((p) => p.slug)).toContain("steel-piercing-punches");
    expect(filterProducts({ ...empty, q: "zzzz" })).toHaveLength(0);
  });

  it("builds shareable URLs", () => {
    expect(catalogHref({ category: ["steel-stamps"], q: "coding" })).toBe("/products?q=coding&category=steel-stamps");
    expect(catalogHref({})).toBe("/products");
  });
});

describe("site search", () => {
  it("ranks title matches first", () => {
    const r = search("stamps");
    expect(r[0]?.href).toBe("/products/steel-stamps");
  });
  it("finds pages", () => {
    expect(search("contact").some((e) => e.href === "/contact")).toBe(true);
  });
  it("returns nothing for empty input", () => {
    expect(search("   ")).toEqual([]);
  });
});

describe("content integrity", () => {
  it("has unique slugs and valid categories", () => {
    const slugs = products.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    const cats = new Set(categories.map((c) => c.id));
    for (const p of products) {
      expect(p.slug).toMatch(/^[a-z0-9-]+$/);
      expect(cats.has(p.category), p.slug).toBe(true);
    }
  });
  it("every category has at least one product", () => {
    for (const c of categories) expect(products.some((p) => p.category === c.id), c.id).toBe(true);
  });
  it("related products exclude the product itself", () => {
    for (const p of products) expect(relatedProducts(p).some((r) => r.slug === p.slug)).toBe(false);
  });
});

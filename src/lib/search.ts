import { products, categoryById } from "@/content/products";
import { tokenize } from "./catalog";

export type SearchEntry = {
  id: string;
  title: string;
  kind: "Product" | "Page";
  href: string;
  description: string;
  text: string;
};

const pages: Omit<SearchEntry, "text">[] = [
  { id: "page-home", title: "Home", kind: "Page", href: "/", description: "Precision tools built to cut and mark." },
  { id: "page-products", title: "Product catalogue", kind: "Page", href: "/products", description: "Browse every product." },
  { id: "page-manufacturing", title: "Manufacturing & quality", kind: "Page", href: "/manufacturing", description: "Tool steel, heat treatment and precision grinding." },
  { id: "page-about", title: "About S.S. Kalsi Industries", kind: "Page", href: "/about", description: "Who we are, what we make and our mission." },
  { id: "page-contact", title: "Contact & request a quote", kind: "Page", href: "/contact", description: "Send a drawing, sample or specification, or ask a question." },
];

export const searchIndex: SearchEntry[] = [
  ...products.map((p) => ({
    id: `product-${p.slug}`,
    title: p.name,
    kind: "Product" as const,
    href: `/products/${p.slug}`,
    description: p.summary,
    text: [p.name, p.summary, categoryById[p.category].name, ...p.uses, ...p.keywords].join(" "),
  })),
  ...pages.map((p) => ({ ...p, text: `${p.title} ${p.description}` })),
];

/** Ranked search: title prefix hits outrank body hits; every token must match something. */
export function search(query: string, limit = 8): SearchEntry[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];
  const scored: { e: SearchEntry; s: number }[] = [];
  for (const e of searchIndex) {
    const titleWords = tokenize(e.title);
    const bodyWords = tokenize(e.text);
    let s = 0;
    let all = true;
    for (const t of tokens) {
      if (titleWords.some((w) => w.startsWith(t))) s += 3;
      else if (bodyWords.some((w) => w.startsWith(t))) s += 1;
      else {
        all = false;
        break;
      }
    }
    if (all) scored.push({ e, s: s + (e.kind === "Product" ? 0.5 : 0) });
  }
  return scored
    .sort((a, b) => b.s - a.s || a.e.title.localeCompare(b.e.title))
    .slice(0, limit)
    .map(({ e }) => e);
}

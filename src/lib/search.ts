import { products, categoryById } from "@/content/products";
import { industries } from "@/content/industries";
import { materials } from "@/content/materials";
import { tokenize } from "./catalog";

export type SearchEntry = {
  id: string;
  title: string;
  kind: "Product" | "Industry" | "Page" | "Material";
  href: string;
  description: string;
  text: string;
};

const pages: Omit<SearchEntry, "text">[] = [
  { id: "page-home", title: "Home", kind: "Page", href: "/", description: "Shearing blades made to drawing." },
  { id: "page-products", title: "Product catalogue", kind: "Page", href: "/products", description: "Browse every blade type." },
  { id: "page-industries", title: "Industries served", kind: "Page", href: "/industries", description: "Blades by industry and application." },
  { id: "page-manufacturing", title: "Manufacturing & quality", kind: "Page", href: "/manufacturing", description: "How a shear blade is made and checked." },
  { id: "page-about", title: "About S.K. Kalsi", kind: "Page", href: "/about", description: "Who we are and how we work." },
  { id: "page-contact", title: "Contact & request a quote", kind: "Page", href: "/contact", description: "Send a drawing or ask a question." },
];

export const searchIndex: SearchEntry[] = [
  ...products.map((p) => ({
    id: `product-${p.slug}`,
    title: p.name,
    kind: "Product" as const,
    href: `/products/${p.slug}`,
    description: p.summary,
    text: [p.name, p.summary, categoryById[p.category].name, ...p.machines, ...p.keywords].join(" "),
  })),
  ...industries.map((i) => ({
    id: `industry-${i.id}`,
    title: i.name,
    kind: "Industry" as const,
    href: `/industries#${i.id}`,
    description: i.summary,
    text: [i.name, i.short, i.summary].join(" "),
  })),
  ...materials.map((m) => ({
    id: `material-${m.id}`,
    title: `${m.name} tool steel`,
    kind: "Material" as const,
    href: `/manufacturing#materials`,
    description: m.family,
    text: [m.name, m.designations, m.family, m.suits].join(" "),
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

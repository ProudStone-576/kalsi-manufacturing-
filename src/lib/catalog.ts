import { categories, products, machineTypes, type CategoryId, type Product } from "@/content/products";
import { industries, type IndustryId } from "@/content/industries";

export type CatalogQuery = {
  q: string;
  category: CategoryId[];
  industry: IndustryId[];
  machine: string[];
};

const CATEGORY_IDS = new Set<string>(categories.map((c) => c.id));
const INDUSTRY_IDS = new Set<string>(industries.map((i) => i.id));
const MACHINES = new Set<string>(machineTypes);

type RawParams = Record<string, string | string[] | undefined>;

function many(v: string | string[] | undefined): string[] {
  if (v === undefined) return [];
  return (Array.isArray(v) ? v : [v]).flatMap((s) => s.split(",")).map((s) => s.trim()).filter(Boolean);
}

/** Parses untrusted URL search params into a query containing only known values. */
export function parseCatalogQuery(params: RawParams): CatalogQuery {
  const q = (Array.isArray(params.q) ? params.q[0] : params.q) ?? "";
  return {
    q: q.normalize("NFKC").replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 80),
    category: many(params.category).filter((c): c is CategoryId => CATEGORY_IDS.has(c)),
    industry: many(params.industry).filter((i): i is IndustryId => INDUSTRY_IDS.has(i)),
    machine: many(params.machine).filter((m) => MACHINES.has(m)),
  };
}

export function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^a-z0-9%]+/)
    .filter((t) => t.length > 1);
}

function haystack(p: Product): string {
  return [p.name, p.summary, ...p.machines, ...p.keywords, ...p.overview].join(" ").toLowerCase();
}

/** Every query token must appear (prefix match on words) somewhere in the product text. */
export function matchesText(p: Product, q: string): boolean {
  const tokens = tokenize(q);
  if (tokens.length === 0) return true;
  const words = new Set(tokenize(haystack(p)));
  return tokens.every((t) => [...words].some((w) => w.startsWith(t)));
}

export function filterProducts(query: CatalogQuery, list: Product[] = products): Product[] {
  return list.filter(
    (p) =>
      (query.category.length === 0 || query.category.includes(p.category)) &&
      (query.industry.length === 0 || p.industries.some((i) => query.industry.includes(i))) &&
      (query.machine.length === 0 || p.machines.some((m) => query.machine.includes(m))) &&
      matchesText(p, query.q),
  );
}

export function catalogHref(partial: Partial<CatalogQuery>): string {
  const sp = new URLSearchParams();
  if (partial.q) sp.set("q", partial.q);
  for (const c of partial.category ?? []) sp.append("category", c);
  for (const i of partial.industry ?? []) sp.append("industry", i);
  for (const m of partial.machine ?? []) sp.append("machine", m);
  const s = sp.toString();
  return s ? `/products?${s}` : "/products";
}

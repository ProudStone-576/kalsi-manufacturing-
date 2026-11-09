import { categories, products, type CategoryId, type Product } from "@/content/products";

export type CatalogQuery = {
  q: string;
  category: CategoryId[];
};

const CATEGORY_IDS = new Set<string>(categories.map((c) => c.id));

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
  return [p.name, p.summary, ...p.uses, ...p.keywords, ...p.overview].join(" ").toLowerCase();
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
      (query.category.length === 0 || query.category.includes(p.category)) && matchesText(p, query.q),
  );
}

export function catalogHref(partial: Partial<CatalogQuery>): string {
  const sp = new URLSearchParams();
  if (partial.q) sp.set("q", partial.q);
  for (const c of partial.category ?? []) sp.append("category", c);
  const s = sp.toString();
  return s ? `/products?${s}` : "/products";
}

import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/PageHead";
import { ProductCard } from "@/components/ProductCard";
import { CatalogFilters } from "@/components/CatalogFilters";
import { CloseIcon } from "@/components/icons";
import { categories, categoryById, products } from "@/content/products";
import { catalogHref, filterProducts, parseCatalogQuery, type CatalogQuery } from "@/lib/catalog";
import { photos } from "@/content/images";

export const metadata: Metadata = {
  title: "Product catalogue",
  description: "Shearing blades, trimming and slitting cutters, steel piercing punches and steel stamps from S.S. Kalsi Industries.",
  alternates: { canonical: "/products" },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function without(q: CatalogQuery, key: keyof CatalogQuery, value?: string): string {
  if (key === "q") return catalogHref({ ...q, q: "" });
  return catalogHref({ ...q, category: q.category.filter((v) => v !== value) });
}

export default async function ProductsPage({ searchParams }: Props) {
  const query = parseCatalogQuery(await searchParams);
  const results = filterProducts(query);
  const active = query.q !== "" || query.category.length > 0;

  // Counts reflect the other active filters, so each number is what you get by ticking the box.
  const countWith = (patch: Partial<CatalogQuery>) => filterProducts({ ...query, ...patch }).length;

  const chips: { label: string; href: string }[] = [
    ...(query.q ? [{ label: `“${query.q}”`, href: without(query, "q") }] : []),
    ...query.category.map((c) => ({ label: categoryById[c].name, href: without(query, "category", c) })),
  ];

  return (
    <>
      <PageHead
        crumbs={[{ href: "/products", label: "Products" }]}
        title="Precision tools to cut and mark"
        lede="Shearing blades, trimming and slitting cutters, steel piercing punches and steel stamps. We also make tools to your drawing, sample or specification. Add the ones you need to a quote list and send them together."
        photo={photos.guillotineShear}
      />
      <section className="section section--tight">
        <div className="wrap catalog">
          <CatalogFilters
            query={query}
            categories={categories.map((c) => ({ value: c.id, label: c.name, count: countWith({ category: [c.id] }) }))}
          />
          <div>
            <div className="result-bar">
              <p role="status" aria-live="polite">
                <strong>{results.length}</strong> of {products.length} products
              </p>
              {active && (
                <div className="chips">
                  {chips.map((c) => (
                    <Link key={c.href + c.label} className="chip" href={c.href} scroll={false} aria-label={`Remove filter ${c.label}`}>
                      {c.label} <CloseIcon width={14} height={14} />
                    </Link>
                  ))}
                  <Link className="chip" href="/products" scroll={false}>
                    Clear all
                  </Link>
                </div>
              )}
            </div>
            {results.length ? (
              <div className="card-grid">
                {results.map((p) => (
                  <ProductCard key={p.slug} product={p} headingLevel={2} />
                ))}
              </div>
            ) : (
              <div className="empty">
                <h2 className="h3">No products match these filters.</h2>
                <p className="muted">
                  Try removing a filter. If you need something not listed, we can make it to your drawing, sample or specification.
                </p>
                <div className="btn-row">
                  <Link href="/products" className="btn btn--ghost btn--sm">
                    Clear filters
                  </Link>
                  <Link href="/contact?type=quote" className="btn btn--sm">
                    Ask about a custom tool
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

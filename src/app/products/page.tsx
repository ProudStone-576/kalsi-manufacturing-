import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/PageHead";
import { ProductCard } from "@/components/ProductCard";
import { CatalogFilters } from "@/components/CatalogFilters";
import { CloseIcon } from "@/components/icons";
import { categories, categoryById, machineTypes, products } from "@/content/products";
import { industries, industryById } from "@/content/industries";
import { catalogHref, filterProducts, parseCatalogQuery, type CatalogQuery } from "@/lib/catalog";
import { photos } from "@/content/images";

export const metadata: Metadata = {
  title: "Product catalogue",
  description: "Shear blades and industrial knives by blade type, industry and machine: plate shears, rolling mills, coil processing, recycling and paper.",
  alternates: { canonical: "/products" },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function without(q: CatalogQuery, key: keyof CatalogQuery, value?: string): string {
  if (key === "q") return catalogHref({ ...q, q: "" });
  return catalogHref({ ...q, [key]: (q[key] as string[]).filter((v) => v !== value) });
}

export default async function ProductsPage({ searchParams }: Props) {
  const query = parseCatalogQuery(await searchParams);
  const results = filterProducts(query);
  const active = query.q !== "" || query.category.length + query.industry.length + query.machine.length > 0;

  // Counts reflect the other active filters, so each number is what you get by ticking the box.
  const countWith = (patch: Partial<CatalogQuery>) => filterProducts({ ...query, ...patch }).length;

  const chips: { label: string; href: string }[] = [
    ...(query.q ? [{ label: `“${query.q}”`, href: without(query, "q") }] : []),
    ...query.category.map((c) => ({ label: categoryById[c].name, href: without(query, "category", c) })),
    ...query.industry.map((i) => ({ label: industryById[i].short, href: without(query, "industry", i) })),
    ...query.machine.map((m) => ({ label: m, href: without(query, "machine", m) })),
  ];

  return (
    <>
      <PageHead
        crumbs={[{ href: "/products", label: "Products" }]}
        label="Product catalogue"
        title="Shear blades & industrial knives"
        lede="Every blade type we make, by the machine it runs in. Each is manufactured to your drawing or sample — add the ones you need to a quote list and send them together."
        photo={photos.guillotineShear}
      />
      <section className="section section--tight">
        <div className="wrap catalog">
          <CatalogFilters
            query={query}
            categories={categories.map((c) => ({ value: c.id, label: c.name, count: countWith({ category: [c.id] }) }))}
            industries={industries.map((i) => ({ value: i.id, label: i.short, count: countWith({ industry: [i.id] }) }))}
            machines={machineTypes.map((m) => ({ value: m, label: m, count: countWith({ machine: [m] }) }))}
          />
          <div>
            <div className="result-bar">
              <p role="status" aria-live="polite">
                <strong>{results.length}</strong> of {products.length} blade types
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
                <h2 className="h3">No blade types match these filters.</h2>
                <p className="muted">
                  Try removing a filter. If you need something not listed, we can still quote it from your drawing.
                </p>
                <div className="btn-row">
                  <Link href="/products" className="btn btn--ghost btn--sm">
                    Clear filters
                  </Link>
                  <Link href="/contact?type=quote" className="btn btn--sm">
                    Ask about a custom blade
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

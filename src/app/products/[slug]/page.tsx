import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHead } from "@/components/PageHead";
import { BladeDrawing } from "@/components/BladeDrawing";
import { ProductCard } from "@/components/ProductCard";
import { AddToQuoteButton } from "@/components/AddToQuoteButton";
import { JsonLd } from "@/components/JsonLd";
import { ArrowRight } from "@/components/icons";
import { categoryById, productBySlug, products, relatedProducts } from "@/content/products";
import { industryById } from "@/content/industries";
import { materialById } from "@/content/materials";
import { company } from "@/content/company";
import { catalogHref } from "@/lib/catalog";
import { siteOrigin } from "@/lib/config";
import { categoryPhoto } from "@/content/images";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = productBySlug.get((await params).slug);
  if (!p) return {};
  return {
    title: p.name,
    description: `${p.summary} Made to drawing by ${company.name}.`,
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: { title: `${p.name} · ${company.name}`, description: p.summary },
  };
}

export default async function ProductPage({ params }: Props) {
  const p = productBySlug.get((await params).slug);
  if (!p) notFound();
  const category = categoryById[p.category];
  const related = relatedProducts(p);

  return (
    <>
      <PageHead
        crumbs={[
          { href: "/products", label: "Products" },
          { href: catalogHref({ category: [p.category] }), label: category.name },
          { href: `/products/${p.slug}`, label: p.name },
        ]}
        label={category.name}
        title={p.name}
        lede={p.summary}
        photo={categoryPhoto[p.category]}
      >
        <div className="btn-row">
          <Link href={`/contact?type=quote&product=${p.slug}`} className="btn btn--accent">
            Request a quote <ArrowRight />
          </Link>
          <AddToQuoteButton slug={p.slug} name={p.name} />
        </div>
      </PageHead>

      <section className="section section--tight">
        <div className="wrap product-hero">
          <div className="stack-lg">
            <div className="prose stack-sm">
              <h2 className="h3">Overview</h2>
              {p.overview.map((para) => (
                <p key={para.slice(0, 24)}>{para}</p>
              ))}
            </div>

            <div className="stack-sm">
              <h2 className="h3">Specification at a glance</h2>
              <table className="spec-table">
                <tbody>
                  <tr>
                    <th scope="row">Used on</th>
                    <td>{p.machines.join(", ")}</td>
                  </tr>
                  <tr>
                    <th scope="row">Industries</th>
                    <td>
                      <ul className="tag-list">
                        {p.industries.map((i) => (
                          <li key={i}>
                            <Link className="tag" href={`/industries#${i}`}>
                              {industryById[i].short}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                  {p.options.map((o) => (
                    <tr key={o.label}>
                      <th scope="row">{o.label}</th>
                      <td>{o.detail}</td>
                    </tr>
                  ))}
                  <tr>
                    <th scope="row">Dimensions</th>
                    <td>Made to your drawing or sample.</td>
                  </tr>
                  <tr>
                    <th scope="row">Grades often specified</th>
                    <td>
                      <ul className="tag-list">
                        {p.grades.map((g) => (
                          <li key={g}>
                            <Link className="tag" href="/manufacturing#materials" title={materialById[g].family}>
                              {materialById[g].name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <p className="notice" style={{ marginTop: 10 }}>
                        Grade and hardness are confirmed against your application at quotation.
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <aside className="stack sticky-aside" aria-label="Drawing and quote">
            <figure className="drawing-frame" style={{ margin: 0 }}>
              <BladeDrawing id={p.drawing} title={p.name} />
              <figcaption className="drawing-frame__title">
                <span>{p.name}</span>
                <span>Illustrative · not to scale</span>
              </figcaption>
            </figure>
            <div className="quote-panel">
              <h2 className="h3">What we need to quote</h2>
              <ul className="check-list">
                {p.quoteNeeds.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
              <div className="btn-row">
                <Link href={`/contact?type=quote&product=${p.slug}`} className="btn btn--accent">
                  Request a quote <ArrowRight />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section section--white section--rule" aria-labelledby="related-title">
          <div className="wrap">
            <div className="section-head section-head--split">
              <h2 id="related-title" className="h2">
                Related blades
              </h2>
              <div>
                <Link href={catalogHref({ category: [p.category] })} className="link-arrow">
                  All {category.name.toLowerCase()} <ArrowRight />
                </Link>
              </div>
            </div>
            <div className="card-grid">
              {related.map((r) => (
                <ProductCard key={r.slug} product={r} />
              ))}
            </div>
          </div>
        </section>
      )}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: p.name,
          description: p.summary,
          category: category.name,
          brand: { "@type": "Brand", name: company.name },
          manufacturer: { "@type": "Organization", name: company.legalName ?? company.name },
          url: `${siteOrigin()}/products/${p.slug}`,
        }}
      />
    </>
  );
}

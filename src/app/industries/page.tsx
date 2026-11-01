import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHead } from "@/components/PageHead";
import { PhotoBand } from "@/components/PhotoBand";
import { ArrowRight } from "@/components/icons";
import { industries } from "@/content/industries";
import { products } from "@/content/products";
import { industryPhoto, photos } from "@/content/images";
import { catalogHref } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Industries served",
  description: "Shearing blades for steel plants and rolling mills, fabrication, coil processing, scrap recycling, plastics and paper converting.",
  alternates: { canonical: "/industries" },
};

export default function IndustriesPage() {
  return (
    <>
      <PageHead
        crumbs={[{ href: "/industries", label: "Industries" }]}
        label="Industries served"
        title="Blades for the work your machines do"
        lede="Every industry asks something different of a blade: heat, shock, wear or straightness. Here is what matters in each, and the blade types that serve it."
        photo={photos.rollingMillGlow}
      >
        <nav aria-label="Industries on this page">
          <ul className="tag-list">
            {industries.map((i) => (
              <li key={i.id}>
                <a className="tag" href={`#${i.id}`}>
                  {i.short}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </PageHead>

      <div className="wrap" style={{ paddingBlock: "clamp(24px, 4vw, 48px) clamp(48px, 7vw, 96px)" }}>
        {industries.map((ind) => {
          const list = products.filter((p) => p.industries.includes(ind.id));
          const ph = industryPhoto[ind.id];
          return (
            <section key={ind.id} id={ind.id} className="industry" aria-labelledby={`${ind.id}-title`}>
              <div className="industry__head">
                <div className="industry__photo" data-reveal>
                  <Image src={ph.src} alt={ph.alt} fill sizes="(max-width: 860px) 100vw, 45vw" placeholder="blur" quality={70} />
                </div>
                <h2 id={`${ind.id}-title`} className="h2">
                  {ind.name}
                </h2>
                <p className="lede">{ind.summary}</p>
              </div>
              <div className="stack" style={{ alignContent: "start" }}>
                <div className="stack-sm">
                  <h3 className="eyebrow">What matters</h3>
                  <ul className="check-list">
                    {ind.challenges.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
                <div className="stack-sm">
                  <h3 className="eyebrow">Blade types</h3>
                  <ul className="tag-list">
                    {list.map((p) => (
                      <li key={p.slug}>
                        <Link className="tag" href={`/products/${p.slug}`}>
                          {p.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <Link href={catalogHref({ industry: [ind.id] })} className="btn btn--ghost">
                    {list.length} blade types for {ind.short.toLowerCase()} <ArrowRight />
                  </Link>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <PhotoBand photo={photos.scrapShearJaw}>
        <div className="split">
          <div className="stack-sm">
            <p className="eyebrow eyebrow--light">Not listed?</p>
            <h2 className="h2">If it shears, send us the drawing.</h2>
          </div>
          <div className="stack-sm">
            <p className="lede">Blades for other machines and industries can be quoted from a drawing or a sample blade.</p>
            <div className="btn-row">
              <Link href="/contact?type=quote" className="btn btn--accent">
                Request a quote <ArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </PhotoBand>
    </>
  );
}

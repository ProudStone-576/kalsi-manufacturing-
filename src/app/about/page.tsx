import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHead } from "@/components/PageHead";
import { PhotoBand } from "@/components/PhotoBand";
import { photos } from "@/content/images";
import { ToolDrawing } from "@/components/ToolDrawing";
import { ArrowRight } from "@/components/icons";
import { company } from "@/content/company";
import { categories, products } from "@/content/products";
import { catalogHref } from "@/lib/catalog";
import { CUSTOM_WORK, MAKING_RESULT, MISSION, WHY_CHOOSE_US } from "@/content/process";

export const metadata: Metadata = {
  title: "About",
  description: `${company.name} manufactures precision tools for industrial use: shearing blades, trimming and slitting cutters, steel piercing punches and steel stamps.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const facts = [
    company.legalName && { k: "Registered name", v: company.legalName },
    company.foundedYear && { k: "Established", v: String(company.foundedYear) },
    ...company.locations.map((l) => ({ k: l.label, v: l.lines.join(", ") })),
    ...company.registrations.map((r) => ({ k: r.label, v: r.value })),
  ].filter((x): x is { k: string; v: string } => !!x);

  return (
    <>
      <PageHead
        crumbs={[{ href: "/about", label: "About" }]}
        label="About us"
        title={`${company.name}: precision tools built to cut and mark`}
        lede={`${company.name} manufactures precision tools for industrial use. Manufacturers across the globe rely on our tools to keep their production lines running accurately and efficiently.`}
        photo={photos.grindingSparks}
      />

      <section className="section">
        <div className="wrap split">
          <div className="prose stack-sm">
            <p className="eyebrow">Since {company.foundedYear}</p>
            <h2 className="h2">A tool should do its job cleanly, consistently and for a long time.</h2>
            <p>
              Since {company.foundedYear}, we&apos;ve built our name on that one principle. Every blade, cutter, punch and
              stamp we make is produced from carefully selected tool steel. Each one is heat-treated for the right balance
              of hardness and toughness, then precision-ground to tight tolerances.
            </p>
            <p>{MAKING_RESULT}</p>
          </div>
          <div className="photo-stack" data-reveal>
            <div className="photo-stack__main">
              <Image src={photos.surfaceGrinder.src} alt={photos.surfaceGrinder.alt} fill sizes="(max-width: 900px) 100vw, 50vw" placeholder="blur" quality={70} />
            </div>
            <div className="photo-stack__card">
              <ToolDrawing id="punch" title="Steel piercing punch" />
              <p className="photo-stack__caption">Piercing punch · illustrative</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--white section--rule" aria-labelledby="make-title">
        <div className="wrap">
          <div className="section-head section-head--split">
            <div className="stack-sm">
              <p className="eyebrow">What we make</p>
              <h2 id="make-title" className="h2">
                Our products
              </h2>
            </div>
            <p className="lede">{CUSTOM_WORK}</p>
          </div>
          <ol className="steps">
            {categories.map((c) => (
              <li key={c.id}>
                <h3>
                  <Link href={catalogHref({ category: [c.id] })}>{c.name}</Link>
                </h3>
                <p>
                  {products
                    .filter((p) => p.category === c.id)
                    .map((p) => p.summary)
                    .join(" ")}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section--rule" aria-labelledby="why-title">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">Why choose us</p>
            <h2 id="why-title" className="h2">
              What you can expect from us
            </h2>
          </div>
          <ol className="steps">
            {WHY_CHOOSE_US.map((w) => (
              <li key={w.title}>
                <h3>{w.title}</h3>
                <p>{w.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section--white section--rule" aria-labelledby="mission-title">
        <div className="wrap prose stack-sm">
          <p className="eyebrow">Our mission</p>
          <h2 id="mission-title" className="h2">
            Tools you can rely on.
          </h2>
          <p className="lede">{MISSION}</p>
        </div>
      </section>

      {facts.length > 0 && (
        <section className="section section--rule" aria-labelledby="facts-title">
          <div className="wrap">
            <h2 id="facts-title" className="h2" style={{ marginBottom: 24 }}>
              Company facts
            </h2>
            <table className="spec-table">
              <tbody>
                {facts.map((f) => (
                  <tr key={f.k}>
                    <th scope="row">{f.k}</th>
                    <td>{f.v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <PhotoBand photo={photos.furnace}>
        <div className="split">
          <div className="stack-sm">
            <p className="eyebrow eyebrow--light">Next step</p>
            <h2 className="h2">Tell us the tool you need.</h2>
          </div>
          <div className="btn-row">
            <Link href="/contact?type=quote" className="btn btn--accent">
              Request a quote <ArrowRight />
            </Link>
            <Link href="/manufacturing" className="btn btn--light">
              How our tools are made
            </Link>
          </div>
        </div>
      </PhotoBand>
    </>
  );
}

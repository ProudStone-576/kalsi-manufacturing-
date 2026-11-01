import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHead } from "@/components/PageHead";
import { PhotoBand } from "@/components/PhotoBand";
import { photos } from "@/content/images";
import { BladeDrawing } from "@/components/BladeDrawing";
import { ArrowRight } from "@/components/icons";
import { company } from "@/content/company";
import { categories, products } from "@/content/products";
import { industries } from "@/content/industries";

export const metadata: Metadata = {
  title: "About",
  description: `${company.name} is a manufacturer of shearing blades, made to drawing for steel, fabrication, coil processing, recycling, plastics and paper.`,
  alternates: { canonical: "/about" },
};

const PRINCIPLES = [
  {
    title: "Made to your drawing",
    body: "Machines differ, and so do the blades in them. We work from your drawing, your sample or your measurements — not from a fixed list of sizes.",
  },
  {
    title: "The grade fits the job",
    body: "We ask what you cut, how thick it is and how the machine runs, and recommend a grade on that basis. If something on a drawing looks wrong for the application, we say so before we quote.",
  },
  {
    title: "Clear quotations",
    body: "A quotation states the specification it is based on, so you know exactly what you are buying and can compare it fairly.",
  },
];

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
        label={`About ${company.name}`}
        title="We make the blades that do the cutting"
        lede={`${company.name} manufactures shearing blades — for the machines that cut steel, sheet, scrap, plastic and paper — to the drawing or sample our customers send.`}
        photo={photos.fabricationCutting}
      />

      <section className="section">
        <div className="wrap split">
          <div className="prose stack-sm">
            <p className="eyebrow">What we do</p>
            <h2 className="h2">One trade, done properly.</h2>
            <p>
              A shear blade looks simple: a bar of hardened steel with a sharp edge. In service it is anything but. It
              has to stay straight along its whole length, keep its edge through thousands of cuts and survive the
              shock of every stroke without chipping.
            </p>
            <p>
              Our range covers {products.length} blade types across {categories.length} families — from guillotine
              blades for plate shears to hot shear blades for rolling mills, slitter knives for coil lines and knives
              for recycling machines — serving {industries.length} industries.
            </p>
          </div>
          <div className="photo-stack" data-reveal>
            <div className="photo-stack__main">
              <Image src={photos.grindingSparks.src} alt={photos.grindingSparks.alt} fill sizes="(max-width: 900px) 100vw, 50vw" placeholder="blur" quality={70} />
            </div>
            <div className="photo-stack__card">
              <BladeDrawing id="slitter" title="Rotary slitter knife and spacer" />
              <p className="photo-stack__caption">Slitter knife &amp; spacer · illustrative</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--white section--rule" aria-labelledby="principles-title">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">How we work</p>
            <h2 id="principles-title" className="h2">
              What you can expect from us
            </h2>
          </div>
          <ol className="steps">
            {PRINCIPLES.map((p) => (
              <li key={p.title}>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </li>
            ))}
          </ol>
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

      <PhotoBand photo={photos.rollingMillGlow}>
        <div className="split">
          <div className="stack-sm">
            <p className="eyebrow eyebrow--light">Next step</p>
            <h2 className="h2">Tell us about the machine and the blade.</h2>
          </div>
          <div className="btn-row">
            <Link href="/contact?type=quote" className="btn btn--accent">
              Request a quote <ArrowRight />
            </Link>
            <Link href="/manufacturing" className="btn btn--light">
              How blades are made
            </Link>
          </div>
        </div>
      </PhotoBand>
    </>
  );
}

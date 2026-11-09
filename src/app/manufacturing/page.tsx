import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHead } from "@/components/PageHead";
import { PhotoBand } from "@/components/PhotoBand";
import { company } from "@/content/company";
import { photos, type Photo } from "@/content/images";
import { CUSTOM_WORK, MAKING_STEPS } from "@/content/process";

export const metadata: Metadata = {
  title: "Manufacturing & quality",
  description: "How S.S. Kalsi Industries makes its tools: carefully selected tool steel, controlled heat treatment and precision grinding to tight tolerances.",
  alternates: { canonical: "/manufacturing" },
};

const STEP_PHOTO: Record<string, Photo> = {
  "Selected tool steel": photos.fabricationCutting,
  "Heat treatment": photos.furnace,
  "Precision grinding": photos.surfaceGrinder,
};

export default function ManufacturingPage() {
  return (
    <>
      <PageHead
        crumbs={[{ href: "/manufacturing", label: "Manufacturing & quality" }]}
        title="How our tools are made"
        lede="Every blade, cutter, punch and stamp we make follows the same route: carefully selected tool steel, controlled heat treatment and precision grinding."
        photo={photos.grindingSparks}
      />

      <section className="section" aria-labelledby="stages-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="stages-title" className="h2">
              From tool steel to finished tool
            </h2>
          </div>
          <ol className="stage-grid" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {MAKING_STEPS.map((s, i) => {
              const ph = STEP_PHOTO[s.title];
              return (
                <li key={s.title} className="stage" data-reveal>
                  <div className="stage__photo">
                    {ph && <Image src={ph.src} alt={ph.alt} fill sizes="(max-width: 760px) 100vw, 33vw" placeholder="blur" quality={70} />}
                  </div>
                  <div className="stage__body">
                    <span className="stage__no">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="h3">{s.title}</h3>
                    <p>{s.body}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {company.certifications.length > 0 && (
        <section className="section section--rule" aria-labelledby="cert-title">
          <div className="wrap">
            <h2 id="cert-title" className="h2" style={{ marginBottom: 24 }}>
              Certifications
            </h2>
            <ul className="tag-list">
              {company.certifications.map((c) => (
                <li key={c.name} className="tag">
                  {c.name}, {c.issuer}
                  {c.certificateNumber ? ` (${c.certificateNumber})` : ""}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <PhotoBand photo={photos.fabricationSparks}>
        <div className="split">
          <div className="stack-sm">
            <h2 className="h2">Made to your exact requirements.</h2>
          </div>
          <div className="stack-sm">
            <p className="lede">{CUSTOM_WORK}</p>
            <div className="btn-row">
              <Link href="/contact?type=quote" className="btn btn--accent">
                Request a quote
              </Link>
            </div>
          </div>
        </div>
      </PhotoBand>
    </>
  );
}

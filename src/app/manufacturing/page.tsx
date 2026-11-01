import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHead } from "@/components/PageHead";
import { BladeDrawing } from "@/components/BladeDrawing";
import { ShearAnimation } from "@/components/ShearAnimation";
import { ArrowRight } from "@/components/icons";
import { materials } from "@/content/materials";
import { company } from "@/content/company";
import { photos, type Photo } from "@/content/images";
import type { DrawingId } from "@/content/products";
import { FAQ, LIFE_FACTORS, MANUFACTURING_STAGES } from "@/content/process";

export const metadata: Metadata = {
  title: "Manufacturing & quality",
  description: "How a shearing blade is made and checked: material, machining, heat treatment, grinding and inspection — plus a tool-steel reference and blade care FAQ.",
  alternates: { canonical: "/manufacturing" },
};

/** Illustration per stage: a photograph where one fits, otherwise a technical drawing. */
const STAGE_VISUAL: Record<string, { photo: Photo } | { drawing: DrawingId }> = {
  Material: { photo: photos.plateMill },
  Machining: { photo: photos.fabricationCutting },
  "Heat treatment": { photo: photos.furnace },
  Grinding: { photo: photos.surfaceGrinder },
  Inspection: { drawing: "straight-4edge" },
  "Marking & packing": { drawing: "ctl" },
};

export default function ManufacturingPage() {
  return (
    <>
      <PageHead
        crumbs={[{ href: "/manufacturing", label: "Manufacturing & quality" }]}
        label="Manufacturing & quality"
        title="How a shear blade is made — and what makes it last"
        lede="A blade's working life is decided long before it reaches your machine: by the steel, the heat treatment and the grinding. This is the route every blade takes."
        photo={photos.grindingSparks}
      />

      <section className="section" aria-labelledby="stages-title">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">Process</p>
            <h2 id="stages-title" className="h2">
              Six stages from bar to blade
            </h2>
          </div>
          <ol className="stage-grid" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {MANUFACTURING_STAGES.map((s, i) => {
              const v = STAGE_VISUAL[s.title];
              return (
                <li key={s.title} className="stage" data-reveal>
                  <div className="stage__photo">
                    {v && "photo" in v ? (
                      <Image src={v.photo.src} alt={v.photo.alt} fill sizes="(max-width: 760px) 100vw, 33vw" placeholder="blur" quality={70} />
                    ) : v ? (
                      <BladeDrawing id={v.drawing} title={s.title} />
                    ) : null}
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

      <section className="section section--dark" aria-labelledby="life-title">
        <div className="wrap split split--top">
          <div className="stack">
            <p className="eyebrow">Quality</p>
            <h2 id="life-title" className="h2">
              Four things that decide blade life
            </h2>
            <figure className="drawing-frame" style={{ margin: 0 }}>
              <ShearAnimation />
              <figcaption className="drawing-frame__title">
                <span>Plate shear · side view</span>
                <span>Illustrative</span>
              </figcaption>
            </figure>
          </div>
          <div className="stack">
            {LIFE_FACTORS.map((f, i) => (
              <div key={f.title} className="stack-sm" style={{ borderTop: "1px solid var(--dark-line)", paddingTop: 20 }}>
                <p className="band-steps__no" style={{ fontSize: "1.5rem" }}>
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="h3">{f.title}</h3>
                <p className="muted">{f.body}</p>
              </div>
            ))}
          </div>
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
                  {c.name} — {c.issuer}
                  {c.certificateNumber ? ` (${c.certificateNumber})` : ""}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section id="materials" className="section section--white" aria-labelledby="materials-title">
        <div className="wrap">
          <div className="section-head section-head--split">
            <div className="stack-sm">
              <p className="eyebrow">Materials reference</p>
              <h2 id="materials-title" className="h2">
                Tool steels used for shearing blades
              </h2>
            </div>
            <p className="notice">
              General reference for comparing grades. The grade and hardness for your blade are agreed against your
              drawing and application at quotation.
            </p>
          </div>
          <div className="mat-grid">
            {materials.map((m) => (
              <article key={m.id} className="mat">
                <div className="mat__name">
                  <h3>{m.name}</h3>
                  <span className="label">{m.family.split(" ")[0]}</span>
                </div>
                <p className="label" style={{ textTransform: "none", letterSpacing: "0.02em" }}>
                  {m.designations}
                </p>
                <dl>
                  <div>
                    <dt>Family</dt>
                    <dd>{m.family}</dd>
                  </div>
                  <div>
                    <dt>Character</dt>
                    <dd>{m.character}</dd>
                  </div>
                  <div>
                    <dt>Typical use</dt>
                    <dd>{m.suits}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="faq-title">
        <div className="wrap split split--top">
          <div className="stack">
            <p className="eyebrow">Blade care</p>
            <h2 id="faq-title" className="h2">
              Questions buyers ask
            </h2>
            <p className="lede">Practical answers on regrinding, grades and ordering.</p>
            <div className="photo-frame">
              <Image src={photos.fabricationSparks.src} alt={photos.fabricationSparks.alt} fill sizes="(max-width: 900px) 100vw, 45vw" placeholder="blur" quality={70} />
            </div>
            <div>
              <Link href="/contact" className="link-arrow">
                Ask an engineer <ArrowRight />
              </Link>
            </div>
          </div>
          <div className="faq">
            {FAQ.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <div>
                  <p>{f.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

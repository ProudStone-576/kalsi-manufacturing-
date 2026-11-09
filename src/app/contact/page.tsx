import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/PageHead";
import { EnquiryForm } from "@/components/EnquiryForm";
import { MailIcon, PhoneIcon } from "@/components/icons";
import { company, hasDirectContact } from "@/content/company";
import { productBySlug } from "@/content/products";
import { photos } from "@/content/images";

export const metadata: Metadata = {
  title: "Contact & request a quote",
  description: `Send ${company.name} a drawing, sample or specification of the tool you need, or ask a question.`,
  alternates: { canonical: "/contact" },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const KNOWN_STATUS = new Set(["invalid", "rate_limited", "too_large", "unavailable", "forbidden", "unsupported", "server"]);

function DirectContact() {
  if (!hasDirectContact()) return null;
  return (
    <span>
      You can also reach us directly
      {company.phone && (
        <>
          {" "}
          on <a href={`tel:${company.phone.replace(/\s+/g, "")}`}>{company.phone}</a>
        </>
      )}
      {company.email && (
        <>
          {" "}
          or at <a href={`mailto:${company.email}`}>{company.email}</a>
        </>
      )}
      .
    </span>
  );
}

export default async function ContactPage({ searchParams }: Props) {
  const sp = await searchParams;
  const product = first(sp.product);
  const status = first(sp.status);
  const kind = first(sp.type) === "general" ? "general" : product || first(sp.type) === "quote" ? "quote" : "general";

  return (
    <>
      <PageHead
        crumbs={[{ href: "/contact", label: "Contact" }]}
        title="Tell us about the tool you need"
        lede="Send a drawing, a sample or your specification. We work with you to find the right tool for your machine and material."
        photo={photos.surfaceGrinder}
      />
      <section className="section section--tight">
        <div className="wrap contact-layout">
          <EnquiryForm
            initialKind={kind}
            initialProduct={product && productBySlug.has(product) ? product : null}
            status={status && KNOWN_STATUS.has(status) ? status : null}
            directContact={<DirectContact />}
          />

          <aside className="stack-lg" aria-label="Contact information">
            {hasDirectContact() && (
              <div className="contact-card">
                <h2 className="h3">Reach us directly</h2>
                <dl>
                  {company.phone && (
                    <div>
                      <dt className="label">Phone</dt>
                      <dd>
                        <a href={`tel:${company.phone.replace(/\s+/g, "")}`} style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                          <PhoneIcon /> {company.phone}
                        </a>
                      </dd>
                    </div>
                  )}
                  {company.whatsapp && (
                    <div>
                      <dt className="label">WhatsApp</dt>
                      <dd>
                        <a href={`https://wa.me/${company.whatsapp}`} rel="noopener noreferrer" target="_blank">
                          Message us on WhatsApp
                        </a>
                      </dd>
                    </div>
                  )}
                  {company.email && (
                    <div>
                      <dt className="label">Email</dt>
                      <dd>
                        <a href={`mailto:${company.email}`} style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                          <MailIcon /> {company.email}
                        </a>
                      </dd>
                    </div>
                  )}
                  {company.locations.map((l) => (
                    <div key={l.label}>
                      <dt className="label">{l.label}</dt>
                      <dd>
                        <address style={{ fontStyle: "normal" }}>
                          {l.lines.map((line) => (
                            <span key={line} style={{ display: "block" }}>
                              {line}
                            </span>
                          ))}
                        </address>
                        {l.mapUrl && (
                          <a href={l.mapUrl} rel="noopener noreferrer" target="_blank">
                            Open in maps
                          </a>
                        )}
                      </dd>
                    </div>
                  ))}
                  {company.businessHours && (
                    <div>
                      <dt className="label">Hours</dt>
                      <dd>{company.businessHours}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            <div className="contact-card">
              <h2 className="h3">What happens next</h2>
              <ol className="check-list" style={{ listStyle: "none" }}>
                <li>You get a reference number as soon as the form is sent.</li>
                <li>We review your requirement and reply by email.</li>
              </ol>
            </div>

            <div className="contact-card">
              <h2 className="h3">Your information</h2>
              <p className="muted">
                Details you send are used only to answer your enquiry. Drawings are stored privately and never published.
                See the <Link href="/privacy">privacy notice</Link>.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

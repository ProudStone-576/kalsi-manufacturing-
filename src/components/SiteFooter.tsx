import Link from "next/link";
import { company } from "@/content/company";
import { categories } from "@/content/products";
import { industries } from "@/content/industries";
import { catalogHref } from "@/lib/catalog";
import { ArrowRight, BrandMark } from "./icons";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const socials = Object.entries(company.social).filter(([, url]) => !!url);
  return (
    <footer className="site-footer">
      <div className="temper-rule" aria-hidden="true" />
      <div className="wrap">
        <div className="site-footer__cta">
          <div className="stack-sm">
            <p className="eyebrow">Start with a drawing</p>
            <p className="h2">Send us the blade you need. We will come back with a quotation.</p>
          </div>
          <div className="btn-row">
            <Link href="/contact?type=quote" className="btn btn--accent">
              Request a quote <ArrowRight />
            </Link>
            <Link href="/products" className="btn btn--ghost">
              Browse the catalogue
            </Link>
          </div>
        </div>

        <div className="site-footer__cols">
          <div className="stack-sm">
            <Link href="/" className="brand">
              <BrandMark />
              <span className="brand__text">
                <span className="brand__name">{company.name}</span>
                <span className="brand__trade">{company.trade}</span>
              </span>
            </Link>
            {company.locations[0] && <address style={{ fontStyle: "normal" }}>{company.locations[0].lines.join(", ")}</address>}
            {company.phone && <a href={`tel:${company.phone.replace(/\s+/g, "")}`}>{company.phone}</a>}
            {company.email && <a href={`mailto:${company.email}`}>{company.email}</a>}
          </div>
          <div>
            <h2>Products</h2>
            <ul>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link href={catalogHref({ category: [c.id] })}>{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>Industries</h2>
            <ul>
              {industries.map((i) => (
                <li key={i.id}>
                  <Link href={`/industries#${i.id}`}>{i.short}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>Company</h2>
            <ul>
              <li>
                <Link href="/about">About</Link>
              </li>
              <li>
                <Link href="/manufacturing">Manufacturing &amp; quality</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
              <li>
                <Link href="/privacy">Privacy notice</Link>
              </li>
              <li>
                <Link href="/credits">Photo credits</Link>
              </li>
              {socials.map(([k, url]) => (
                <li key={k}>
                  <a href={url} rel="noopener noreferrer" target="_blank">
                    {k[0]!.toUpperCase() + k.slice(1)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="site-footer__base">
          <span>
            © {year} {company.legalName ?? company.name}
            {company.registrations.map((r) => ` · ${r.label} ${r.value}`).join("")}
          </span>
          <span>Blades made to drawing</span>
        </div>
      </div>
    </footer>
  );
}

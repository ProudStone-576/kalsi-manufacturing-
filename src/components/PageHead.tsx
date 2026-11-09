import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { JsonLd } from "./JsonLd";
import { siteOrigin } from "@/lib/config";
import type { Photo } from "@/content/images";

export type Crumb = { href: string; label: string };

export function PageHead({
  crumbs,
  title,
  lede,
  children,
  photo,
}: {
  crumbs: Crumb[];
  title: string;
  lede?: ReactNode;
  children?: ReactNode;
  /** Optional photographic banner behind the heading. */
  photo?: Photo;
}) {
  const all = [{ href: "/", label: "Home" }, ...crumbs];
  const origin = siteOrigin();
  return (
    <header className={photo ? "page-head page-head--photo" : "page-head"}>
      {photo && (
        <>
          <Image src={photo.src} alt="" fill sizes="100vw" priority placeholder="blur" quality={70} className="page-head__img" />
          <div className="page-head__shade" aria-hidden="true" />
        </>
      )}
      <div className="wrap page-head__inner">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <ol>
            {all.map((c, i) => (
              <li key={c.href}>
                {i === all.length - 1 ? <span aria-current="page">{c.label}</span> : <Link href={c.href}>{c.label}</Link>}
              </li>
            ))}
          </ol>
        </nav>
        <h1 className="h1">{title}</h1>
        {lede && <p className="lede">{lede}</p>}
        {children}
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.label,
            item: `${origin}${c.href === "/" ? "" : c.href}`,
          })),
        }}
      />
    </header>
  );
}

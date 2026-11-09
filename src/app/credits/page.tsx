import type { Metadata } from "next";
import Image from "next/image";
import { PageHead } from "@/components/PageHead";
import { imageCredits, photos } from "@/content/images";

export const metadata: Metadata = {
  title: "Photo credits",
  description: "Sources and licences of the photographs used on this website.",
  alternates: { canonical: "/credits" },
};

export default function CreditsPage() {
  const list = Object.values(photos);
  return (
    <>
      <PageHead
        crumbs={[{ href: "/credits", label: "Photo credits" }]}
        title="Photographs on this site"
        lede="The photographs illustrate metalworking in general. They are used under the licences below, with thanks to their authors; they do not depict S.S. Kalsi Industries' own works."
      />
      <section className="section section--tight">
        <div className="wrap">
          <ul className="credits-list">
            {list.map((p) => {
              const c = imageCredits[p.credit];
              return (
                <li key={p.credit}>
                  <div className="photo-frame">
                    <Image src={p.src} alt={p.alt} fill sizes="(max-width: 700px) 100vw, 320px" placeholder="blur" quality={60} />
                  </div>
                  <strong>{c.title}</strong>
                  <span className="muted">
                    By {c.author},{" "}
                    {c.licenseUrl ? (
                      <a href={c.licenseUrl} rel="noopener noreferrer license" target="_blank">
                        {c.license}
                      </a>
                    ) : (
                      c.license
                    )}{" "}
                    ,{" "}
                    <a href={c.source} rel="noopener noreferrer" target="_blank">
                      Source
                    </a>
                  </span>
                  <span className="muted" style={{ fontSize: "0.82rem" }}>
                    Resized and cropped for this site.
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
}

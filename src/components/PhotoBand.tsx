import Image from "next/image";
import type { ReactNode } from "react";
import type { Photo } from "@/content/images";

/** Full-width photographic banner with content laid over a shaded image. */
export function PhotoBand({ photo, children, align = "left", tall = false }: { photo: Photo; children: ReactNode; align?: "left" | "center"; tall?: boolean }) {
  return (
    <section className={`photo-band${tall ? " photo-band--tall" : ""}`} data-align={align}>
      <Image src={photo.src} alt="" fill sizes="100vw" placeholder="blur" quality={70} className="photo-band__img" />
      <div className="photo-band__shade" aria-hidden="true" />
      <div className="wrap photo-band__content">{children}</div>
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import type { Photo } from "@/content/images";
import { ArrowRight } from "./icons";

/** Large photo link card with title over a shaded image; the image eases in on hover. */
export function PhotoTile({
  photo,
  href,
  title,
  meta,
  text,
  sizes = "(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 33vw",
  headingLevel = 3,
  className = "",
}: {
  photo: Photo;
  href: string;
  title: string;
  meta?: string;
  text?: string;
  sizes?: string;
  headingLevel?: 2 | 3;
  className?: string;
}) {
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <Link href={href} className={`photo-tile ${className}`}>
      <Image src={photo.src} alt="" fill sizes={sizes} placeholder="blur" quality={70} />
      <span className="photo-tile__shade" aria-hidden="true" />
      <span className="photo-tile__body">
        {meta && <span className="photo-tile__meta">{meta}</span>}
        <H className="photo-tile__title">{title}</H>
        {text && <span className="photo-tile__text">{text}</span>}
        <span className="photo-tile__go" aria-hidden="true">
          <ArrowRight />
        </span>
      </span>
    </Link>
  );
}

import Image from "next/image";
import Link from "next/link";
import { HeroSlider, type Slide } from "@/components/HeroSlider";
import { Ticker } from "@/components/Ticker";
import { PhotoTile } from "@/components/PhotoTile";
import { PhotoBand } from "@/components/PhotoBand";
import { ProductCard } from "@/components/ProductCard";
import { ToolDrawing } from "@/components/ToolDrawing";
import { ArrowRight } from "@/components/icons";
import { categories, products } from "@/content/products";
import { company } from "@/content/company";
import { categoryPhoto, photos } from "@/content/images";
import { catalogHref } from "@/lib/catalog";
import { CUSTOM_WORK, MAKING_RESULT, MAKING_STEPS, QUOTE_CHECKLIST, WHY_CHOOSE_US } from "@/content/process";

const SLIDES: Slide[] = [
  {
    photo: photos.surfaceGrinder,
    kicker: company.name,
    title: "Precision tools built to cut and mark.",
    body: "Shearing blades, trimming and slitting cutters, steel piercing punches and steel stamps for industrial use.",
    href: "/products",
    cta: "Our products",
  },
  {
    photo: photos.guillotineShear,
    kicker: "Shearing blades",
    title: "Clean, accurate cuts in sheet and plate.",
    body: "Straight and custom-profile blades for cutting metal sheets and plates to the sizes you need.",
    href: catalogHref({ category: ["shearing-blades"] }),
    cta: "Shearing blades",
  },
  {
    photo: photos.steelCoils,
    kicker: "Trimming & slitting cutters",
    title: "Free edges and narrow strips with minimum burr.",
    body: "Trimming cutters for parts after the draw process, and slitting cutters for decoiler machines.",
    href: catalogHref({ category: ["trimming-slitting"] }),
    cta: "Trimming & slitting cutters",
  },
  {
    photo: photos.fabricationSparks,
    kicker: "Piercing punches & steel stamps",
    title: "Clean holes. Clear, traceable marks.",
    body: "Hardened punches built for repeated high-pressure use, and durable stamps for marking, numbering and coding.",
    href: "/products",
    cta: "Punches & stamps",
  },
];

export default function HomePage() {
  return (
    <>
      <HeroSlider slides={SLIDES} />
      <Ticker />

      <section className="section" aria-labelledby="intro-title">
        <div className="wrap split">
          <div className="stack">
            <p className="eyebrow">
              {company.name} · Since {company.foundedYear}
            </p>
            <h2 id="intro-title" className="h2">
              A tool should do its job cleanly, consistently and for a long time.
            </h2>
            <p className="lede">
              {company.name} manufactures precision tools for industrial use. Manufacturers across the globe rely on our
              tools to keep their production lines running accurately and efficiently.
            </p>
            <div className="btn-row">
              <Link href="/products" className="btn">
                Browse our products <ArrowRight />
              </Link>
              <Link href="/about" className="btn btn--ghost">
                About us
              </Link>
            </div>
          </div>
          <div className="photo-stack" data-reveal>
            <div className="photo-stack__main">
              <Image src={photos.grindingSparks.src} alt={photos.grindingSparks.alt} fill sizes="(max-width: 900px) 100vw, 50vw" placeholder="blur" quality={70} />
            </div>
            <div className="photo-stack__card">
              <ToolDrawing id="shear-blade" title="Shearing blade" />
              <p className="photo-stack__caption">Shearing blade · illustrative</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--white" aria-labelledby="range-title">
        <div className="wrap">
          <div className="section-head section-head--split">
            <div className="stack-sm">
              <p className="eyebrow">What we make</p>
              <h2 id="range-title" className="h2">
                Tools to cut and mark.
              </h2>
            </div>
            <p className="lede">{CUSTOM_WORK}</p>
          </div>
          <div className="bento" data-reveal>
            {categories.map((c, i) => (
              <PhotoTile
                key={c.id}
                className={i === 0 ? "bento__lead" : ""}
                photo={categoryPhoto[c.id]}
                href={catalogHref({ category: [c.id] })}
                title={c.name}
                text={c.blurb}
                sizes={i === 0 ? "(max-width: 620px) 100vw, 50vw" : "(max-width: 620px) 100vw, (max-width: 1000px) 50vw, 25vw"}
              />
            ))}
          </div>
        </div>
      </section>

      <PhotoBand photo={photos.furnace} tall>
        <div className="stack" style={{ maxWidth: 640 }}>
          <p className="eyebrow eyebrow--light">How our tools are made</p>
          <h2 className="h2">{MAKING_RESULT}</h2>
        </div>
        <ol className="band-steps">
          {MAKING_STEPS.map((s, i) => (
            <li key={s.title}>
              <span className="band-steps__no">{String(i + 1).padStart(2, "0")}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
      </PhotoBand>

      <section className="section" aria-labelledby="products-title">
        <div className="wrap">
          <div className="section-head section-head--split">
            <div className="stack-sm">
              <p className="eyebrow">Products</p>
              <h2 id="products-title" className="h2">
                Our product range.
              </h2>
            </div>
            <div>
              <Link href="/products" className="link-arrow">
                All products <ArrowRight />
              </Link>
            </div>
          </div>
          <div className="card-grid" data-reveal>
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--white section--rule" aria-labelledby="why-title">
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

      <section className="section" aria-labelledby="send-title">
        <div className="wrap split">
          <div className="stack">
            <p className="eyebrow">Custom tools</p>
            <h2 id="send-title" className="h2">
              What to send us.
            </h2>
            <p className="lede">We make tools to your exact requirements. Tell us what you need:</p>
            <ul className="check-list">
              {QUOTE_CHECKLIST.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <div className="btn-row">
              <Link href="/contact?type=quote" className="btn btn--accent">
                Start a quote request <ArrowRight />
              </Link>
            </div>
          </div>
          <div className="photo-frame" data-reveal>
            <Image src={photos.fabricationCutting.src} alt={photos.fabricationCutting.alt} fill sizes="(max-width: 900px) 100vw, 50vw" placeholder="blur" quality={70} />
          </div>
        </div>
      </section>
    </>
  );
}

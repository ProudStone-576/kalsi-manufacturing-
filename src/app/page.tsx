import Image from "next/image";
import Link from "next/link";
import { HeroSlider, type Slide } from "@/components/HeroSlider";
import { Ticker } from "@/components/Ticker";
import { PhotoTile } from "@/components/PhotoTile";
import { PhotoBand } from "@/components/PhotoBand";
import { ProductCard } from "@/components/ProductCard";
import { BladeDrawing } from "@/components/BladeDrawing";
import { ArrowRight } from "@/components/icons";
import { categories, products, productBySlug } from "@/content/products";
import { industries } from "@/content/industries";
import { materials } from "@/content/materials";
import { categoryPhoto, industryPhoto, photos } from "@/content/images";
import { catalogHref } from "@/lib/catalog";
import { ORDER_STEPS, QUOTE_CHECKLIST } from "@/content/process";

const SLIDES: Slide[] = [
  {
    photo: photos.rollingMillHotBar,
    kicker: "Rolling mill shears",
    title: "Shearing blades, made to your drawing.",
    body: "Crop, flying, billet and bar shear blades for steel plants — in hot-work grades chosen for the heat and shock of the mill.",
    href: catalogHref({ category: ["rolling-mill"] }),
    cta: "Rolling mill blades",
  },
  {
    photo: photos.guillotineShear,
    kicker: "Plate & sheet shearing",
    title: "Straight, true blades for every guillotine.",
    body: "Upper and lower blades for hydraulic and mechanical plate shears, with two or four cutting edges and the hole pattern your machine needs.",
    href: catalogHref({ category: ["plate-shearing"] }),
    cta: "Plate shear blades",
  },
  {
    photo: photos.grindingSparks,
    kicker: "Manufacturing",
    title: "Hardened, tempered and ground to the drawing.",
    body: "Grade selection, heat treatment and precision grinding decide how long a blade lasts. See how every blade is made and checked.",
    href: "/manufacturing",
    cta: "How blades are made",
  },
  {
    photo: photos.scrapShearCut,
    kicker: "Recycling & size reduction",
    title: "Tough blades for scrap, shredders and granulators.",
    body: "Reversible scrap shear blades, shredder knives and granulator knives, specified for toughness where every cut is a shock load.",
    href: catalogHref({ category: ["recycling"] }),
    cta: "Recycling blades",
  },
];

const FEATURED = ["guillotine-shear-blades", "hot-crop-and-flying-shear-blades", "rotary-slitter-knives", "scrap-shear-blades"];

export default function HomePage() {
  const featured = FEATURED.map((s) => productBySlug.get(s)!).filter(Boolean);
  return (
    <>
      <HeroSlider slides={SLIDES} />
      <Ticker />

      <section className="section" aria-labelledby="intro-title">
        <div className="wrap split">
          <div className="stack">
            <p className="eyebrow">S.K. Kalsi · Shearing blade manufacturer</p>
            <h2 id="intro-title" className="h2">
              One trade, done properly: the blade that does the cutting.
            </h2>
            <p className="lede">
              We make shearing blades and industrial knives for the machines that cut steel, sheet, coil, scrap, plastic and
              paper. Every blade is manufactured to the drawing or sample you send, for the machine you run.
            </p>
            <div className="btn-row">
              <Link href="/products" className="btn">
                Browse {products.length} blade types <ArrowRight />
              </Link>
              <Link href="/about" className="btn btn--ghost">
                About us
              </Link>
            </div>
          </div>
          <div className="photo-stack" data-reveal>
            <div className="photo-stack__main">
              <Image src={photos.surfaceGrinder.src} alt={photos.surfaceGrinder.alt} fill sizes="(max-width: 900px) 100vw, 50vw" placeholder="blur" quality={70} />
            </div>
            <div className="photo-stack__card">
              <BladeDrawing id="straight-4edge" title="Guillotine shear blade with four cutting edges" />
              <p className="photo-stack__caption">Four-edge guillotine blade · illustrative</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--white" aria-labelledby="range-title">
        <div className="wrap">
          <div className="section-head section-head--split">
            <div className="stack-sm">
              <p className="eyebrow">Product range</p>
              <h2 id="range-title" className="h2">
                Blades for every machine that shears.
              </h2>
            </div>
            <p className="lede">Choose the kind of machine you run. Grade, hardness and geometry are matched to the work.</p>
          </div>
          <div className="bento" data-reveal>
            {categories.map((c, i) => (
              <PhotoTile
                key={c.id}
                className={i === 0 ? "bento__lead" : ""}
                photo={categoryPhoto[c.id]}
                href={catalogHref({ category: [c.id] })}
                title={c.name}
                meta={`${products.filter((p) => p.category === c.id).length} blade types`}
                text={c.blurb}
                sizes={i === 0 ? "(max-width: 620px) 100vw, 50vw" : "(max-width: 620px) 100vw, (max-width: 1000px) 50vw, 25vw"}
              />
            ))}
          </div>
        </div>
      </section>

      <PhotoBand photo={photos.furnace} tall>
        <div className="stack" style={{ maxWidth: 640 }}>
          <p className="eyebrow eyebrow--light">How ordering works</p>
          <h2 className="h2">From your drawing to a blade in the machine.</h2>
        </div>
        <ol className="band-steps">
          {ORDER_STEPS.map((s, i) => (
            <li key={s.title}>
              <span className="band-steps__no">{String(i + 1).padStart(2, "0")}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
      </PhotoBand>

      <section className="section" aria-labelledby="featured-title">
        <div className="wrap">
          <div className="section-head section-head--split">
            <div className="stack-sm">
              <p className="eyebrow">Most requested</p>
              <h2 id="featured-title" className="h2">
                Start with the blade you know.
              </h2>
            </div>
            <div>
              <Link href="/products" className="link-arrow">
                See all {products.length} blade types <ArrowRight />
              </Link>
            </div>
          </div>
          <div className="card-grid" data-reveal>
            {featured.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--dark" aria-labelledby="industries-title">
        <div className="wrap">
          <div className="section-head section-head--split">
            <div className="stack-sm">
              <p className="eyebrow eyebrow--light">Industries served</p>
              <h2 id="industries-title" className="h2">
                Where our blades work.
              </h2>
            </div>
            <div>
              <Link href="/industries" className="link-arrow">
                All industries <ArrowRight />
              </Link>
            </div>
          </div>
          <div className="tile-grid" data-reveal>
            {industries.map((i) => (
              <PhotoTile key={i.id} photo={industryPhoto[i.id]} href={`/industries#${i.id}`} title={i.name} text={i.summary} />
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="send-title">
        <div className="wrap split">
          <div className="stack">
            <p className="eyebrow">For a fast quotation</p>
            <h2 id="send-title" className="h2">
              What to send us.
            </h2>
            <p className="lede">The more we know about the blade and the job it does, the sooner we can quote it properly.</p>
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
            <Image src={photos.fabricationSparks.src} alt={photos.fabricationSparks.alt} fill sizes="(max-width: 900px) 100vw, 50vw" placeholder="blur" quality={70} />
          </div>
        </div>
      </section>

      <section className="section section--white" aria-labelledby="materials-title">
        <div className="wrap split split--top">
          <div className="stack">
            <p className="eyebrow">Materials</p>
            <h2 id="materials-title" className="h2">
              The grade is chosen for the cut, not the catalogue.
            </h2>
            <p className="lede">
              Cold shearing thin sheet, cropping hot billet and chopping mixed scrap ask opposite things of a blade. Wear
              resistance, toughness and hot hardness are balanced for each application.
            </p>
            <div>
              <Link href="/manufacturing#materials" className="link-arrow">
                Tool-steel reference <ArrowRight />
              </Link>
            </div>
          </div>
          <dl className="grade-list">
            {materials.map((m) => (
              <div key={m.id}>
                <dt>{m.name}</dt>
                <dd>{m.suits}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}

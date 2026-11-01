import Link from "next/link";
import { categoryById, type Product } from "@/content/products";
import { BladeDrawing } from "./BladeDrawing";
import { ArrowRight } from "./icons";

export function ProductCard({ product, headingLevel = 3 }: { product: Product; headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className="p-card">
      <div className="p-card__figure">
        <BladeDrawing id={product.drawing} title={product.name} />
      </div>
      <div className="p-card__body">
        <p className="label">{categoryById[product.category].name}</p>
        <H className="p-card__title">
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </H>
        <p className="p-card__summary">{product.summary}</p>
        <div className="p-card__meta">
          <span className="label">
            {product.machines.length} machine type{product.machines.length === 1 ? "" : "s"}
          </span>
          <span className="p-card__go" aria-hidden="true">
            <ArrowRight />
          </span>
        </div>
      </div>
    </article>
  );
}

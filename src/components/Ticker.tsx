import Link from "next/link";
import { products } from "@/content/products";

/** Continuous ticker of products. Duplicated once for a seamless loop; static with reduced motion. */
export function Ticker() {
  const items = products.map((p) => (
    <li key={p.slug}>
      <Link href={`/products/${p.slug}`}>{p.name}</Link>
    </li>
  ));
  return (
    <nav className="ticker" aria-label="Products">
      <div className="ticker__track">
        <ul>{items}</ul>
        <ul aria-hidden="true">
          {products.map((p) => (
            <li key={p.slug}>
              <Link href={`/products/${p.slug}`} tabIndex={-1}>
                {p.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

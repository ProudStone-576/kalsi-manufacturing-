import Link from "next/link";
import { ArrowRight } from "@/components/icons";

export default function NotFound() {
  return (
    <section className="section">
      <div className="wrap stack" style={{ maxWidth: 760 }}>
        <p className="eyebrow">Error 404</p>
        <h1 className="h1">This page is not on the drawing.</h1>
        <p className="lede">The address may be mistyped, or the page may have moved. These will get you back on track:</p>
        <div className="btn-row">
          <Link href="/products" className="btn">
            Product catalogue <ArrowRight />
          </Link>
          <Link href="/contact" className="btn btn--ghost">
            Contact us
          </Link>
          <Link href="/" className="btn btn--ghost">
            Home
          </Link>
        </div>
      </div>
    </section>
  );
}

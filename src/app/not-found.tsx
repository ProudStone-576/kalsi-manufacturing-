import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="wrap stack" style={{ maxWidth: 760 }}>
        <h1 className="h1">This page could not be found.</h1>
        <p className="lede">The address may be mistyped, or the page may have moved. These will get you back on track:</p>
        <div className="btn-row">
          <Link href="/products" className="btn">
            Product catalogue
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

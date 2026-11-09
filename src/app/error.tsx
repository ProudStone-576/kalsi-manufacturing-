"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="section">
      <div className="wrap stack" style={{ maxWidth: 760 }}>
        <h1 className="h1">This page could not be loaded.</h1>
        <p className="lede">
          Please try again. If the problem continues, use the contact page and mention the code below.
          {error.digest && (
            <>
              {" "}
              <code>{error.digest}</code>
            </>
          )}
        </p>
        <div className="btn-row">
          <button type="button" className="btn" onClick={reset}>
            Try again
          </button>
          <Link href="/" className="btn btn--ghost">
            Home
          </Link>
        </div>
      </div>
    </section>
  );
}

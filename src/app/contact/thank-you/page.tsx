import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/PageHead";
import { ArrowRight } from "@/components/icons";
import { REFERENCE_PATTERN } from "@/lib/reference";

export const metadata: Metadata = { title: "Enquiry received", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** Landing page for enquiries sent without JavaScript. */
export default async function ThankYouPage({ searchParams }: Props) {
  const raw = (await searchParams).ref;
  const ref = typeof raw === "string" && REFERENCE_PATTERN.test(raw) ? raw : null;
  return (
    <>
      <PageHead
        crumbs={[
          { href: "/contact", label: "Contact" },
          { href: "/contact/thank-you", label: "Enquiry received" },
        ]}
        label="Enquiry received"
        title="Thank you — we have your enquiry"
        lede="Our team reviews every enquiry and replies by email. If we need more detail about the blade or the machine, we will ask."
      />
      <section className="section section--tight">
        <div className="wrap stack">
          {ref && (
            <div className="alert alert--ok" role="status">
              <span>
                Your reference is <strong style={{ fontFamily: "var(--font-mono)" }}>{ref}</strong>. Please quote it in any
                follow-up.
              </span>
            </div>
          )}
          <div className="btn-row">
            <Link href="/products" className="btn">
              Back to the catalogue <ArrowRight />
            </Link>
            <Link href="/" className="btn btn--ghost">
              Home
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import { PageHead } from "@/components/PageHead";
import { company } from "@/content/company";

export const metadata: Metadata = {
  title: "Privacy notice",
  description: `How ${company.name} handles the information you send through this website.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <PageHead
        crumbs={[{ href: "/privacy", label: "Privacy notice" }]}
        label="Privacy"
        title="Privacy notice"
        lede="What this website collects, why, and what you can ask us to do with it."
      />
      <section className="section section--tight">
        <div className="wrap prose stack">
          <div className="stack-sm">
            <h2 className="h3">What we collect</h2>
            <p>
              When you send an enquiry we receive what you enter in the form — your name, email address and, if you give
              them, your company, phone number, country, product details, message and any drawings or photos
              you attach. We also log the time of the enquiry and a shortened browser identifier to help detect abuse.
            </p>
          </div>
          <div className="stack-sm">
            <h2 className="h3">Why we use it</h2>
            <p>
              Only to answer your enquiry, prepare a quotation and keep a record of our correspondence with you. We do not
              sell your information or use it for unrelated marketing, and we do not send automated messages to the
              address you enter.
            </p>
          </div>
          <div className="stack-sm">
            <h2 className="h3">Where it is kept</h2>
            <p>
              Enquiries are delivered to our sales inbox by email and kept in a private record on our server. Attached
              drawings are stored outside the public website and are never published.
            </p>
          </div>
          <div className="stack-sm">
            <h2 className="h3">Cookies and tracking</h2>
            <p>
              This website sets no tracking or advertising cookies. If you build a quote list, it is saved in your own
              browser&apos;s local storage so it survives a page reload; it is not sent to us until you submit the form,
              and you can clear it at any time by removing the items.
            </p>
          </div>
          <div className="stack-sm">
            <h2 className="h3">Your choices</h2>
            <p>
              You can ask us what information we hold about you, ask us to correct it, or ask us to delete it, by replying
              to any email from us or by sending a new enquiry through the contact page.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

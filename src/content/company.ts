/**
 * Company facts.
 *
 * Only confirmed facts are filled in. Every other field is intentionally empty: nothing here
 * may be invented. The UI renders a field only when it has a value, so filling one in below is
 * all it takes to publish it (see README → "Content to confirm").
 */
export type Certification = { name: string; issuer: string; certificateNumber?: string };
export type Location = { label: string; lines: string[]; mapUrl?: string };

export const company = {
  name: "S.S. Kalsi Industries",
  trade: "Precision industrial tools",
  /** Registered legal name, if it differs from the trading name. */
  legalName: null as string | null,
  foundedYear: 2010 as number | null,
  /** International format, e.g. "+91 98xxxxxxx". Rendered as a tel: link. */
  phone: "+91 98913 32220" as string | null,
  /** Public sales mailbox shown on the site (enquiries are delivered via ENQUIRY_TO). */
  email: "sskalsiind@gmail.com" as string | null,
  /** WhatsApp number in international format without spaces, e.g. "9198xxxxxxxx". */
  whatsapp: "919891332220" as string | null,
  locations: [
    {
      label: "Address",
      lines: ["Plot No. 51/11, Old Press Colony", "Near Central Bank of India", "Faridabad, Haryana"],
      mapUrl: "https://www.google.com/maps/search/?api=1&query=28.371308%2C77.291516",
    },
  ] as Location[],
  certifications: [] as Certification[],
  /** GSTIN / VAT / company registration numbers to show in the footer. */
  registrations: [] as { label: string; value: string }[],
  businessHours: null as string | null,
  social: {} as Partial<Record<"linkedin" | "youtube" | "facebook" | "instagram", string>>,
} as const;

export function hasDirectContact(): boolean {
  return Boolean(company.phone || company.email || company.whatsapp || company.locations.length);
}

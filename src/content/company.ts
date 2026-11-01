/**
 * Company facts.
 *
 * Only the company name and trade are known. Every other fact is intentionally empty:
 * nothing here may be invented. The UI renders a field only when it has a value, so filling
 * one in below is all it takes to publish it (see README → "Content to confirm").
 */
export type Certification = { name: string; issuer: string; certificateNumber?: string };
export type Location = { label: string; lines: string[]; mapUrl?: string };

export const company = {
  name: "S.K. Kalsi",
  trade: "Shearing blade manufacturer",
  /** Registered legal name, e.g. "S.K. Kalsi Industries Pvt. Ltd." */
  legalName: null as string | null,
  foundedYear: null as number | null,
  /** International format, e.g. "+91 98xxxxxxx". Rendered as a tel: link. */
  phone: null as string | null,
  /** Public sales mailbox shown on the site (enquiries are delivered via ENQUIRY_TO). */
  email: null as string | null,
  /** WhatsApp number in international format without spaces, e.g. "9198xxxxxxxx". */
  whatsapp: null as string | null,
  locations: [] as Location[],
  certifications: [] as Certification[],
  /** GSTIN / VAT / company registration numbers to show in the footer. */
  registrations: [] as { label: string; value: string }[],
  businessHours: null as string | null,
  social: {} as Partial<Record<"linkedin" | "youtube" | "facebook" | "instagram", string>>,
} as const;

export function hasDirectContact(): boolean {
  return Boolean(company.phone || company.email || company.whatsapp || company.locations.length);
}

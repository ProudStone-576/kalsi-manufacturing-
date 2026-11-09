import { z } from "zod";
import { products } from "@/content/products";

/** Shared by the browser form (instant feedback) and the API route (authoritative check). */

const CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;
const LINE_BREAK = new RegExp(`[\r\n${String.fromCharCode(0x2028, 0x2029)}]`);

const clean = (s: string) => s.normalize("NFC").trim();

const singleLine = (label: string, min: number, max: number) =>
  z
    .string({ error: `${label} is required.` })
    .transform(clean)
    .pipe(
      z
        .string()
        .min(min, min > 0 ? `${label} must be at least ${min} characters.` : undefined)
        .max(max, `${label} must be ${max} characters or fewer.`)
        .refine((s) => !CONTROL.test(s) && !LINE_BREAK.test(s), `${label} contains characters that are not allowed.`),
    );

const optionalLine = (label: string, max: number) =>
  z
    .string()
    .optional()
    .transform((s) => (s === undefined ? "" : clean(s)))
    .pipe(
      z
        .string()
        .max(max, `${label} must be ${max} characters or fewer.`)
        .refine((s) => !CONTROL.test(s) && !LINE_BREAK.test(s), `${label} contains characters that are not allowed.`),
    );

/** Optional positive number in millimetres, accepts "", "12", "12.5", "12,5". */
const optionalMm = (label: string, max: number) =>
  z
    .string()
    .optional()
    .transform((s) => (s ?? "").trim().replace(",", "."))
    .pipe(
      z
        .string()
        .refine((s) => s === "" || /^\d{1,6}(\.\d{1,3})?$/.test(s), `${label} must be a number in millimetres.`)
        .transform((s) => (s === "" ? null : Number(s)))
        .refine((n) => n === null || (n > 0 && n <= max), `${label} must be between 0 and ${max} mm.`),
    );

export const PRODUCT_SLUGS = products.map((p) => p.slug) as [string, ...string[]];
export const MAX_ITEMS = 20;

export const enquiryItemSchema = z.object({
  slug: z.enum(PRODUCT_SLUGS, { error: "Unknown product." }),
  quantity: z.coerce
    .number({ error: "Quantity must be a whole number." })
    .int("Quantity must be a whole number.")
    .min(1, "Quantity must be at least 1.")
    .max(10_000, "Quantity must be 10,000 or fewer."),
});

export const EDGE_OPTIONS = ["", "1", "2", "4", "unsure"] as const;

export const enquirySchema = z
  .object({
    kind: z.enum(["general", "quote"], { error: "Choose an enquiry type." }),
    name: singleLine("Name", 2, 100),
    company: optionalLine("Company", 120),
    email: z
      .string({ error: "Email is required." })
      .transform(clean)
      .pipe(z.email("Enter a valid email address.").max(254, "Email is too long.")),
    phone: optionalLine("Phone", 25).refine(
      (s) => s === "" || /^\+?[0-9 ()\-.]{6,25}$/.test(s),
      "Enter a phone number using digits, spaces, + ( ) - only.",
    ),
    country: optionalLine("Country", 60),
    message: z
      .string({ error: "Message is required." })
      .transform((s) => s.normalize("NFC").replace(/\r\n?/g, "\n").trim())
      .pipe(
        z
          .string()
          .min(10, "Tell us a little more — at least 10 characters.")
          .max(4000, "Message must be 4,000 characters or fewer.")
          .refine((s) => !CONTROL.test(s), "Message contains characters that are not allowed."),
      ),
    items: z.array(enquiryItemSchema).max(MAX_ITEMS, `Up to ${MAX_ITEMS} products per request.`).default([]),
    machine: optionalLine("Machine", 120),
    materialCut: optionalLine("Material worked", 120),
    materialThickness: optionalMm("Material thickness", 1000),
    bladeLength: optionalMm("Tool length", 20_000),
    bladeWidth: optionalMm("Tool width", 2_000),
    bladeThickness: optionalMm("Tool thickness", 500),
    cuttingEdges: z.enum(EDGE_OPTIONS, { error: "Choose a number of edges." }).default(""),
    consent: z.literal("yes", { error: "Please agree so we can reply to you." }),
  })
  .superRefine((v, ctx) => {
    if (v.kind === "quote" && v.items.length === 0 && v.machine === "" && v.bladeLength === null) {
      ctx.addIssue({
        code: "custom",
        path: ["items"],
        message: "Add at least one product, or give the machine or tool length, so we can quote.",
      });
    }
    const slugs = v.items.map((i) => i.slug);
    if (new Set(slugs).size !== slugs.length) {
      ctx.addIssue({ code: "custom", path: ["items"], message: "Each product can appear only once." });
    }
  });

export type EnquiryInput = z.input<typeof enquirySchema>;
export type Enquiry = z.output<typeof enquirySchema>;
export type FieldErrors = Partial<Record<string, string>>;

/** Flattens zod issues to the first message per top-level field. */
export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}

/** Builds the schema input from FormData (browser or server). Repeated itemSlug/itemQty pairs form the item list. */
export function formDataToInput(fd: FormData): Record<string, unknown> {
  const str = (k: string) => {
    const v = fd.get(k);
    return typeof v === "string" ? v : undefined;
  };
  const slugs = fd.getAll("itemSlug").filter((v): v is string => typeof v === "string");
  const qtys = fd.getAll("itemQty").filter((v): v is string => typeof v === "string");
  return {
    kind: str("kind"),
    name: str("name"),
    company: str("company"),
    email: str("email"),
    phone: str("phone"),
    country: str("country"),
    message: str("message"),
    items: slugs.slice(0, MAX_ITEMS + 1).map((slug, i) => ({ slug, quantity: qtys[i] ?? "1" })),
    machine: str("machine"),
    materialCut: str("materialCut"),
    materialThickness: str("materialThickness"),
    bladeLength: str("bladeLength"),
    bladeWidth: str("bladeWidth"),
    bladeThickness: str("bladeThickness"),
    cuttingEdges: str("cuttingEdges") ?? "",
    consent: str("consent"),
  };
}

// Total upload budget in MB, fixed at build time (next.config.ts): 20 MB on a normal Node server,
// 4 MB on Vercel, whose functions reject request bodies over 4.5 MB.
const TOTAL_MB = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB) || 20;
const FILE_MB = Math.min(8, TOTAL_MB);
const MB = 1024 * 1024;

export const ATTACHMENT_RULES = {
  maxFiles: 3,
  maxFileBytes: FILE_MB * MB,
  maxTotalBytes: TOTAL_MB * MB,
  fileMb: FILE_MB,
  totalMb: TOTAL_MB,
  /** e.g. "8 MB each, 20 MB total" or "4 MB in total" */
  sizeHint: FILE_MB < TOTAL_MB ? `${FILE_MB} MB each, ${TOTAL_MB} MB total` : `${TOTAL_MB} MB in total`,
  extensions: ["pdf", "png", "jpg", "jpeg", "dxf", "dwg", "step", "stp"] as const,
  accept: ".pdf,.png,.jpg,.jpeg,.dxf,.dwg,.step,.stp",
};

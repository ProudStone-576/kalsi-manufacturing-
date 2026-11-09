"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { products, productBySlug } from "@/content/products";
import {
  ATTACHMENT_RULES,
  enquirySchema,
  fieldErrors,
  formDataToInput,
  type FieldErrors,
} from "@/lib/enquiry-schema";
import { quoteList, useQuoteList } from "@/lib/quote-store";
import { company } from "@/content/company";
import { AlertIcon, ArrowRight, CheckIcon, TrashIcon, UploadIcon } from "./icons";

type Kind = "general" | "quote";
type Result =
  | { state: "idle" }
  | { state: "sending" }
  | { state: "sent"; reference: string | null }
  | { state: "error"; message: string; contact?: boolean };

const STATUS_MESSAGES: Record<string, string> = {
  invalid: "Some details were missing or invalid. Please check the form and send it again.",
  rate_limited: "Too many enquiries were sent from your connection. Please wait a few minutes and try again.",
  too_large: `The attached files were too large. Attach up to 3 files, ${ATTACHMENT_RULES.sizeHint}.`,
  unavailable: "Online enquiries are temporarily unavailable. Please try again later.",
  forbidden: "Your enquiry could not be verified. Please send it again from this page.",
  unsupported: "Your enquiry could not be read. Please send it again from this page.",
  server: "We could not save your enquiry. Please try again.",
};

const FIELD_ORDER = [
  "kind",
  "items",
  "name",
  "company",
  "email",
  "phone",
  "country",
  "message",
  "drawings",
  "consent",
];

const noopSubscribe = () => () => {};

function fmtSize(b: number) {
  return b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`;
}

function checkFilesClient(files: File[]): string | null {
  if (files.length > ATTACHMENT_RULES.maxFiles) return `Attach up to ${ATTACHMENT_RULES.maxFiles} files.`;
  let total = 0;
  for (const f of files) {
    const ext = (f.name.split(".").pop() ?? "").toLowerCase();
    if (!(ATTACHMENT_RULES.extensions as readonly string[]).includes(ext)) return `“${f.name}” is not an accepted file type.`;
    if (f.size > ATTACHMENT_RULES.maxFileBytes) return `“${f.name}” is larger than ${ATTACHMENT_RULES.fileMb} MB.`;
    total += f.size;
  }
  if (total > ATTACHMENT_RULES.maxTotalBytes) return `Attachments total more than ${ATTACHMENT_RULES.totalMb} MB.`;
  return null;
}

export function EnquiryForm({
  initialKind,
  initialProduct,
  status,
  directContact,
}: {
  initialKind: Kind;
  initialProduct: string | null;
  status: string | null;
  directContact: React.ReactNode;
}) {
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const items = useQuoteList();
  const [kind, setKind] = useState<Kind>(initialKind);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [files, setFiles] = useState<File[]>([]);
  const [drag, setDrag] = useState(false);
  const [msgLen, setMsgLen] = useState(0);
  const [addSlug, setAddSlug] = useState("");
  const [result, setResult] = useState<Result>(
    status && STATUS_MESSAGES[status]
      ? { state: "error", message: STATUS_MESSAGES[status], contact: status === "unavailable" || status === "server" }
      : { state: "idle" },
  );
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  // A product link (?product=slug) adds that product to the quote list once.
  const added = useRef(false);
  useEffect(() => {
    if (added.current || !initialProduct || !productBySlug.has(initialProduct)) return;
    added.current = true;
    quoteList.add(initialProduct);
  }, [initialProduct]);

  // Move focus to the status message on success or on a form-level error. When individual fields
  // are invalid, focus goes to the first invalid field instead (see focusFirstError).
  const hasFieldErrors = Object.values(errors).some(Boolean);
  useEffect(() => {
    if (result.state === "sent" || (result.state === "error" && !hasFieldErrors)) statusRef.current?.focus();
  }, [result, hasFieldErrors]);

  const fid = (name: string) => `${id}-${name}`;
  const err = (name: string) => errors[name];
  const aria = (name: string, hint = false) => ({
    id: fid(name),
    name,
    "aria-invalid": err(name) ? (true as const) : undefined,
    "aria-describedby": [err(name) ? `${fid(name)}-err` : "", hint ? `${fid(name)}-hint` : ""].filter(Boolean).join(" ") || undefined,
  });
  const errorText = (name: string) =>
    err(name) ? (
      <p className="field__error" id={`${fid(name)}-err`}>
        <AlertIcon /> {err(name)}
      </p>
    ) : null;

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next = [...files];
    for (const f of Array.from(list)) {
      if (!next.some((n) => n.name === f.name && n.size === f.size)) next.push(f);
    }
    setFiles(next);
    const problem = checkFilesClient(next);
    setErrors((e) => ({ ...e, drawings: problem ?? undefined }));
  }

  function focusFirstError(errs: FieldErrors) {
    const first = FIELD_ORDER.find((f) => errs[f]);
    if (!first) return;
    const el =
      (first === "items" ? document.getElementById(fid("add")) : null) ??
      (first === "kind" ? formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`) : null) ??
      document.getElementById(fid(first));
    el?.focus();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (result.state === "sending") return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.delete("drawings");
    for (const f of files) fd.append("drawings", f, f.name);

    const parsed = enquirySchema.safeParse(formDataToInput(fd));
    const errs: FieldErrors = parsed.success ? {} : fieldErrors(parsed.error);
    const fileProblem = checkFilesClient(files);
    if (fileProblem) errs.drawings = fileProblem;
    setErrors(errs);
    if (Object.keys(errs).length) {
      setResult({ state: "error", message: "Please correct the highlighted fields." });
      focusFirstError(errs);
      return;
    }

    setResult({ state: "sending" });
    try {
      const res = await fetch("/api/enquiry", { method: "POST", body: fd, headers: { Accept: "application/json" } });
      const data = (await res.json().catch(() => null)) as
        | { ok: true; reference: string | null }
        | { ok: false; message?: string; fields?: FieldErrors }
        | null;
      if (res.ok && data?.ok) {
        if (kind === "quote") quoteList.clear();
        form.reset();
        setFiles([]);
        setMsgLen(0);
        setResult({ state: "sent", reference: data.reference });
        return;
      }
      if (data && !data.ok && data.fields) {
        setErrors(data.fields);
        focusFirstError(data.fields);
      }
      setResult({
        state: "error",
        message: (data && !data.ok && data.message) || "Something went wrong. Please try again.",
        contact: res.status >= 500,
      });
    } catch {
      setResult({ state: "error", message: "We could not reach the server. Check your connection and try again.", contact: true });
    }
  }

  if (result.state === "sent") {
    return (
      <div className="stack" ref={statusRef} tabIndex={-1} role="status" aria-live="polite">
        <div className="alert alert--ok">
          <strong>
            <CheckIcon style={{ display: "inline", verticalAlign: "-3px" }} /> Thank you — your enquiry has been received.
          </strong>
          {result.reference && (
            <span>
              Your reference is <strong style={{ fontFamily: "var(--font-mono)" }}>{result.reference}</strong>. Please quote it in
              any follow-up.
            </span>
          )}
        </div>
        <p className="lede">
          Our team reviews every enquiry and replies by email. If we need more detail about the tool you need,
          we will ask.
        </p>
        <div className="btn-row">
          <button type="button" className="btn btn--ghost" onClick={() => setResult({ state: "idle" })}>
            Send another enquiry
          </button>
          <Link href="/products" className="btn">
            Back to the catalogue <ArrowRight />
          </Link>
        </div>
      </div>
    );
  }

  const sending = result.state === "sending";
  const available = products.filter((p) => !items.some((i) => i.slug === p.slug));

  return (
    <form ref={formRef} className="form" action="/api/enquiry" method="post" encType="multipart/form-data" noValidate onSubmit={onSubmit}>
      <div ref={statusRef} tabIndex={-1} aria-live="assertive">
        {result.state === "error" && (
          <div className="alert alert--error" role="alert">
            <strong>{result.message}</strong>
            {result.contact && directContact}
          </div>
        )}
      </div>

      <fieldset className="form-section">
        <legend>What can we help with?</legend>
        <div className="segmented" role="radiogroup" aria-label="Enquiry type">
          <label>
            <input type="radio" name="kind" value="quote" checked={kind === "quote"} onChange={() => setKind("quote")} />
            <span>Request a quote</span>
          </label>
          <label>
            <input type="radio" name="kind" value="general" checked={kind === "general"} onChange={() => setKind("general")} />
            <span>General question</span>
          </label>
        </div>
      </fieldset>

      {kind === "quote" && (
        <>
          <fieldset className="form-section" id="quote-list">
            <legend>
              Products <span className="label">Quote list</span>
            </legend>
            {items.length > 0 ? (
              <table className="items-table">
                <caption className="visually-hidden">Products in this quote request</caption>
                <thead>
                  <tr>
                    <th scope="col">Product</th>
                    <th scope="col" className="qty">
                      Quantity
                    </th>
                    <th scope="col" className="rm">
                      <span className="visually-hidden">Remove</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => {
                    const p = productBySlug.get(it.slug)!;
                    return (
                      <tr key={it.slug}>
                        <td>
                          <Link href={`/products/${it.slug}`}>{p.name}</Link>
                          <input type="hidden" name="itemSlug" value={it.slug} />
                        </td>
                        <td className="qty">
                          <input
                            className="input"
                            type="number"
                            name="itemQty"
                            min={1}
                            max={10000}
                            step={1}
                            inputMode="numeric"
                            value={it.quantity}
                            aria-label={`Quantity of ${p.name}`}
                            onChange={(e) => quoteList.setQuantity(it.slug, Number(e.target.value))}
                          />
                        </td>
                        <td className="rm">
                          <button type="button" className="icon-btn" aria-label={`Remove ${p.name}`} onClick={() => quoteList.remove(it.slug)}>
                            <TrashIcon />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : !mounted && initialProduct && productBySlug.has(initialProduct) ? (
              // Without JavaScript the quote list is unavailable; carry the product from the link instead.
              <p>
                {productBySlug.get(initialProduct)!.name} × 1
                <input type="hidden" name="itemSlug" value={initialProduct} />
                <input type="hidden" name="itemQty" value="1" />
              </p>
            ) : (
              <p className="muted">
                No products added yet. Choose one below, or <Link href="/products">browse the catalogue</Link> and use “Add to quote
                list”.
              </p>
            )}
            {available.length > 0 && items.length < 20 && (
              <div className="field">
                <label htmlFor={fid("add")}>Add a product</label>
                <div style={{ display: "flex", gap: 10 }}>
                  <select
                    id={fid("add")}
                    className="select"
                    value={addSlug}
                    onChange={(e) => setAddSlug(e.target.value)}
                    aria-invalid={err("items") ? true : undefined}
                    aria-describedby={err("items") ? `${fid("items")}-err` : undefined}
                  >
                    <option value="">Select a product…</option>
                    {available.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    disabled={!addSlug}
                    onClick={() => {
                      if (quoteList.add(addSlug)) {
                        setAddSlug("");
                        setErrors((e) => ({ ...e, items: undefined }));
                      }
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
            {errorText("items")}
          </fieldset>

        </>
      )}

      <fieldset className="form-section">
        <legend>Your details</legend>
        <div className="field-row">
          <div className="field">
            <label htmlFor={fid("name")}>Name</label>
            <input className="input" type="text" required maxLength={100} autoComplete="name" {...aria("name")} />
            {errorText("name")}
          </div>
          <div className="field">
            <label htmlFor={fid("company")}>
              Company <span className="opt">(optional)</span>
            </label>
            <input className="input" type="text" maxLength={120} autoComplete="organization" {...aria("company")} />
            {errorText("company")}
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor={fid("email")}>Email</label>
            <input className="input" type="email" required maxLength={254} autoComplete="email" {...aria("email")} />
            {errorText("email")}
          </div>
          <div className="field">
            <label htmlFor={fid("phone")}>
              Phone <span className="opt">(optional)</span>
            </label>
            <input className="input" type="tel" maxLength={25} autoComplete="tel" {...aria("phone")} />
            {errorText("phone")}
          </div>
        </div>
        <div className="field">
          <label htmlFor={fid("country")}>
            Country <span className="opt">(optional)</span>
          </label>
          <input className="input" type="text" maxLength={60} autoComplete="country-name" {...aria("country")} />
          {errorText("country")}
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend>{kind === "quote" ? "Details & drawings" : "Your question"}</legend>
        <div className="field">
          <label htmlFor={fid("message")}>{kind === "quote" ? "Anything else we should know" : "Message"}</label>
          <textarea
            className="textarea"
            required
            maxLength={4000}
            placeholder={
              kind === "quote"
                ? "Machine and material, sizes, profile or grade, delivery location, required date…"
                : "How can we help?"
            }
            onChange={(e) => setMsgLen(e.target.value.length)}
            {...aria("message", true)}
          />
          <p className="field__hint" id={`${fid("message")}-hint`}>
            {msgLen} / 4,000 characters
          </p>
          {errorText("message")}
        </div>

        <div className="field">
          <span className="field__label" id={fid("drawings-label")}>
            Drawings or photos <span className="opt">(optional)</span>
          </span>
          <div
            className="dropzone"
            data-active={drag}
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              addFiles(e.dataTransfer.files);
            }}
          >
            <UploadIcon />
            <strong>Drop files here or choose files</strong>
            <span className="field__hint" id={`${fid("drawings")}-hint`}>
              PDF, PNG, JPG, DXF, DWG or STEP · up to 3 files · {ATTACHMENT_RULES.sizeHint}
            </span>
            <input
              id={fid("drawings")}
              type="file"
              name="drawings"
              multiple
              accept={ATTACHMENT_RULES.accept}
              aria-labelledby={fid("drawings-label")}
              aria-describedby={`${fid("drawings")}-hint${err("drawings") ? ` ${fid("drawings")}-err` : ""}`}
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>
          {files.length > 0 && (
            <ul className="file-list" aria-label="Attached files">
              {files.map((f) => (
                <li key={f.name + f.size}>
                  <span>{f.name}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="size">{fmtSize(f.size)}</span>
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label={`Remove ${f.name}`}
                      onClick={() => {
                        const next = files.filter((x) => x !== f);
                        setFiles(next);
                        setErrors((e) => ({ ...e, drawings: checkFilesClient(next) ?? undefined }));
                      }}
                    >
                      <TrashIcon />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
          {errorText("drawings")}
        </div>
      </fieldset>

      {/* Honeypot for bots; hidden from people and assistive technology. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor={fid("website")}>Website</label>
        <input id={fid("website")} type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="field">
        <label className="check" htmlFor={fid("consent")}>
          <input type="checkbox" value="yes" required {...aria("consent")} />
          <span>
            I agree that {company.name} may use these details to answer my enquiry, as described in the{" "}
            <Link href="/privacy">privacy notice</Link>.
          </span>
        </label>
        {errorText("consent")}
      </div>

      <div className="btn-row">
        <button type="submit" className="btn btn--accent" disabled={sending} aria-disabled={sending}>
          {sending ? (
            <>
              <span className="spinner" aria-hidden="true" /> Sending…
            </>
          ) : (
            <>
              {kind === "quote" ? "Send quote request" : "Send enquiry"} <ArrowRight />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

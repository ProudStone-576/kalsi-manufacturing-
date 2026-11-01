"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { quoteList, useQuoteList } from "@/lib/quote-store";
import { CheckIcon, PlusIcon } from "./icons";

export function AddToQuoteButton({ slug, name, size }: { slug: string; name: string; size?: "sm" }) {
  const items = useQuoteList();
  const inList = items.some((i) => i.slug === slug);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(false), 4500);
    return () => window.clearTimeout(t);
  }, [toast]);

  const cls = `btn btn--ghost${size === "sm" ? " btn--sm" : ""}`;

  return (
    <>
      {inList ? (
        <Link className={cls} href="/contact?type=quote#quote-list">
          <CheckIcon /> In your quote list
        </Link>
      ) : (
        <button
          type="button"
          className={cls}
          onClick={() => {
            if (quoteList.add(slug)) setToast(true);
          }}
          disabled={items.length >= 20}
        >
          <PlusIcon /> Add to quote list
        </button>
      )}
      <div aria-live="polite" className={toast ? "toast" : "visually-hidden"}>
        {toast && (
          <>
            <span>{name} added to your quote list.</span>
            <Link href="/contact?type=quote#quote-list">Review list</Link>
          </>
        )}
      </div>
    </>
  );
}

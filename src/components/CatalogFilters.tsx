"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import type { CatalogQuery } from "@/lib/catalog";
import { SearchIcon } from "./icons";

type Option = { value: string; label: string; count: number };

/**
 * GET form: works without JavaScript (Apply button). With JavaScript, changes apply immediately
 * and the URL is updated so filtered views can be shared and bookmarked.
 */
export function CatalogFilters({
  query,
  categories,
  industries,
  machines,
}: {
  query: CatalogQuery;
  categories: Option[];
  industries: Option[];
  machines: Option[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [text, setText] = useState(query.q);
  const [lastQ, setLastQ] = useState(query.q);
  const debounce = useRef<number | undefined>(undefined);

  // The search chip was removed elsewhere on the page: clear the box. (While typing, the URL
  // only ever catches up with the input, so it must not overwrite it.)
  if (query.q !== lastQ) {
    setLastQ(query.q);
    if (query.q === "") setText("");
  }

  // Checkbox state mirrors the URL, but updates instantly on click (controlled, no remount, focus kept).
  const urlKey = JSON.stringify([query.category, query.industry, query.machine]);
  const [lastKey, setLastKey] = useState(urlKey);
  const [sel, setSel] = useState<Record<string, string[]>>({
    category: query.category,
    industry: query.industry,
    machine: query.machine,
  });
  if (urlKey !== lastKey) {
    setLastKey(urlKey);
    setSel({ category: query.category, industry: query.industry, machine: query.machine });
  }

  function toggle(name: string, value: string, on: boolean) {
    setSel((s) => ({ ...s, [name]: on ? [...(s[name] ?? []), value] : (s[name] ?? []).filter((v) => v !== value) }));
    apply();
  }

  useEffect(() => () => window.clearTimeout(debounce.current), []);

  function apply() {
    const form = formRef.current;
    if (!form) return;
    const sp = new URLSearchParams();
    for (const [k, v] of new FormData(form)) {
      if (typeof v === "string" && v.trim()) sp.append(k, v.trim());
    }
    const qs = sp.toString();
    startTransition(() => router.replace(qs ? `/products?${qs}` : "/products", { scroll: false }));
  }

  const group = (legend: string, name: string, opts: Option[], hideLegend = false) => (
    <fieldset>
      <legend className={hideLegend ? "visually-hidden" : "label"}>{legend}</legend>
      {opts.map((o) => (
        <label key={o.value} className="filter-opt">
          <input
            type="checkbox"
            name={name}
            value={o.value}
            checked={(sel[name] ?? []).includes(o.value)}
            onChange={(e) => toggle(name, o.value, e.currentTarget.checked)}
          />
          <span>{o.label}</span>
          <span className="n">{o.count}</span>
        </label>
      ))}
    </fieldset>
  );

  return (
    <form
      ref={formRef}
      className="filters"
      action="/products"
      method="get"
      role="search"
      aria-label="Filter products"
      aria-busy={pending}
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
    >
      <div className="field">
        <label htmlFor="catalog-q" className="label">
          Search
        </label>
        <div className="search-field">
          <SearchIcon />
          <input
            id="catalog-q"
            className="input"
            type="search"
            name="q"
            value={text}
            maxLength={80}
            placeholder="e.g. rebar, slitting, 4 edge"
            onChange={(e) => {
              setText(e.target.value);
              window.clearTimeout(debounce.current);
              debounce.current = window.setTimeout(apply, 250);
            }}
          />
        </div>
      </div>
      {group("Blade type", "category", categories)}
      {group("Industry", "industry", industries)}
      <details className="filter-group" open={query.machine.length > 0}>
        <summary className="label" style={{ paddingBottom: 10, borderBottom: "1px solid var(--line)", marginBottom: 8 }}>
          Machine type {query.machine.length > 0 ? `(${query.machine.length})` : "+"}
        </summary>
        {group("Machine type", "machine", machines, true)}
      </details>
      <div className="filters__actions no-js-only">
        <button type="submit" className="btn btn--sm">
          Apply filters
        </button>
      </div>
    </form>
  );
}

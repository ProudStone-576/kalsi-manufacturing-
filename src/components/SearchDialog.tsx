"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { search, searchIndex, type SearchEntry } from "@/lib/search";
import { CloseIcon, SearchIcon } from "./icons";

const SUGGESTED = ["page-products", "product-shearing-blades", "product-slitting-cutters", "page-contact"];

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();

  const results: SearchEntry[] = useMemo(
    () => (q.trim() ? search(q) : SUGGESTED.map((id) => searchIndex.find((e) => e.id === id)).filter((e): e is SearchEntry => !!e)),
    [q],
  );

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      requestAnimationFrame(() => inputRef.current?.focus());
    } else if (!open && d.open) d.close();
  }, [open]);

  const go = useCallback(
    (e: SearchEntry | undefined) => {
      if (!e) return;
      onClose();
      setQ("");
      router.push(e.href);
    },
    [onClose, router],
  );

  function onKeyDown(ev: React.KeyboardEvent<HTMLInputElement>) {
    if (ev.key === "Escape") {
      // type="search" would otherwise swallow the first Escape to clear its text.
      ev.preventDefault();
      onClose();
    } else if (ev.key === "ArrowDown") {
      ev.preventDefault();
      setActive((a) => Math.min(results.length - 1, a + 1));
    } else if (ev.key === "ArrowUp") {
      ev.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (ev.key === "Enter") {
      ev.preventDefault();
      if (results[active]) go(results[active]);
      else if (q.trim()) {
        onClose();
        router.push(`/products?q=${encodeURIComponent(q.trim())}`);
      }
    }
  }

  return (
    <dialog
      ref={ref}
      className="search-dialog"
      aria-label="Search the site"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="search-dialog__bar">
        <SearchIcon />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={results[active] ? `${listId}-${results[active].id}` : undefined}
          placeholder="Search blades, cutters, punches, stamps…"
          value={q}
          maxLength={80}
          onChange={(e) => {
            setQ(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          aria-label="Search"
        />
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close search">
          <CloseIcon />
        </button>
      </div>
      {results.length ? (
        <ul className="search-results" id={listId} role="listbox" aria-label={q ? "Results" : "Suggestions"}>
          {results.map((r, i) => (
            <li key={r.id}>
              <a
                id={`${listId}-${r.id}`}
                href={r.href}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={(e) => {
                  e.preventDefault();
                  go(r);
                }}
              >
                <span className="t">{r.title}</span>
                <span className="d">{r.description}</span>
                <span className="k label">{r.kind}</span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="search-empty" role="status">
          Nothing matches “{q}”. Press Enter to search the catalogue, or try a product such as “punch”.
        </p>
      )}
      <div className="search-dialog__foot" aria-hidden="true">
        <span>↑ ↓ to move</span>
        <span>Enter to open</span>
        <span>Esc to close</span>
      </div>
    </dialog>
  );
}

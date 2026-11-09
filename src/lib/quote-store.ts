"use client";

import { useSyncExternalStore } from "react";
import { productBySlug } from "@/content/products";
import { MAX_ITEMS } from "./enquiry-schema";

export type QuoteItem = { slug: string; quantity: number };

const KEY = "skk.quote-list.v1";
const EMPTY: QuoteItem[] = [];
const listeners = new Set<() => void>();
let snapshot: QuoteItem[] | null = null;

function sanitize(raw: unknown): QuoteItem[] {
  if (!Array.isArray(raw)) return EMPTY;
  const seen = new Set<string>();
  const out: QuoteItem[] = [];
  for (const r of raw) {
    if (!r || typeof r !== "object") continue;
    const slug = (r as { slug?: unknown }).slug;
    const q = Number((r as { quantity?: unknown }).quantity);
    if (typeof slug !== "string" || !productBySlug.has(slug) || seen.has(slug)) continue;
    seen.add(slug);
    out.push({ slug, quantity: Number.isInteger(q) && q >= 1 && q <= 10_000 ? q : 1 });
    if (out.length >= MAX_ITEMS) break;
  }
  return out;
}

function read(): QuoteItem[] {
  try {
    const v = window.localStorage.getItem(KEY);
    return v ? sanitize(JSON.parse(v)) : EMPTY;
  } catch {
    // Storage blocked or holding corrupt JSON: start from an empty list rather than break the page.
    return EMPTY;
  }
}

function write(items: QuoteItem[]) {
  snapshot = items;
  try {
    if (items.length) window.localStorage.setItem(KEY, JSON.stringify(items));
    else window.localStorage.removeItem(KEY);
  } catch {
    // Storage blocked (private mode, quota): the list still works for this page view.
  }
  listeners.forEach((l) => l());
}

function onStorage(e: StorageEvent) {
  if (e.key !== KEY) return;
  snapshot = read();
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = () => (snapshot ??= read());
const getServerSnapshot = () => EMPTY;

export function useQuoteList(): QuoteItem[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export const quoteList = {
  add(slug: string, quantity = 1) {
    const items = getSnapshot();
    if (!productBySlug.has(slug) || items.some((i) => i.slug === slug) || items.length >= MAX_ITEMS) return false;
    write([...items, { slug, quantity }]);
    return true;
  },
  remove(slug: string) {
    write(getSnapshot().filter((i) => i.slug !== slug));
  },
  setQuantity(slug: string, quantity: number) {
    const q = Math.min(10_000, Math.max(1, Math.round(quantity) || 1));
    write(getSnapshot().map((i) => (i.slug === slug ? { ...i, quantity: q } : i)));
  },
  clear() {
    write(EMPTY);
  },
  has(slug: string) {
    return getSnapshot().some((i) => i.slug === slug);
  },
};

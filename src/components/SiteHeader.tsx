"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQuoteList } from "@/lib/quote-store";
import { company } from "@/content/company";
import { SearchDialog } from "./SearchDialog";
import { BrandMark, CloseIcon, ListIcon, MenuIcon, SearchIcon } from "./icons";

export const NAV = [
  { href: "/products", label: "Products" },
  { href: "/manufacturing", label: "Manufacturing & Quality" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function isCurrent(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const items = useQuoteList();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  // Close the mobile menu on navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? "hidden" : "";
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = !!t && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName));
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const count = items.length;

  return (
    <header className="site-header">
      <div className="wrap site-header__bar">
        <Link href="/" className="brand">
          <BrandMark />
          <span className="brand__text">
            <span className="brand__name">{company.name}</span>
            <span className="brand__trade">{company.trade}</span>
          </span>
        </Link>

        <nav className="nav nav--desktop" aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={isCurrent(pathname, n.href) ? "page" : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <button type="button" className="icon-btn search-trigger" onClick={() => setSearchOpen(true)} aria-label="Search (press /)">
            <SearchIcon />
            <span className="search-trigger__text">Search</span>
            <span className="kbd" aria-hidden="true">
              /
            </span>
          </button>
          <Link
            href="/contact?type=quote#quote-list"
            className="icon-btn"
            aria-label={count ? `Quote list, ${count} item${count === 1 ? "" : "s"}` : "Quote list, empty"}
          >
            <ListIcon />
            {count > 0 && <span className="count-badge">{count}</span>}
          </Link>
          <Link href="/contact?type=quote" className="btn btn--accent btn--sm header-quote">
            Request a quote
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="icon-btn menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-nav" className="mobile-nav" aria-label="Main">
          <ul>
            <li>
              <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>
                Home
              </Link>
            </li>
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} aria-current={isCurrent(pathname, n.href) ? "page" : undefined}>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/contact?type=quote" className="btn btn--accent">
            Request a quote
          </Link>
        </nav>
      )}

      <SearchDialog open={searchOpen} onClose={closeSearch} />
    </header>
  );
}

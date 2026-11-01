"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Photo } from "@/content/images";
import { ArrowRight } from "./icons";

export type Slide = {
  photo: Photo;
  kicker: string;
  title: string;
  body: string;
  href: string;
  cta: string;
};

const INTERVAL = 7000;

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/**
 * Full-bleed photo banner carousel following the WAI-ARIA carousel pattern:
 * auto-rotation can be paused (button, hover, keyboard focus), never runs with reduced motion,
 * and slides are announced as "n of total".
 */
export function HeroSlider({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => true,
  );
  const touchX = useRef<number | null>(null);
  const n = slides.length;
  const go = useCallback((i: number) => setIndex(((i % n) + n) % n), [n]);

  const playing = !userPaused && !reduced && !hovered && !focused;

  useEffect(() => {
    if (!playing) return;
    const t = window.setTimeout(() => go(index + 1), INTERVAL);
    return () => window.clearTimeout(t);
  }, [playing, index, go]);

  return (
    <section
      className="hero-slider"
      aria-roledescription="carousel"
      aria-label="Highlights"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
      onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        const start = touchX.current;
        const end = e.changedTouches[0]?.clientX;
        touchX.current = null;
        if (start == null || end == null || Math.abs(end - start) < 50) return;
        go(index + (end < start ? 1 : -1));
      }}
    >
      <div className="hero-slider__track" aria-live={playing ? "off" : "polite"}>
        {slides.map((s, i) => {
          const active = i === index;
          const Heading = i === 0 ? "h1" : "h2";
          return (
            <div
              key={s.title}
              className="hero-slide"
              data-active={active}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${n}`}
              aria-hidden={!active}
              inert={!active}
            >
              <div className="hero-slide__media">
                <Image
                  src={s.photo.src}
                  alt={s.photo.alt}
                  fill
                  sizes="100vw"
                  priority={i === 0}
                  placeholder="blur"
                  quality={72}
                />
              </div>
              <div className="hero-slide__shade" aria-hidden="true" />
              <div className="wrap hero-slide__content">
                <p className="hero-slide__kicker">{s.kicker}</p>
                <Heading className="hero-slide__title">{s.title}</Heading>
                <p className="hero-slide__body">{s.body}</p>
                <div className="btn-row">
                  <Link href={s.href} className="btn btn--accent">
                    {s.cta} <ArrowRight />
                  </Link>
                  <Link href="/contact?type=quote" className="btn btn--light">
                    Request a quote
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="wrap hero-slider__controls">
        <div className="hero-slider__tabs" role="group" aria-label="Choose slide">
          {slides.map((s, i) => (
            <button
              key={s.title}
              type="button"
              className="hero-slider__tab"
              aria-current={i === index ? "true" : undefined}
              onClick={() => go(i)}
            >
              <span className="hero-slider__tab-no">
                <span className="visually-hidden">Slide </span>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="hero-slider__tab-label">{s.kicker}</span>
              <span className="hero-slider__bar" aria-hidden="true">
                <span
                  key={`${index}-${playing}`}
                  className="hero-slider__fill"
                  data-run={i === index && playing}
                  data-done={i < index || (i === index && !playing)}
                  style={{ animationDuration: `${INTERVAL}ms` }}
                />
              </span>
            </button>
          ))}
        </div>
        <div className="hero-slider__buttons">
          <button type="button" className="round-btn" aria-label="Previous slide" onClick={() => go(index - 1)}>
            <ArrowRight style={{ transform: "rotate(180deg)" }} />
          </button>
          <button type="button" className="round-btn" aria-label="Next slide" onClick={() => go(index + 1)}>
            <ArrowRight />
          </button>
          {!reduced && (
            <button
              type="button"
              className="round-btn"
              aria-label={userPaused ? "Start automatic slide show" : "Stop automatic slide show"}
              onClick={() => setUserPaused((p) => !p)}
            >
              {userPaused ? (
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                  <path d="M3 1.5v11l9-5.5z" fill="currentColor" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                  <path d="M3 1.5h3v11H3zM8 1.5h3v11H8z" fill="currentColor" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

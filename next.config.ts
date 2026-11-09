import type { NextConfig } from "next";
import path from "node:path";

// Headers that do not depend on a per-request nonce. The Content-Security-Policy is set in
// src/proxy.ts because it carries a fresh nonce on every document request.
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

const onVercel = process.env.VERCEL === "1";

const nextConfig: NextConfig = {
  env: {
    // Vercel functions accept at most 4.5 MB per request; leave room for the form fields.
    NEXT_PUBLIC_MAX_UPLOAD_MB: process.env.MAX_UPLOAD_MB ?? (onVercel ? "4" : "20"),
  },
  poweredByHeader: false,
  // The Docker image sets NEXT_OUTPUT=standalone for a minimal server bundle; `next start` uses the default.
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  turbopack: { root: path.join(__dirname) },
  reactStrictMode: true,
  // Enquiry records and drawings must never be bundled into a build.
  outputFileTracingExcludes: { "*": ["data/**", "tests/**", "docs/**"] },
  // Every `quality` passed to next/image must be listed here; unlisted values are snapped to the nearest one with a warning.
  images: { formats: ["image/avif", "image/webp"], qualities: [60, 70, 72, 75] },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
  },
};

export default nextConfig;

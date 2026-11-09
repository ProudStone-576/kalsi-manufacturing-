import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { headers } from "next/headers";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DrawingDefs } from "@/components/icons";
import { JsonLd } from "@/components/JsonLd";
import { company } from "@/content/company";
import { siteOrigin } from "@/lib/config";
import "./globals.css";
import "./photo.css";

const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });
const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-plex", display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono", display: "swap" });

const description =
  "S.S. Kalsi Industries manufactures precision tools for industrial use: shearing blades, trimming and slitting cutters, steel piercing punches and steel stamps.";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: { default: `${company.name} — Precision industrial tools`, template: `%s · ${company.name}` },
  description,
  applicationName: company.name,
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: company.name, title: `${company.name} — Precision industrial tools`, description },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#101316",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const origin = siteOrigin();
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${archivo.variable} ${plex.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <body>
        {/* Marks that JavaScript is running so no-JS fallbacks (e.g. "Apply filters") can hide. */}
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <DrawingDefs />
        <SiteHeader />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: company.legalName ?? company.name,
            url: origin,
            description,
            ...(company.email ? { email: company.email } : {}),
            ...(company.phone ? { telephone: company.phone } : {}),
            ...(company.foundedYear ? { foundingDate: String(company.foundedYear) } : {}),
          }}
        />
      </body>
    </html>
  );
}

import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/contact/thank-you"] }],
    sitemap: `${siteOrigin()}/sitemap.xml`,
  };
}

import type { MetadataRoute } from "next";
import { products } from "@/content/products";
import { siteOrigin } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteOrigin();
  const pages = ["", "/products", "/industries", "/manufacturing", "/about", "/contact", "/privacy", "/credits"];
  return [
    ...pages.map((p) => ({ url: `${origin}${p}`, changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.8 })),
    ...products.map((p) => ({ url: `${origin}/products/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}

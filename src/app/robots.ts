import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: [
        "/admin/",
        "/api/",
        "/result",
        "/test/play",
        "/test/complete",
        "/pro-test",
        "/pro-test/",
        "/pro-test/play",
        "/pro-test/complete"
      ]
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url
  };
}

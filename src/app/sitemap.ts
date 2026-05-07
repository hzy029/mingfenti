import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site-config";
import { getD1Database } from "@/lib/cloudflare-db";

export const dynamic = "force-dynamic";

type TopicSitemapRow = {
  id: number;
  created_at: string;
};

function toSitemapUrl(path: string, lastModified?: string | Date): MetadataRoute.Sitemap[number] {
  return {
    url: `${siteConfig.url}${path}`,
    lastModified: lastModified ? new Date(lastModified) : new Date(),
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : path === "/test" ? 0.9 : 0.7
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [toSitemapUrl("/"), toSitemapUrl("/test"), toSitemapUrl("/board")];
  const db = await getD1Database();

  if (!db) {
    return urls;
  }

  try {
    const { results } = await db
      .prepare(
        `SELECT id, created_at
        FROM board_topics
        WHERE hidden = 0
        ORDER BY pin_weight DESC, id DESC
        LIMIT 200`
      )
      .all<TopicSitemapRow>();

    for (const topic of results ?? []) {
      urls.push(toSitemapUrl(`/board/${topic.id}`, topic.created_at));
    }
  } catch {
    return urls;
  }

  return urls;
}

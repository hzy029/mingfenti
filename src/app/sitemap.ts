import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site-config";
import { libraryArticles } from "@/data/library-generated";
import { getD1Database } from "@/lib/cloudflare-db";

export const dynamic = "force-dynamic";

type TopicSitemapRow = {
  id: number;
  created_at: string;
};

function toSitemapUrl(
  pathOrFullUrl: string,
  lastModified?: string | Date,
  opts?: { changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"]; priority?: number }
): MetadataRoute.Sitemap[number] {
  const url = pathOrFullUrl.startsWith("http") ? pathOrFullUrl : `${siteConfig.url}${pathOrFullUrl}`;
  const path = pathOrFullUrl.startsWith("http") ? new URL(pathOrFullUrl).pathname : pathOrFullUrl;

  return {
    url,
    lastModified: lastModified ? new Date(lastModified) : new Date(),
    changeFrequency:
      opts?.changeFrequency ?? (path === "/" ? "daily" : path === "/test" ? "weekly" : "weekly"),
    priority: opts?.priority ?? (path === "/" ? 1 : path === "/test" ? 0.9 : 0.7)
  };
}

function appendLibraryUrls(urls: MetadataRoute.Sitemap) {
  urls.push(toSitemapUrl("/ai/library-index.json", undefined, { changeFrequency: "weekly", priority: 0.65 }));

  for (const article of libraryArticles) {
    urls.push(toSitemapUrl(article.url, undefined, { changeFrequency: "monthly", priority: 0.55 }));

    if (article.rawMarkdownUrl.startsWith(siteConfig.url)) {
      urls.push(toSitemapUrl(article.rawMarkdownUrl, undefined, { changeFrequency: "monthly", priority: 0.5 }));
    }
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [toSitemapUrl("/"), toSitemapUrl("/test"), toSitemapUrl("/board")];

  appendLibraryUrls(urls);

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

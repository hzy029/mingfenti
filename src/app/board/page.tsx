import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/data/site-config";
import { ensureBoardReviewSchema } from "@/lib/board-review";
import { previewBoardBody, stripMarkdownForPreview } from "@/lib/board-text";
import { getD1Database } from "@/lib/cloudflare-db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "留言板 - 明清史观讨论与测试结果交流",
  description: "新明粉检测器留言板。浏览公开主题，围绕明清史观、测试结果和历史认知偏差进行讨论。",
  alternates: {
    canonical: "/board"
  },
  openGraph: {
    title: "留言板 - 明清史观讨论与测试结果交流",
    description: "浏览公开主题，围绕明清史观、测试结果和历史认知偏差进行讨论。",
    url: "/board"
  }
};

type TopicListRow = {
  id: number;
  title: string;
  pin_weight: number;
  created_at: string;
  reply_count: number;
  hot_preview_body: string | null;
};

export default async function BoardIndexPage() {
  const db = await getD1Database();
  let topics: TopicListRow[] = [];
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "首页",
        item: `${siteConfig.url}/`
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "留言板",
        item: `${siteConfig.url}/board`
      }
    ]
  };

  if (db) {
    try {
      await ensureBoardReviewSchema(db);
      const { results } = await db
        .prepare(
          `SELECT
            t.id,
            t.title,
            t.pin_weight,
            t.created_at,
            (
              SELECT COUNT(*)
              FROM board_posts p
              WHERE p.topic_id = t.id AND p.hidden = 0 AND p.review_status = 'published'
            ) AS reply_count,
            (
              SELECT p.body
              FROM board_posts p
              WHERE p.topic_id = t.id AND p.hidden = 0 AND p.review_status = 'published'
              ORDER BY p.published_at DESC, p.id DESC
              LIMIT 1
            ) AS hot_preview_body
          FROM board_topics t
          WHERE t.hidden = 0
          ORDER BY t.pin_weight DESC, reply_count DESC, t.id DESC
          LIMIT 100`
        )
        .all<TopicListRow>();

      topics = results ?? [];
    } catch {
      topics = [];
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <SiteHeader />

      <div className="mx-auto max-w-3xl px-5 py-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black text-[#4937db]">讨论区</p>
            <h1 className="mt-2 text-4xl font-black text-slate-900">留言板</h1>
            <p className="mt-3 max-w-xl text-base font-bold leading-7 text-slate-600">
              结构类似知乎：仅管理员发布主题；用户在主题下写回答，回答下可发评论。理性讨论，禁止人身攻击与违法内容。
            </p>
          </div>
          <Link className="text-sm font-black text-slate-500 hover:text-[#4937db]" href="/">
            返回首页
          </Link>
        </header>

        {!db ? (
          <p className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-6 font-bold text-amber-900">
            本地未绑定 D1 时无法加载留言。部署到 Cloudflare 并执行 schema 迁移后即可使用。
          </p>
        ) : null}

        <section className="mt-10">
          <h2 className="text-2xl font-black text-slate-900">全部主题</h2>
          {topics.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 font-bold text-slate-500">
              暂无主题。请管理员在{" "}
              <Link className="text-[#4937db] hover:underline" href="/admin/board">
                /admin/board
              </Link>{" "}
              发布主题。
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {topics.map((topic) => {
                const snippet =
                  topic.hot_preview_body && topic.hot_preview_body.trim().length > 0
                    ? previewBoardBody(stripMarkdownForPreview(topic.hot_preview_body), 120)
                    : null;

                return (
                  <li key={topic.id}>
                    <Link
                      className="block rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:border-[#4937db]/30"
                      href={`/board/${topic.id}`}
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <span className="text-lg font-black text-slate-900">{topic.title}</span>
                        <span className="text-sm font-bold text-slate-400">
                          {topic.reply_count} 个回答
                          {topic.pin_weight > 0 ? (
                            <span className="ml-2 rounded-full bg-[#fef08a] px-2 py-0.5 text-xs font-black text-[#854d0e]">
                              权值 {topic.pin_weight}
                            </span>
                          ) : null}
                        </span>
                      </div>
                      {snippet ? (
                        <p className="mt-2 line-clamp-1 text-sm font-bold leading-6 text-slate-500">{snippet}</p>
                      ) : (
                        <p className="mt-2 text-xs font-bold text-slate-400">暂无已发布回答</p>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <p className="mt-12 text-center text-xs font-bold text-slate-400">
          站务管理入口：
          <Link className="ml-1 text-[#4937db] hover:underline" href="/admin/board">
            /admin/board
          </Link>
        </p>
      </div>
    </main>
  );
}

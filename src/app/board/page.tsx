import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { getD1Database } from "@/lib/cloudflare-db";

export const dynamic = "force-dynamic";

type TopicListRow = {
  id: number;
  title: string;
  pin_weight: number;
  created_at: string;
  reply_count: number;
};

export default async function BoardIndexPage() {
  const db = await getD1Database();
  let topics: TopicListRow[] = [];

  if (db) {
    try {
      const { results } = await db
        .prepare(
          `SELECT
            t.id,
            t.title,
            t.pin_weight,
            t.created_at,
            COUNT(p.id) AS reply_count
          FROM board_topics t
          LEFT JOIN board_posts p ON p.topic_id = t.id AND p.hidden = 0
          WHERE t.hidden = 0
          GROUP BY t.id
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
              {topics.map((topic) => (
                <li key={topic.id}>
                  <Link
                    className="flex flex-wrap items-baseline justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:border-[#4937db]/30"
                    href={`/board/${topic.id}`}
                  >
                    <span className="text-lg font-black text-slate-900">{topic.title}</span>
                    <span className="text-sm font-bold text-slate-400">
                      {topic.reply_count} 个回答
                      {topic.pin_weight > 0 ? (
                        <span className="ml-2 rounded-full bg-[#fef08a] px-2 py-0.5 text-xs font-black text-[#854d0e]">权值 {topic.pin_weight}</span>
                      ) : null}
                    </span>
                  </Link>
                </li>
              ))}
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

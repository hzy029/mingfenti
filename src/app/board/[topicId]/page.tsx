import Link from "next/link";
import { notFound } from "next/navigation";
import { BoardAnswerForm } from "@/components/board-answer-form";
import { BoardMarkdownBody } from "@/components/board-markdown-body";
import { BoardCommentThread, type BoardCommentPublicRow } from "@/components/board-comment-thread";
import { BoardPostLikeButton } from "@/components/board-post-like-button";
import { SiteHeader } from "@/components/site-header";
import { getD1Database } from "@/lib/cloudflare-db";

export const dynamic = "force-dynamic";

type TopicRow = {
  id: number;
  title: string;
  pin_weight: number;
  created_at: string;
};

type PostRow = {
  id: number;
  author_display: string | null;
  body: string;
  heat_score: number;
  created_at: string;
};

type CommentDbRow = {
  id: number;
  answer_id: number;
  author_display: string | null;
  body: string;
  heat_score: number;
  created_at: string;
};

type BoardTopicPageProps = {
  params: Promise<{ topicId: string }>;
};

function groupCommentsByAnswer(rows: CommentDbRow[]): Map<number, BoardCommentPublicRow[]> {
  const map = new Map<number, BoardCommentPublicRow[]>();

  for (const row of rows) {
    const list = map.get(row.answer_id) ?? [];
    list.push({
      id: row.id,
      author_display: row.author_display,
      body: row.body,
      heat_score: row.heat_score,
      created_at: row.created_at
    });
    map.set(row.answer_id, list);
  }

  return map;
}

export default async function BoardTopicPage({ params }: BoardTopicPageProps) {
  const { topicId: rawTopicId } = await params;
  const topicId = Number.parseInt(rawTopicId, 10);

  if (!Number.isFinite(topicId)) {
    notFound();
  }

  const db = await getD1Database();

  if (!db) {
    return (
      <main className="min-h-screen bg-[#f8fafc] text-slate-900">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-5 py-16">
          <p className="text-lg font-bold text-slate-600">留言板暂不可用（数据库未配置）。</p>
          <Link className="mt-6 inline-block font-black text-[#4937db]" href="/">
            返回首页
          </Link>
        </div>
      </main>
    );
  }

  const topicResult = await db
    .prepare(`SELECT id, title, pin_weight, created_at FROM board_topics WHERE id = ? AND hidden = 0`)
    .bind(topicId)
    .all<TopicRow>();

  const topic = topicResult.results?.[0];

  if (!topic) {
    notFound();
  }

  const metaResult = await db
    .prepare(`SELECT description FROM board_topic_meta WHERE topic_id = ?`)
    .bind(topicId)
    .all<{ description: string | null }>();

  const topicDescription = metaResult.results?.[0]?.description?.trim() ?? "";

  const postsResult = await db
    .prepare(
      `SELECT id, author_display, body, heat_score, created_at
      FROM board_posts
      WHERE topic_id = ? AND hidden = 0
      ORDER BY id ASC`
    )
    .bind(topicId)
    .all<PostRow>();

  const posts = postsResult.results ?? [];

  const answerIds = posts.map((post) => post.id);
  let commentsByAnswer = new Map<number, BoardCommentPublicRow[]>();

  if (answerIds.length > 0) {
    const placeholders = answerIds.map(() => "?").join(", ");
    const commentsResult = await db
      .prepare(
        `SELECT c.id, c.answer_id, c.author_display, c.body, c.heat_score, c.created_at
        FROM board_comments c
        WHERE c.answer_id IN (${placeholders}) AND c.hidden = 0
        ORDER BY c.answer_id ASC, c.id ASC`
      )
      .bind(...answerIds)
      .all<CommentDbRow>();

    commentsByAnswer = groupCommentsByAnswer(commentsResult.results ?? []);
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      <SiteHeader />

      <div className="mx-auto max-w-3xl px-5 py-10">
        <nav className="text-sm font-bold text-slate-500">
          <Link className="text-[#4937db] hover:underline" href="/board">
            留言板
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-800">主题</span>
        </nav>

        <header className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wide text-[#4937db]">主题 · 类似知乎提问</p>
          <h1 className="mt-3 text-3xl font-black leading-tight text-slate-900 md:text-4xl">{topic.title}</h1>
          {topicDescription ? (
            <div className="mt-5 border-l-4 border-slate-200 pl-4">
              <BoardMarkdownBody markdown={topicDescription} />
            </div>
          ) : null}
          <p className="mt-4 text-sm font-bold text-slate-400">创建于 {topic.created_at}</p>
        </header>

        <section className="mt-8 space-y-8">
          {posts.map((post) => (
            <article key={post.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm font-black text-slate-500">
                  {post.author_display ? (
                    <span className="text-slate-800">{post.author_display}</span>
                  ) : (
                    <span>匿名</span>
                  )}
                  <span className="ml-2 text-slate-400">{post.created_at}</span>
                </div>
                <BoardPostLikeButton initialHeat={post.heat_score} postId={post.id} />
              </div>
              <BoardMarkdownBody className="mt-4" markdown={post.body} />
              <BoardCommentThread answerId={post.id} comments={commentsByAnswer.get(post.id) ?? []} />
            </article>
          ))}
        </section>

        {posts.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white/80 p-4 text-center text-sm font-bold text-slate-500">
            还没有回答，欢迎在下方写第一条回答。
          </p>
        ) : null}

        <BoardAnswerForm topicId={topic.id} />

        <footer className="mt-12 text-center">
          <Link className="text-sm font-black text-[#4937db] hover:underline" href="/board">
            返回留言板列表
          </Link>
        </footer>
      </div>
    </main>
  );
}

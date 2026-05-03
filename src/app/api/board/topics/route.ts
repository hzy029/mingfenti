import { getD1Database } from "@/lib/cloudflare-db";
import { ensureBoardReviewSchema } from "@/lib/board-review";

type TopicListRow = {
  id: number;
  title: string;
  pin_weight: number;
  created_at: string;
  reply_count: number;
};

export async function GET() {
  const db = await getD1Database();

  if (!db) {
    return Response.json({ ok: true, topics: [] as TopicListRow[] });
  }

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
          ) AS reply_count
        FROM board_topics t
        WHERE t.hidden = 0
        ORDER BY t.pin_weight DESC, reply_count DESC, t.id DESC
        LIMIT 100`
      )
      .all<TopicListRow>();

    return Response.json({ ok: true, topics: results ?? [] });
  } catch {
    return Response.json({ ok: false, reason: "query-failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  void request;

  return Response.json(
    { ok: false, reason: "admin-only", message: "主题仅可由管理员在 /admin/board 发布。" },
    { status: 403 }
  );
}

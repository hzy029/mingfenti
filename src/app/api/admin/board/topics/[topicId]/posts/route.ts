import {
  adminBoardDisabledResponse,
  adminBoardUnauthorizedResponse,
  isAdminBoardAuthorized
} from "@/lib/board-admin-auth";
import { getD1Database } from "@/lib/cloudflare-db";

type RouteParams = {
  params: Promise<{ topicId: string }>;
};

type AdminPostRow = {
  id: number;
  author_display: string | null;
  body: string;
  heat_score: number;
  hidden: number;
  created_at: string;
};

export async function GET(request: Request, context: RouteParams) {
  if (!process.env.ADMIN_BOARD_SECRET) {
    return adminBoardDisabledResponse();
  }

  if (!isAdminBoardAuthorized(request)) {
    return adminBoardUnauthorizedResponse();
  }

  const { topicId: rawTopicId } = await context.params;
  const topicId = Number.parseInt(rawTopicId, 10);

  if (!Number.isFinite(topicId)) {
    return Response.json({ ok: false, reason: "invalid-topic-id" }, { status: 400 });
  }

  const db = await getD1Database();

  if (!db) {
    return Response.json({ ok: false, reason: "database-not-configured" }, { status: 503 });
  }

  try {
    const { results } = await db
      .prepare(
        `SELECT id, author_display, body, heat_score, hidden, created_at
        FROM board_posts
        WHERE topic_id = ?
        ORDER BY id DESC
        LIMIT 500`
      )
      .bind(topicId)
      .all<AdminPostRow>();

    return Response.json({ ok: true, posts: results ?? [] });
  } catch {
    return Response.json({ ok: false, reason: "query-failed" }, { status: 500 });
  }
}

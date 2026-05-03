import {
  adminBoardDisabledResponse,
  adminBoardUnauthorizedResponse,
  isAdminBoardAuthorized
} from "@/lib/board-admin-auth";
import { getD1Database } from "@/lib/cloudflare-db";

type RouteParams = {
  params: Promise<{ postId: string }>;
};

type AdminCommentRow = {
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

  const { postId: rawPostId } = await context.params;
  const answerId = Number.parseInt(rawPostId, 10);

  if (!Number.isFinite(answerId)) {
    return Response.json({ ok: false, reason: "invalid-answer-id" }, { status: 400 });
  }

  const db = await getD1Database();

  if (!db) {
    return Response.json({ ok: false, reason: "database-not-configured" }, { status: 503 });
  }

  try {
    const { results } = await db
      .prepare(
        `SELECT id, author_display, body, heat_score, hidden, created_at
        FROM board_comments
        WHERE answer_id = ?
        ORDER BY id DESC
        LIMIT 500`
      )
      .bind(answerId)
      .all<AdminCommentRow>();

    return Response.json({ ok: true, comments: results ?? [] });
  } catch {
    return Response.json({ ok: false, reason: "query-failed" }, { status: 500 });
  }
}

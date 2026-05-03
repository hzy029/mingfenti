import {
  adminBoardDisabledResponse,
  adminBoardUnauthorizedResponse,
  isAdminBoardAuthorized
} from "@/lib/board-admin-auth";
import { ensureBoardReviewSchema } from "@/lib/board-review";
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
  review_status: string;
  published_at: string | null;
  reviewed_at: string | null;
  review_provider: string | null;
  review_model: string | null;
  review_verdict: string | null;
  review_reason: string | null;
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
    await ensureBoardReviewSchema(db);
    const { results } = await db
      .prepare(
        `SELECT
          id,
          author_display,
          body,
          heat_score,
          hidden,
          review_status,
          published_at,
          reviewed_at,
          review_provider,
          review_model,
          review_verdict,
          review_reason,
          created_at
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

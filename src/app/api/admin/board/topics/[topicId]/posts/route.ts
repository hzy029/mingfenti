import {
  adminBoardDisabledResponse,
  adminBoardUnauthorizedResponse,
  isAdminBoardAuthorized
} from "@/lib/board-admin-auth";
import { ensureBoardReviewSchema } from "@/lib/board-review";
import { clampBoardAuthor, clampBoardBody } from "@/lib/board-text";
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

type AdminCreatePostBody = {
  body?: string;
  authorDisplay?: string;
};

export async function POST(request: Request, context: RouteParams) {
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

  let payload: AdminCreatePostBody;

  try {
    payload = (await request.json()) as AdminCreatePostBody;
  } catch {
    return Response.json({ ok: false, reason: "invalid-json" }, { status: 400 });
  }

  const body = clampBoardBody(payload.body ?? "");
  const authorDisplay = clampBoardAuthor(payload.authorDisplay);

  if (!body) {
    return Response.json({ ok: false, reason: "body-required" }, { status: 400 });
  }

  const db = await getD1Database();

  if (!db) {
    return Response.json({ ok: false, reason: "database-not-configured" }, { status: 503 });
  }

  try {
    await ensureBoardReviewSchema(db);

    const topicRow = await db
      .prepare(`SELECT id FROM board_topics WHERE id = ?`)
      .bind(topicId)
      .all<{ id: number }>();

    if (!topicRow.results?.[0]) {
      return Response.json({ ok: false, reason: "topic-not-found" }, { status: 404 });
    }

    const createdAt = new Date().toISOString();

    const insert = await db
      .prepare(
        `INSERT INTO board_posts (
          topic_id,
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
        )
        VALUES (?, ?, ?, 1, 0, 'published', ?, ?, 'admin', NULL, 'approve', ?, ?)
        RETURNING id`
      )
      .bind(topicId, authorDisplay ?? null, body, createdAt, createdAt, "管理员发布", createdAt)
      .all<{ id: number }>();

    let postId = insert.results?.[0]?.id;

    if (typeof postId !== "number") {
      const fallback = await db.prepare(`SELECT last_insert_rowid() AS id`).all<{ id: number }>();
      postId = Number(fallback.results?.[0]?.id);
    }

    if (!Number.isFinite(postId)) {
      return Response.json({ ok: false, reason: "post-create-failed" }, { status: 500 });
    }

    return Response.json({ ok: true, postId });
  } catch {
    return Response.json({ ok: false, reason: "database-write-failed" }, { status: 500 });
  }
}

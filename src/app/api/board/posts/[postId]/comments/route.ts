import { getD1Database } from "@/lib/cloudflare-db";
import { clampBoardAuthor, clampBoardCommentBody } from "@/lib/board-text";

type RouteParams = {
  params: Promise<{ postId: string }>;
};

type CreateCommentBody = {
  body?: string;
  authorDisplay?: string;
};

export async function POST(request: Request, context: RouteParams) {
  const { postId: rawPostId } = await context.params;
  const answerId = Number.parseInt(rawPostId, 10);

  if (!Number.isFinite(answerId)) {
    return Response.json({ ok: false, reason: "invalid-answer-id" }, { status: 400 });
  }

  let payload: CreateCommentBody;

  try {
    payload = (await request.json()) as CreateCommentBody;
  } catch {
    return Response.json({ ok: false, reason: "invalid-json" }, { status: 400 });
  }

  const body = clampBoardCommentBody(payload.body ?? "");
  const authorDisplay = clampBoardAuthor(payload.authorDisplay);

  if (!body) {
    return Response.json({ ok: false, reason: "body-required" }, { status: 400 });
  }

  const db = await getD1Database();

  if (!db) {
    return Response.json({ ok: false, reason: "database-not-configured" }, { status: 503 });
  }

  const answerRow = await db
    .prepare(
      `SELECT p.id FROM board_posts p
      INNER JOIN board_topics t ON t.id = p.topic_id
      WHERE p.id = ? AND p.hidden = 0 AND t.hidden = 0`
    )
    .bind(answerId)
    .all<{ id: number }>();

  if (!answerRow.results?.[0]) {
    return Response.json({ ok: false, reason: "answer-not-found" }, { status: 404 });
  }

  const createdAt = new Date().toISOString();

  try {
    const insert = await db
      .prepare(
        `INSERT INTO board_comments (answer_id, author_display, body, heat_score, hidden, created_at)
        VALUES (?, ?, ?, 1, 0, ?)
        RETURNING id`
      )
      .bind(answerId, authorDisplay ?? null, body, createdAt)
      .all<{ id: number }>();

    let commentId = insert.results?.[0]?.id;

    if (typeof commentId !== "number") {
      const fallback = await db.prepare(`SELECT last_insert_rowid() AS id`).all<{ id: number }>();
      commentId = Number(fallback.results?.[0]?.id);
    }

    if (!Number.isFinite(commentId)) {
      return Response.json({ ok: false, reason: "comment-create-failed" }, { status: 500 });
    }

    return Response.json({ ok: true, commentId });
  } catch {
    return Response.json({ ok: false, reason: "database-write-failed" }, { status: 500 });
  }
}

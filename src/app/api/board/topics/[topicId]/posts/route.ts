import { getD1Database } from "@/lib/cloudflare-db";
import { clampBoardAuthor, clampBoardBody } from "@/lib/board-text";

type RouteParams = {
  params: Promise<{ topicId: string }>;
};

type CreatePostBody = {
  body?: string;
  authorDisplay?: string;
};

export async function POST(request: Request, context: RouteParams) {
  const { topicId: rawTopicId } = await context.params;
  const topicId = Number.parseInt(rawTopicId, 10);

  if (!Number.isFinite(topicId)) {
    return Response.json({ ok: false, reason: "invalid-topic-id" }, { status: 400 });
  }

  let payload: CreatePostBody;

  try {
    payload = (await request.json()) as CreatePostBody;
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

  const topicRow = await db
    .prepare(`SELECT id FROM board_topics WHERE id = ? AND hidden = 0`)
    .bind(topicId)
    .all<{ id: number }>();

  if (!topicRow.results?.[0]) {
    return Response.json({ ok: false, reason: "topic-not-found" }, { status: 404 });
  }

  const createdAt = new Date().toISOString();

  try {
    const insert = await db
      .prepare(
        `INSERT INTO board_posts (topic_id, author_display, body, heat_score, hidden, created_at)
        VALUES (?, ?, ?, 1, 0, ?)
        RETURNING id`
      )
      .bind(topicId, authorDisplay ?? null, body, createdAt)
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

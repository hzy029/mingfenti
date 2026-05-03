import { isAllowedBoardPostResultId } from "@/lib/board-post-eligibility";
import {
  BOARD_DAILY_POST_LIMIT,
  countDailyActions,
  ensureBoardDailyActionsSchema,
  getClientIp,
  getUtcDayString,
  hashIpForRateLimit,
  recordDailyAction
} from "@/lib/board-rate-limit";
import { getD1Database } from "@/lib/cloudflare-db";
import { ensureBoardReviewSchema, reviewBoardContent, serializeReviewLabels } from "@/lib/board-review";
import { clampBoardAuthor, clampBoardCommentBody } from "@/lib/board-text";

type RouteParams = {
  params: Promise<{ postId: string }>;
};

type CreateCommentBody = {
  body?: string;
  authorDisplay?: string;
  resultId?: string;
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

  if (!isAllowedBoardPostResultId(payload.resultId)) {
    return Response.json(
      { ok: false, reason: "board-post-not-eligible", message: "发表评论需先完成普通版测试并取得发帖资格" },
      { status: 403 }
    );
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

  await ensureBoardReviewSchema(db);
  await ensureBoardDailyActionsSchema(db);

  const ip = getClientIp(request);
  const ipHash = await hashIpForRateLimit(ip);
  const dayUtc = getUtcDayString();
  const used = await countDailyActions(db, dayUtc, ipHash);

  if (used >= BOARD_DAILY_POST_LIMIT) {
    return Response.json(
      {
        ok: false,
        reason: "daily-limit-exceeded",
        message: `同一网络环境下每日最多发帖 ${BOARD_DAILY_POST_LIMIT} 次（回答与评论合计），请明日再试`
      },
      { status: 429 }
    );
  }

  const answerRow = await db
    .prepare(
      `SELECT p.id FROM board_posts p
      INNER JOIN board_topics t ON t.id = p.topic_id
      WHERE p.id = ? AND p.hidden = 0 AND p.review_status = 'published' AND t.hidden = 0`
    )
    .bind(answerId)
    .all<{ id: number }>();

  if (!answerRow.results?.[0]) {
    return Response.json({ ok: false, reason: "answer-not-found" }, { status: 404 });
  }

  const createdAt = new Date().toISOString();
  const review = await reviewBoardContent({ kind: "comment", body, authorDisplay: authorDisplay ?? null });
  const publishedAt = review.status === "published" ? createdAt : null;

  try {
    const insert = await db
      .prepare(
        `INSERT INTO board_comments (
          answer_id,
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
        VALUES (?, ?, ?, 1, 0, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING id`
      )
      .bind(
        answerId,
        authorDisplay ?? null,
        body,
        review.status,
        publishedAt,
        createdAt,
        review.provider,
        review.model,
        review.verdict,
        `${review.reason}${review.labels.length ? ` [${serializeReviewLabels(review.labels)}]` : ""}`,
        createdAt
      )
      .all<{ id: number }>();

    let commentId = insert.results?.[0]?.id;

    if (typeof commentId !== "number") {
      const fallback = await db.prepare(`SELECT last_insert_rowid() AS id`).all<{ id: number }>();
      commentId = Number(fallback.results?.[0]?.id);
    }

    if (!Number.isFinite(commentId)) {
      return Response.json({ ok: false, reason: "comment-create-failed" }, { status: 500 });
    }

    await recordDailyAction(db, dayUtc, ipHash, createdAt);

    return Response.json({ ok: true, commentId, reviewStatus: review.status, reviewVerdict: review.verdict });
  } catch {
    return Response.json({ ok: false, reason: "database-write-failed" }, { status: 500 });
  }
}

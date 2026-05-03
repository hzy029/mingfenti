import {
  BOARD_DAILY_LIKE_LIMIT,
  countDailyBoardLikes,
  ensureBoardLikesSchema,
  hasBoardLike,
  tryInsertBoardLike
} from "@/lib/board-likes";
import { ensureBoardReviewSchema } from "@/lib/board-review";
import { getClientIp, getUtcDayString, hashIpForRateLimit } from "@/lib/board-rate-limit";
import { getD1Database } from "@/lib/cloudflare-db";

type RouteParams = {
  params: Promise<{ commentId: string }>;
};

export async function POST(request: Request, context: RouteParams) {
  const { commentId: rawId } = await context.params;
  const commentId = Number.parseInt(rawId, 10);

  if (!Number.isFinite(commentId)) {
    return Response.json({ ok: false, reason: "invalid-comment-id" }, { status: 400 });
  }

  const db = await getD1Database();

  if (!db) {
    return Response.json({ ok: false, reason: "database-not-configured" }, { status: 503 });
  }

  try {
    await ensureBoardReviewSchema(db);
    await ensureBoardLikesSchema(db);
    const existing = await db
      .prepare(`SELECT id FROM board_comments WHERE id = ? AND hidden = 0 AND review_status = 'published'`)
      .bind(commentId)
      .all<{ id: number }>();

    if (!existing.results?.[0]) {
      return Response.json({ ok: false, reason: "comment-not-found" }, { status: 404 });
    }

    const ipHash = await hashIpForRateLimit(getClientIp(request));
    const createdAt = new Date().toISOString();
    const alreadyLiked = await hasBoardLike(db, "comment", commentId, ipHash);

    if (alreadyLiked) {
      const updated = await db
        .prepare(`SELECT heat_score FROM board_comments WHERE id = ?`)
        .bind(commentId)
        .all<{ heat_score: number }>();

      const heatScore = updated.results?.[0]?.heat_score ?? 0;

      return Response.json({ ok: true, heatScore, alreadyLiked: true });
    }

    const usedLikes = await countDailyBoardLikes(db, getUtcDayString(), ipHash);

    if (usedLikes >= BOARD_DAILY_LIKE_LIMIT) {
      return Response.json(
        {
          ok: false,
          reason: "like-daily-limit",
          message: `同一网络环境下每日最多点赞 ${BOARD_DAILY_LIKE_LIMIT} 次，请明日再试。`
        },
        { status: 429 }
      );
    }

    const inserted = await tryInsertBoardLike(db, "comment", commentId, ipHash, createdAt);

    if (inserted) {
      await db.prepare(`UPDATE board_comments SET heat_score = heat_score + 1 WHERE id = ?`).bind(commentId).run();
    }

    const updated = await db
      .prepare(`SELECT heat_score FROM board_comments WHERE id = ?`)
      .bind(commentId)
      .all<{ heat_score: number }>();

    const heatScore = updated.results?.[0]?.heat_score ?? 0;

    return Response.json({ ok: true, heatScore, alreadyLiked: !inserted });
  } catch {
    return Response.json({ ok: false, reason: "database-write-failed" }, { status: 500 });
  }
}

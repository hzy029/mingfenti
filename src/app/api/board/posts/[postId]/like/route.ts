import {
  ensureBoardLikesSchema,
  tryInsertBoardLike
} from "@/lib/board-likes";
import { ensureBoardReviewSchema } from "@/lib/board-review";
import { getClientIp, hashIpForRateLimit } from "@/lib/board-rate-limit";
import { getD1Database } from "@/lib/cloudflare-db";

type RouteParams = {
  params: Promise<{ postId: string }>;
};

export async function POST(request: Request, context: RouteParams) {
  const { postId: rawPostId } = await context.params;
  const postId = Number.parseInt(rawPostId, 10);

  if (!Number.isFinite(postId)) {
    return Response.json({ ok: false, reason: "invalid-post-id" }, { status: 400 });
  }

  const db = await getD1Database();

  if (!db) {
    return Response.json({ ok: false, reason: "database-not-configured" }, { status: 503 });
  }

  try {
    await ensureBoardReviewSchema(db);
    await ensureBoardLikesSchema(db);
    const existing = await db
      .prepare(`SELECT id FROM board_posts WHERE id = ? AND hidden = 0 AND review_status = 'published'`)
      .bind(postId)
      .all<{ id: number }>();

    if (!existing.results?.[0]) {
      return Response.json({ ok: false, reason: "post-not-found" }, { status: 404 });
    }

    const ipHash = await hashIpForRateLimit(getClientIp(request));
    const createdAt = new Date().toISOString();
    const inserted = await tryInsertBoardLike(db, "post", postId, ipHash, createdAt);

    if (inserted) {
      await db
        .prepare(`UPDATE board_posts SET heat_score = heat_score + 1 WHERE id = ?`)
        .bind(postId)
        .run();
    }

    const updated = await db
      .prepare(`SELECT heat_score FROM board_posts WHERE id = ?`)
      .bind(postId)
      .all<{ heat_score: number }>();

    const heatScore = updated.results?.[0]?.heat_score ?? 0;

    return Response.json({ ok: true, heatScore, alreadyLiked: !inserted });
  } catch {
    return Response.json({ ok: false, reason: "database-write-failed" }, { status: 500 });
  }
}

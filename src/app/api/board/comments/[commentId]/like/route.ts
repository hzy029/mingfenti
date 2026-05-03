import { getD1Database } from "@/lib/cloudflare-db";

type RouteParams = {
  params: Promise<{ commentId: string }>;
};

export async function POST(_request: Request, context: RouteParams) {
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
    const existing = await db
      .prepare(`SELECT id FROM board_comments WHERE id = ? AND hidden = 0`)
      .bind(commentId)
      .all<{ id: number }>();

    if (!existing.results?.[0]) {
      return Response.json({ ok: false, reason: "comment-not-found" }, { status: 404 });
    }

    await db.prepare(`UPDATE board_comments SET heat_score = heat_score + 1 WHERE id = ?`).bind(commentId).run();

    const updated = await db
      .prepare(`SELECT heat_score FROM board_comments WHERE id = ?`)
      .bind(commentId)
      .all<{ heat_score: number }>();

    const heatScore = updated.results?.[0]?.heat_score ?? 0;

    return Response.json({ ok: true, heatScore });
  } catch {
    return Response.json({ ok: false, reason: "database-write-failed" }, { status: 500 });
  }
}

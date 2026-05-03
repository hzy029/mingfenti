import { getD1Database } from "@/lib/cloudflare-db";

type RouteParams = {
  params: Promise<{ postId: string }>;
};

export async function POST(_request: Request, context: RouteParams) {
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
    const existing = await db
      .prepare(`SELECT id FROM board_posts WHERE id = ? AND hidden = 0`)
      .bind(postId)
      .all<{ id: number }>();

    if (!existing.results?.[0]) {
      return Response.json({ ok: false, reason: "post-not-found" }, { status: 404 });
    }

    await db
      .prepare(`UPDATE board_posts SET heat_score = heat_score + 1 WHERE id = ?`)
      .bind(postId)
      .run();

    const updated = await db
      .prepare(`SELECT heat_score FROM board_posts WHERE id = ?`)
      .bind(postId)
      .all<{ heat_score: number }>();

    const heatScore = updated.results?.[0]?.heat_score ?? 0;

    return Response.json({ ok: true, heatScore });
  } catch {
    return Response.json({ ok: false, reason: "database-write-failed" }, { status: 500 });
  }
}

import {
  adminBoardDisabledResponse,
  adminBoardUnauthorizedResponse,
  isAdminBoardAuthorized
} from "@/lib/board-admin-auth";
import { getD1Database } from "@/lib/cloudflare-db";

type RouteParams = {
  params: Promise<{ topicId: string }>;
};

type PatchBody = {
  pinWeight?: number;
  hidden?: boolean;
};

export async function PATCH(request: Request, context: RouteParams) {
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

  let payload: PatchBody;

  try {
    payload = (await request.json()) as PatchBody;
  } catch {
    return Response.json({ ok: false, reason: "invalid-json" }, { status: 400 });
  }

  const db = await getD1Database();

  if (!db) {
    return Response.json({ ok: false, reason: "database-not-configured" }, { status: 503 });
  }

  try {
    if (typeof payload.pinWeight === "number" && Number.isFinite(payload.pinWeight)) {
      const pinWeight = Math.max(0, Math.min(1_000_000, Math.floor(payload.pinWeight)));
      await db.prepare(`UPDATE board_topics SET pin_weight = ? WHERE id = ?`).bind(pinWeight, topicId).run();
    }

    if (typeof payload.hidden === "boolean") {
      await db.prepare(`UPDATE board_topics SET hidden = ? WHERE id = ?`).bind(payload.hidden ? 1 : 0, topicId).run();
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, reason: "database-write-failed" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteParams) {
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
    const { results } = await db.prepare(`SELECT id FROM board_topics WHERE id = ?`).bind(topicId).all<{ id: number }>();
    const row = results?.[0];

    if (!row) {
      return Response.json({ ok: false, reason: "not-found" }, { status: 404 });
    }

    await db
      .prepare(`DELETE FROM board_comments WHERE answer_id IN (SELECT id FROM board_posts WHERE topic_id = ?)`)
      .bind(topicId)
      .run();
    await db.prepare(`DELETE FROM board_posts WHERE topic_id = ?`).bind(topicId).run();
    await db.prepare(`DELETE FROM board_topic_meta WHERE topic_id = ?`).bind(topicId).run();
    await db.prepare(`DELETE FROM board_topics WHERE id = ?`).bind(topicId).run();

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, reason: "database-write-failed" }, { status: 500 });
  }
}

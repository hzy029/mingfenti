import {
  adminBoardDisabledResponse,
  adminBoardUnauthorizedResponse,
  isAdminBoardAuthorized
} from "@/lib/board-admin-auth";
import { getD1Database } from "@/lib/cloudflare-db";

type RouteParams = {
  params: Promise<{ commentId: string }>;
};

type PatchBody = {
  hidden?: boolean;
};

export async function PATCH(request: Request, context: RouteParams) {
  if (!process.env.ADMIN_BOARD_SECRET) {
    return adminBoardDisabledResponse();
  }

  if (!isAdminBoardAuthorized(request)) {
    return adminBoardUnauthorizedResponse();
  }

  const { commentId: rawId } = await context.params;
  const commentId = Number.parseInt(rawId, 10);

  if (!Number.isFinite(commentId)) {
    return Response.json({ ok: false, reason: "invalid-comment-id" }, { status: 400 });
  }

  let payload: PatchBody;

  try {
    payload = (await request.json()) as PatchBody;
  } catch {
    return Response.json({ ok: false, reason: "invalid-json" }, { status: 400 });
  }

  if (typeof payload.hidden !== "boolean") {
    return Response.json({ ok: false, reason: "invalid-payload" }, { status: 400 });
  }

  const db = await getD1Database();

  if (!db) {
    return Response.json({ ok: false, reason: "database-not-configured" }, { status: 503 });
  }

  try {
    await db.prepare(`UPDATE board_comments SET hidden = ? WHERE id = ?`).bind(payload.hidden ? 1 : 0, commentId).run();

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
    const { results } = await db.prepare(`SELECT id FROM board_comments WHERE id = ?`).bind(commentId).all<{ id: number }>();
    const row = results?.[0];

    if (!row) {
      return Response.json({ ok: false, reason: "not-found" }, { status: 404 });
    }

    await db.prepare(`DELETE FROM board_comments WHERE id = ?`).bind(commentId).run();

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, reason: "database-write-failed" }, { status: 500 });
  }
}

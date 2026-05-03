import {
  adminBoardDisabledResponse,
  adminBoardUnauthorizedResponse,
  isAdminBoardAuthorized
} from "@/lib/board-admin-auth";
import { clampBoardBody } from "@/lib/board-text";
import { getD1Database } from "@/lib/cloudflare-db";

type RouteParams = {
  params: Promise<{ postId: string }>;
};

type PatchBody = {
  hidden?: boolean;
  body?: string;
};

export async function PATCH(request: Request, context: RouteParams) {
  if (!process.env.ADMIN_BOARD_SECRET) {
    return adminBoardDisabledResponse();
  }

  if (!isAdminBoardAuthorized(request)) {
    return adminBoardUnauthorizedResponse();
  }

  const { postId: rawPostId } = await context.params;
  const postId = Number.parseInt(rawPostId, 10);

  if (!Number.isFinite(postId)) {
    return Response.json({ ok: false, reason: "invalid-post-id" }, { status: 400 });
  }

  let payload: PatchBody;

  try {
    payload = (await request.json()) as PatchBody;
  } catch {
    return Response.json({ ok: false, reason: "invalid-json" }, { status: 400 });
  }

  const hasHidden = typeof payload.hidden === "boolean";
  const hasBody = typeof payload.body === "string";

  if (!hasHidden && !hasBody) {
    return Response.json({ ok: false, reason: "invalid-payload" }, { status: 400 });
  }

  let nextBody: string | undefined;
  let nextHidden: number | undefined;

  if (hasBody) {
    const body = clampBoardBody(payload.body ?? "");
    if (!body) {
      return Response.json({ ok: false, reason: "body-required" }, { status: 400 });
    }
    nextBody = body;
  }

  if (hasHidden) {
    nextHidden = payload.hidden ? 1 : 0;
  }

  const db = await getD1Database();

  if (!db) {
    return Response.json({ ok: false, reason: "database-not-configured" }, { status: 503 });
  }

  try {
    if (nextBody !== undefined && nextHidden !== undefined) {
      await db.prepare(`UPDATE board_posts SET body = ?, hidden = ? WHERE id = ?`).bind(nextBody, nextHidden, postId).run();
    } else if (nextBody !== undefined) {
      await db.prepare(`UPDATE board_posts SET body = ? WHERE id = ?`).bind(nextBody, postId).run();
    } else if (nextHidden !== undefined) {
      await db.prepare(`UPDATE board_posts SET hidden = ? WHERE id = ?`).bind(nextHidden, postId).run();
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
    const { results } = await db.prepare(`SELECT id FROM board_posts WHERE id = ?`).bind(postId).all<{ id: number }>();
    const row = results?.[0];

    if (!row) {
      return Response.json({ ok: false, reason: "not-found" }, { status: 404 });
    }

    await db.prepare(`DELETE FROM board_comments WHERE answer_id = ?`).bind(postId).run();
    await db.prepare(`DELETE FROM board_posts WHERE id = ?`).bind(postId).run();

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, reason: "database-write-failed" }, { status: 500 });
  }
}

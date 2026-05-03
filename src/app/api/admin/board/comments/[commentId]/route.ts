import {
  adminBoardDisabledResponse,
  adminBoardUnauthorizedResponse,
  isAdminBoardAuthorized
} from "@/lib/board-admin-auth";
import { deleteBoardLikesForComment, ensureBoardLikesSchema } from "@/lib/board-likes";
import { BOARD_REVIEW_STATUSES, ensureBoardReviewSchema, type BoardReviewStatus } from "@/lib/board-review";
import { getD1Database } from "@/lib/cloudflare-db";

type RouteParams = {
  params: Promise<{ commentId: string }>;
};

type PatchBody = {
  hidden?: boolean;
  reviewStatus?: BoardReviewStatus;
};

function isReviewStatus(value: unknown): value is BoardReviewStatus {
  return typeof value === "string" && BOARD_REVIEW_STATUSES.includes(value as BoardReviewStatus);
}

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

  const hasHidden = typeof payload.hidden === "boolean";
  const hasReviewStatus = payload.reviewStatus !== undefined;

  if (!hasHidden && !hasReviewStatus) {
    return Response.json({ ok: false, reason: "invalid-payload" }, { status: 400 });
  }

  if (hasReviewStatus && !isReviewStatus(payload.reviewStatus)) {
    return Response.json({ ok: false, reason: "invalid-review-status" }, { status: 400 });
  }

  const db = await getD1Database();

  if (!db) {
    return Response.json({ ok: false, reason: "database-not-configured" }, { status: 503 });
  }

  try {
    await ensureBoardReviewSchema(db);

    const updates: string[] = [];
    const values: unknown[] = [];
    const now = new Date().toISOString();

    if (hasHidden) {
      updates.push("hidden = ?");
      values.push(payload.hidden ? 1 : 0);
    }

    if (hasReviewStatus) {
      updates.push("review_status = ?", "reviewed_at = ?", "review_provider = ?", "review_verdict = ?", "review_reason = ?");
      values.push(
        payload.reviewStatus,
        now,
        "admin",
        payload.reviewStatus === "published" ? "approve" : payload.reviewStatus === "rejected" ? "reject" : "review",
        "admin-override"
      );

      if (payload.reviewStatus === "published") {
        updates.push("published_at = COALESCE(published_at, ?)");
        values.push(now);
      }
    }

    values.push(commentId);
    await db.prepare(`UPDATE board_comments SET ${updates.join(", ")} WHERE id = ?`).bind(...values).run();

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

    await ensureBoardLikesSchema(db);
    await deleteBoardLikesForComment(db, commentId);

    await db.prepare(`DELETE FROM board_comments WHERE id = ?`).bind(commentId).run();

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, reason: "database-write-failed" }, { status: 500 });
  }
}

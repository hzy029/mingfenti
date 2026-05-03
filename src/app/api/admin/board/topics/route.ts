import {
  adminBoardDisabledResponse,
  adminBoardUnauthorizedResponse,
  isAdminBoardAuthorized
} from "@/lib/board-admin-auth";
import { clampBoardBody, clampBoardTitle } from "@/lib/board-text";
import { ensureBoardReviewSchema } from "@/lib/board-review";
import { getD1Database } from "@/lib/cloudflare-db";

type AdminTopicRow = {
  id: number;
  title: string;
  pin_weight: number;
  hidden: number;
  created_at: string;
  reply_count: number;
  max_post_heat: number;
};

export async function GET(request: Request) {
  if (!process.env.ADMIN_BOARD_SECRET) {
    return adminBoardDisabledResponse();
  }

  if (!isAdminBoardAuthorized(request)) {
    return adminBoardUnauthorizedResponse();
  }

  const db = await getD1Database();

  if (!db) {
    return Response.json({ ok: false, reason: "database-not-configured" }, { status: 503 });
  }

  try {
    await ensureBoardReviewSchema(db);
    const { results } = await db
      .prepare(
        `SELECT
          t.id,
          t.title,
          t.pin_weight,
          t.hidden,
          t.created_at,
          COUNT(p.id) AS reply_count,
          COALESCE(MAX(p.heat_score), 0) AS max_post_heat
        FROM board_topics t
        LEFT JOIN board_posts p ON p.topic_id = t.id AND p.review_status = 'published'
        GROUP BY t.id
        ORDER BY t.id DESC
        LIMIT 200`
      )
      .all<AdminTopicRow>();

    return Response.json({ ok: true, topics: results ?? [] });
  } catch {
    return Response.json({ ok: false, reason: "query-failed" }, { status: 500 });
  }
}

type CreateAdminTopicBody = {
  title?: string;
  description?: string;
};

export async function POST(request: Request) {
  if (!process.env.ADMIN_BOARD_SECRET) {
    return adminBoardDisabledResponse();
  }

  if (!isAdminBoardAuthorized(request)) {
    return adminBoardUnauthorizedResponse();
  }

  let payload: CreateAdminTopicBody;

  try {
    payload = (await request.json()) as CreateAdminTopicBody;
  } catch {
    return Response.json({ ok: false, reason: "invalid-json" }, { status: 400 });
  }

  const title = clampBoardTitle(payload.title ?? "");
  const description = clampBoardBody(payload.description ?? "");

  if (!title) {
    return Response.json({ ok: false, reason: "title-required" }, { status: 400 });
  }

  const db = await getD1Database();

  if (!db) {
    return Response.json({ ok: false, reason: "database-not-configured" }, { status: 503 });
  }

  const createdAt = new Date().toISOString();

  try {
    const topicInsert = await db
      .prepare(
        `INSERT INTO board_topics (title, pin_weight, hidden, created_at)
        VALUES (?, 0, 0, ?)
        RETURNING id`
      )
      .bind(title, createdAt)
      .all<{ id: number }>();

    let topicId = topicInsert.results?.[0]?.id;

    if (typeof topicId !== "number") {
      const fallback = await db.prepare(`SELECT last_insert_rowid() AS id`).all<{ id: number }>();
      topicId = Number(fallback.results?.[0]?.id);
    }

    if (!Number.isFinite(topicId)) {
      return Response.json({ ok: false, reason: "topic-create-failed" }, { status: 500 });
    }

    if (description) {
      try {
        await db.prepare(`INSERT INTO board_topic_meta (topic_id, description) VALUES (?, ?)`).bind(topicId, description).run();
      } catch {
        // 远程 D1 若尚未执行含 board_topic_meta 的 schema 迁移，仅主题会创建成功，补充说明可稍后补迁移再编辑
      }
    }

    return Response.json({ ok: true, topicId });
  } catch {
    return Response.json({ ok: false, reason: "database-write-failed" }, { status: 500 });
  }
}

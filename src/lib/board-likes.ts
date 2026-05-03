import type { D1Database } from "@/lib/cloudflare-db";

export type BoardLikeKind = "post" | "comment";

export const BOARD_DAILY_LIKE_LIMIT = 100;

export async function ensureBoardLikesSchema(db: D1Database): Promise<void> {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS board_likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kind TEXT NOT NULL CHECK (kind IN ('post', 'comment')),
        target_id INTEGER NOT NULL,
        ip_hash TEXT NOT NULL,
        created_at TEXT NOT NULL,
        UNIQUE (kind, target_id, ip_hash)
      )`
    )
    .run();
  await db
    .prepare(`CREATE INDEX IF NOT EXISTS idx_board_likes_target ON board_likes (kind, target_id)`)
    .run();
  await db
    .prepare(`CREATE INDEX IF NOT EXISTS idx_board_likes_ip_target ON board_likes (ip_hash, kind, target_id)`)
    .run();
  await db
    .prepare(`CREATE INDEX IF NOT EXISTS idx_board_likes_ip_created ON board_likes (ip_hash, created_at)`)
    .run();
}

export function d1StatementChanges(runResult: unknown): number {
  if (runResult && typeof runResult === "object" && "meta" in runResult) {
    const changes = (runResult as { meta?: { changes?: number } }).meta?.changes;

    return typeof changes === "number" ? changes : 0;
  }

  return 0;
}

/** INSERT OR IGNORE：若插入成功（changes>0）则表示该 IP 尚未对该目标点赞 */
export async function tryInsertBoardLike(
  db: D1Database,
  kind: BoardLikeKind,
  targetId: number,
  ipHash: string,
  createdAt: string
): Promise<boolean> {
  const runResult = await db
    .prepare(
      `INSERT OR IGNORE INTO board_likes (kind, target_id, ip_hash, created_at) VALUES (?, ?, ?, ?)`
    )
    .bind(kind, targetId, ipHash, createdAt)
    .run();

  return d1StatementChanges(runResult) > 0;
}

export async function hasBoardLike(
  db: D1Database,
  kind: BoardLikeKind,
  targetId: number,
  ipHash: string
): Promise<boolean> {
  const { results } = await db
    .prepare(`SELECT id FROM board_likes WHERE kind = ? AND target_id = ? AND ip_hash = ? LIMIT 1`)
    .bind(kind, targetId, ipHash)
    .all<{ id: number }>();

  return Boolean(results?.[0]);
}

export async function countDailyBoardLikes(db: D1Database, dayUtc: string, ipHash: string): Promise<number> {
  const dayStart = `${dayUtc}T00:00:00.000Z`;
  const nextDay = new Date(`${dayUtc}T00:00:00.000Z`);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);
  const dayEnd = nextDay.toISOString();

  const { results } = await db
    .prepare(`SELECT COUNT(*) AS c FROM board_likes WHERE ip_hash = ? AND created_at >= ? AND created_at < ?`)
    .bind(ipHash, dayStart, dayEnd)
    .all<{ c: number }>();

  const row = results?.[0];
  const n = row?.c;

  return typeof n === "number" ? n : Number(n) || 0;
}

export async function getLikedTargetIdsForIp(
  db: D1Database,
  kind: BoardLikeKind,
  targetIds: number[],
  ipHash: string
): Promise<Set<number>> {
  if (targetIds.length === 0) {
    return new Set();
  }

  const placeholders = targetIds.map(() => "?").join(", ");
  const { results } = await db
    .prepare(
      `SELECT target_id FROM board_likes WHERE kind = ? AND ip_hash = ? AND target_id IN (${placeholders})`
    )
    .bind(kind, ipHash, ...targetIds)
    .all<{ target_id: number }>();

  return new Set((results ?? []).map((row) => row.target_id));
}

export async function deleteBoardLikesForComment(db: D1Database, commentId: number): Promise<void> {
  await db.prepare(`DELETE FROM board_likes WHERE kind = 'comment' AND target_id = ?`).bind(commentId).run();
}

export async function deleteBoardLikesForPostAndItsComments(db: D1Database, postId: number): Promise<void> {
  await db
    .prepare(
      `DELETE FROM board_likes WHERE kind = 'comment' AND target_id IN (SELECT id FROM board_comments WHERE answer_id = ?)`
    )
    .bind(postId)
    .run();
  await db.prepare(`DELETE FROM board_likes WHERE kind = 'post' AND target_id = ?`).bind(postId).run();
}

export async function deleteBoardLikesForTopic(db: D1Database, topicId: number): Promise<void> {
  await db
    .prepare(
      `DELETE FROM board_likes WHERE kind = 'comment' AND target_id IN (
        SELECT id FROM board_comments WHERE answer_id IN (SELECT id FROM board_posts WHERE topic_id = ?)
      )`
    )
    .bind(topicId)
    .run();
  await db
    .prepare(
      `DELETE FROM board_likes WHERE kind = 'post' AND target_id IN (SELECT id FROM board_posts WHERE topic_id = ?)`
    )
    .bind(topicId)
    .run();
}

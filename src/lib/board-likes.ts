import type { D1Database } from "@/lib/cloudflare-db";

export type BoardLikeKind = "post" | "comment";

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

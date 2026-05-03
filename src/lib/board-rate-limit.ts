import type { D1Database } from "@/lib/cloudflare-db";

export const BOARD_DAILY_POST_LIMIT = 20;
export const BOARD_SITE_DAILY_POST_LIMIT = 3000;

/** 建表：每日发帖计数（回答+评论合计，按 UTC 日 + IP 哈希） */
export async function ensureBoardDailyActionsSchema(db: D1Database): Promise<void> {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS board_daily_actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        day_utc TEXT NOT NULL,
        ip_hash TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`
    )
    .run();
  await db
    .prepare(
      `CREATE INDEX IF NOT EXISTS idx_board_daily_actions_day_ip
      ON board_daily_actions (day_utc, ip_hash)`
    )
    .run();
}

export function getUtcDayString(date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

export function getClientIpFromHeaders(headers: Headers): string {
  const cf = headers.get("cf-connecting-ip")?.trim();
  if (cf) {
    return cf;
  }

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  return "unknown";
}

/** Next.js `headers()` 等只读头对象，仅需实现 `.get` */
export function getClientIpFromHeaderGetter(get: (name: string) => string | null | undefined): string {
  const cf = get("cf-connecting-ip")?.trim();
  if (cf) {
    return cf;
  }

  const forwarded = get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  return "unknown";
}

export function getClientIp(request: Request): string {
  return getClientIpFromHeaders(request.headers);
}

function rateSalt(): string {
  return process.env.BOARD_RATE_SALT?.trim() || "mingfenti-board-rate-fallback-salt-v1";
}

export async function hashIpForRateLimit(ip: string): Promise<string> {
  const payload = `${rateSalt()}:${ip}`;
  const bytes = new TextEncoder().encode(payload);
  const digest = await crypto.subtle.digest("SHA-256", bytes);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function countDailyActions(db: D1Database, dayUtc: string, ipHash: string): Promise<number> {
  const { results } = await db
    .prepare(`SELECT COUNT(*) AS c FROM board_daily_actions WHERE day_utc = ? AND ip_hash = ?`)
    .bind(dayUtc, ipHash)
    .all<{ c: number }>();

  const row = results?.[0];
  const n = row?.c;

  return typeof n === "number" ? n : Number(n) || 0;
}

export async function countSiteDailyActions(db: D1Database, dayUtc: string): Promise<number> {
  const { results } = await db
    .prepare(`SELECT COUNT(*) AS c FROM board_daily_actions WHERE day_utc = ?`)
    .bind(dayUtc)
    .all<{ c: number }>();

  const row = results?.[0];
  const n = row?.c;

  return typeof n === "number" ? n : Number(n) || 0;
}

export async function recordDailyAction(db: D1Database, dayUtc: string, ipHash: string, createdAt: string): Promise<void> {
  await db.prepare(`INSERT INTO board_daily_actions (day_utc, ip_hash, created_at) VALUES (?, ?, ?)`).bind(dayUtc, ipHash, createdAt).run();
}

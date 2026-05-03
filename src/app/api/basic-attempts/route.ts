import { getD1Database } from "@/lib/cloudflare-db";
import { getClientIp, getUtcDayString, hashIpForRateLimit } from "@/lib/board-rate-limit";

type BasicAttemptPayload = {
  resultId?: string;
  resultTitle?: string;
  historyKnowledge?: number;
  mingPreference?: number;
  startedAt?: string;
  completedAt?: string;
  durationSeconds?: number;
};

const MIN_RECORDED_DURATION_SECONDS = 30;
const BASIC_ATTEMPT_DAILY_RECORD_LIMIT = 30;

function isValidPayload(payload: BasicAttemptPayload) {
  return (
    typeof payload.resultId === "string" &&
    typeof payload.resultTitle === "string" &&
    typeof payload.historyKnowledge === "number" &&
    typeof payload.mingPreference === "number" &&
    typeof payload.startedAt === "string" &&
    typeof payload.completedAt === "string" &&
    typeof payload.durationSeconds === "number"
  );
}

function normalizePayload(payload: BasicAttemptPayload): Required<BasicAttemptPayload> | undefined {
  if (!isValidPayload(payload)) {
    return undefined;
  }

  return payload as Required<BasicAttemptPayload>;
}

async function ensureBasicAttemptDailyActionsSchema(db: NonNullable<Awaited<ReturnType<typeof getD1Database>>>) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS basic_attempt_daily_actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        day_utc TEXT NOT NULL,
        ip_hash TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`
    )
    .run();
  await db
    .prepare(
      `CREATE INDEX IF NOT EXISTS idx_basic_attempt_daily_actions_day_ip
      ON basic_attempt_daily_actions (day_utc, ip_hash)`
    )
    .run();
}

async function countDailyRecordedAttempts(
  db: NonNullable<Awaited<ReturnType<typeof getD1Database>>>,
  dayUtc: string,
  ipHash: string
) {
  const { results } = await db
    .prepare(`SELECT COUNT(*) AS c FROM basic_attempt_daily_actions WHERE day_utc = ? AND ip_hash = ?`)
    .bind(dayUtc, ipHash)
    .all<{ c: number }>();

  const n = results?.[0]?.c;

  return typeof n === "number" ? n : Number(n) || 0;
}

async function recordDailyRecordedAttempt(
  db: NonNullable<Awaited<ReturnType<typeof getD1Database>>>,
  dayUtc: string,
  ipHash: string,
  createdAt: string
) {
  await db
    .prepare(`INSERT INTO basic_attempt_daily_actions (day_utc, ip_hash, created_at) VALUES (?, ?, ?)`)
    .bind(dayUtc, ipHash, createdAt)
    .run();
}

export async function POST(request: Request) {
  let payload: BasicAttemptPayload;

  try {
    payload = (await request.json()) as BasicAttemptPayload;
  } catch {
    return Response.json({ ok: false, reason: "invalid-json" }, { status: 400 });
  }

  const validPayload = normalizePayload(payload);

  if (!validPayload) {
    return Response.json({ ok: false, reason: "invalid-payload" }, { status: 400 });
  }

  if (validPayload.durationSeconds < MIN_RECORDED_DURATION_SECONDS) {
    return Response.json({ ok: true, recorded: false, reason: "too-fast" });
  }

  const db = await getD1Database();

  if (!db) {
    return Response.json({ ok: true, recorded: false, reason: "database-not-configured" });
  }

  try {
    await ensureBasicAttemptDailyActionsSchema(db);

    const dayUtc = getUtcDayString();
    const ipHash = await hashIpForRateLimit(getClientIp(request));
    const used = await countDailyRecordedAttempts(db, dayUtc, ipHash);

    if (used >= BASIC_ATTEMPT_DAILY_RECORD_LIMIT) {
      return Response.json(
        {
          ok: false,
          reason: "daily-limit-exceeded",
          message: `同一网络环境下每日最多记录 ${BASIC_ATTEMPT_DAILY_RECORD_LIMIT} 次测试结果，请明日再试。`
        },
        { status: 429 }
      );
    }

    const createdAt = new Date().toISOString();

    await db
      .prepare(
        `INSERT INTO basic_attempts (
          result_id,
          result_title,
          history_knowledge,
          ming_preference,
          started_at,
          completed_at,
          duration_seconds,
          is_recorded,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        validPayload.resultId,
        validPayload.resultTitle,
        validPayload.historyKnowledge,
        validPayload.mingPreference,
        validPayload.startedAt,
        validPayload.completedAt,
        validPayload.durationSeconds,
        1,
        createdAt
      )
      .run();

    await recordDailyRecordedAttempt(db, dayUtc, ipHash, createdAt);

    return Response.json({ ok: true, recorded: true });
  } catch {
    return Response.json({ ok: true, recorded: false, reason: "database-write-failed" });
  }
}

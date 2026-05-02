import { getD1Database } from "@/lib/cloudflare-db";

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
        new Date().toISOString()
      )
      .run();

    return Response.json({ ok: true, recorded: true });
  } catch {
    return Response.json({ ok: true, recorded: false, reason: "database-write-failed" });
  }
}

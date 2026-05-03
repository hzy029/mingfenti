import type { D1Database } from "@/lib/cloudflare-db";

export const BOARD_REVIEW_STATUSES = ["pending", "published", "rejected"] as const;

export type BoardReviewStatus = (typeof BOARD_REVIEW_STATUSES)[number];
export type BoardReviewVerdict = "approve" | "review" | "reject";

export type BoardReviewResult = {
  status: BoardReviewStatus;
  verdict: BoardReviewVerdict;
  provider: "deepseek" | "fallback";
  model: string;
  reason: string;
  labels: string[];
};

const DEFAULT_DEEPSEEK_MODEL = "deepseek-v4-flash";
const DEEPSEEK_CHAT_COMPLETIONS_URL = "https://api.deepseek.com/chat/completions";
const REVIEW_TIMEOUT_MS = 8000;

type DeepSeekChoice = {
  message?: {
    content?: string | null;
  };
};

type DeepSeekResponse = {
  choices?: DeepSeekChoice[];
};

type ParsedReviewPayload = {
  verdict?: unknown;
  reason?: unknown;
  labels?: unknown;
};

export function getBoardReviewModel(): string {
  return process.env.DEEPSEEK_MODEL?.trim() || DEFAULT_DEEPSEEK_MODEL;
}

function fallbackReview(reason: string): BoardReviewResult {
  return {
    status: "pending",
    verdict: "review",
    provider: "fallback",
    model: getBoardReviewModel(),
    reason,
    labels: ["fallback"]
  };
}

function normalizeReviewPayload(payload: ParsedReviewPayload): BoardReviewResult {
  const verdict: BoardReviewVerdict =
    payload.verdict === "approve" || payload.verdict === "reject" || payload.verdict === "review"
      ? payload.verdict
      : "review";
  const status: BoardReviewStatus = verdict === "approve" ? "published" : verdict === "reject" ? "rejected" : "pending";
  const rawLabels = Array.isArray(payload.labels) ? payload.labels : [];
  const labels = rawLabels.filter((label): label is string => typeof label === "string").slice(0, 8);
  const reason = typeof payload.reason === "string" && payload.reason.trim() ? payload.reason.trim().slice(0, 500) : "model-review";

  return {
    status,
    verdict,
    provider: "deepseek",
    model: getBoardReviewModel(),
    reason,
    labels
  };
}

function buildReviewPrompt(kind: "answer" | "comment", body: string, authorDisplay: string | null): string {
  return [
    "你是中文社区留言板的保守内容审核员。",
    "请只返回 JSON，不要输出 Markdown 或解释。",
    'JSON 格式必须是：{"verdict":"approve|review|reject","reason":"简短中文原因","labels":["标签"]}',
    "审核尺度：只有明确合规、非辱骂、非广告、非恶意外链、非刷屏的正常讨论才 approve。",
    "不确定、争议强、疑似违规、疑似引战、疑似人身攻击、擦边广告、外链风险，一律 review。",
    "明显违法、威胁骚扰、垃圾广告、恶意刷屏、恶意外链，一律 reject。",
    `内容类型：${kind === "answer" ? "回答" : "评论"}`,
    `昵称：${authorDisplay || "匿名"}`,
    "正文：",
    body
  ].join("\n");
}

export async function reviewBoardContent(input: {
  kind: "answer" | "comment";
  body: string;
  authorDisplay: string | null;
}): Promise<BoardReviewResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();

  if (!apiKey) {
    return fallbackReview("deepseek-api-key-not-configured");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REVIEW_TIMEOUT_MS);

  try {
    const response = await fetch(DEEPSEEK_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: getBoardReviewModel(),
        messages: [
          {
            role: "system",
            content: "你负责保守审核中文 UGC。必须输出合法 JSON。"
          },
          {
            role: "user",
            content: buildReviewPrompt(input.kind, input.body, input.authorDisplay)
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0,
        stream: false
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      return fallbackReview("deepseek-request-failed");
    }

    const payload = (await response.json()) as DeepSeekResponse;
    const content = payload.choices?.[0]?.message?.content;

    if (!content) {
      return fallbackReview("deepseek-empty-response");
    }

    return normalizeReviewPayload(JSON.parse(content) as ParsedReviewPayload);
  } catch {
    return fallbackReview("deepseek-review-failed");
  } finally {
    clearTimeout(timeout);
  }
}

async function tryRun(db: D1Database, sql: string) {
  try {
    await db.prepare(sql).run();
  } catch {
    // D1/SQLite lacks ADD COLUMN IF NOT EXISTS in some environments; duplicate-column failures are safe here.
  }
}

export async function ensureBoardReviewSchema(db: D1Database) {
  await tryRun(db, `ALTER TABLE board_posts ADD COLUMN review_status TEXT NOT NULL DEFAULT 'published'`);
  await tryRun(db, `ALTER TABLE board_posts ADD COLUMN published_at TEXT`);
  await tryRun(db, `ALTER TABLE board_posts ADD COLUMN reviewed_at TEXT`);
  await tryRun(db, `ALTER TABLE board_posts ADD COLUMN review_provider TEXT`);
  await tryRun(db, `ALTER TABLE board_posts ADD COLUMN review_model TEXT`);
  await tryRun(db, `ALTER TABLE board_posts ADD COLUMN review_verdict TEXT`);
  await tryRun(db, `ALTER TABLE board_posts ADD COLUMN review_reason TEXT`);
  await tryRun(db, `ALTER TABLE board_comments ADD COLUMN review_status TEXT NOT NULL DEFAULT 'published'`);
  await tryRun(db, `ALTER TABLE board_comments ADD COLUMN published_at TEXT`);
  await tryRun(db, `ALTER TABLE board_comments ADD COLUMN reviewed_at TEXT`);
  await tryRun(db, `ALTER TABLE board_comments ADD COLUMN review_provider TEXT`);
  await tryRun(db, `ALTER TABLE board_comments ADD COLUMN review_model TEXT`);
  await tryRun(db, `ALTER TABLE board_comments ADD COLUMN review_verdict TEXT`);
  await tryRun(db, `ALTER TABLE board_comments ADD COLUMN review_reason TEXT`);
  await tryRun(db, `CREATE INDEX IF NOT EXISTS idx_board_posts_topic_review ON board_posts (topic_id, review_status, hidden)`);
  await tryRun(db, `CREATE INDEX IF NOT EXISTS idx_board_comments_answer_review ON board_comments (answer_id, review_status, hidden)`);
  await tryRun(
    db,
    `UPDATE board_posts
    SET review_status = 'published',
      published_at = COALESCE(published_at, created_at),
      reviewed_at = COALESCE(reviewed_at, created_at),
      review_provider = COALESCE(review_provider, 'legacy')
    WHERE review_status IS NULL OR published_at IS NULL`
  );
  await tryRun(
    db,
    `UPDATE board_comments
    SET review_status = 'published',
      published_at = COALESCE(published_at, created_at),
      reviewed_at = COALESCE(reviewed_at, created_at),
      review_provider = COALESCE(review_provider, 'legacy')
    WHERE review_status IS NULL OR published_at IS NULL`
  );
}

export function serializeReviewLabels(labels: string[]): string {
  return labels.join(",");
}

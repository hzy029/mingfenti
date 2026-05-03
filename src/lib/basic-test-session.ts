import type { BasicQuestion, BasicResultId, TfQuestion } from "@/data/types";
import type { BasicAnswerMap, BasicScore } from "@/lib/basic-scoring";

export const BASIC_TEST_SESSION_STORAGE_KEY = "mingqing-basic-test-session";

type SessionCommon = {
  score: BasicScore;
  resultId: BasicResultId;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
};

export type BasicTestSessionPro = SessionCommon & {
  testVariant: "pro";
  questions: BasicQuestion[];
  answers: BasicAnswerMap;
};

export type BasicTestSessionLite = SessionCommon & {
  testVariant: "lite";
  questions: TfQuestion[];
  /** 用户选「对」为 true，选「错」为 false */
  answers: Record<string, boolean>;
};

export type BasicTestSession = BasicTestSessionPro | BasicTestSessionLite;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isBasicQuestion(value: unknown): value is BasicQuestion {
  if (!isRecord(value)) {
    return false;
  }
  return Array.isArray(value.options);
}

function isTfQuestion(value: unknown): value is TfQuestion {
  if (!isRecord(value)) {
    return false;
  }
  if (typeof value.statement !== "string" || typeof value.correctTrue !== "boolean") {
    return false;
  }
  if (value.liteScoring !== undefined) {
    const ls = value.liteScoring;
    if (!isRecord(ls)) {
      return false;
    }
    const leanOk = ls.lean === "支持" || ls.lean === "反对";
    return leanOk && (ls.mode === "extreme" || ls.mode === "rational");
  }
  return true;
}

/**
 * 解析 localStorage 中的测验会话。旧数据无 `testVariant` 时按 Pro 四选一处理。
 */
export function parseBasicTestSession(raw: string | null | undefined): BasicTestSession | null {
  if (raw == null || raw === "") {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    return null;
  }

  if (!isRecord(parsed)) {
    return null;
  }

  const score = parsed.score;
  if (!isRecord(score)) {
    return null;
  }
  const hk = score.historyKnowledge;
  const mp = score.mingPreference;
  if (typeof hk !== "number" || typeof mp !== "number") {
    return null;
  }

  if (
    typeof parsed.resultId !== "string" ||
    typeof parsed.startedAt !== "string" ||
    typeof parsed.completedAt !== "string" ||
    typeof parsed.durationSeconds !== "number"
  ) {
    return null;
  }

  const base: SessionCommon = {
    score: { historyKnowledge: hk, mingPreference: mp },
    resultId: parsed.resultId as BasicResultId,
    startedAt: parsed.startedAt,
    completedAt: parsed.completedAt,
    durationSeconds: parsed.durationSeconds
  };

  const variant = parsed.testVariant;
  const questions = parsed.questions;
  const answers = parsed.answers;

  if (variant === "lite" && Array.isArray(questions) && questions.length > 0 && isTfQuestion(questions[0])) {
    if (!isRecord(answers)) {
      return null;
    }
    const boolAnswers: Record<string, boolean> = {};
    for (const [key, value] of Object.entries(answers)) {
      if (typeof value === "boolean") {
        boolAnswers[key] = value;
      }
    }
    return {
      ...base,
      testVariant: "lite",
      questions: questions as TfQuestion[],
      answers: boolAnswers
    };
  }

  if (
    (variant === "pro" || variant === undefined) &&
    Array.isArray(questions) &&
    questions.length > 0 &&
    isBasicQuestion(questions[0])
  ) {
    if (!isRecord(answers)) {
      return null;
    }
    const strAnswers: BasicAnswerMap = {};
    for (const [key, value] of Object.entries(answers)) {
      if (typeof value === "string") {
        strAnswers[key] = value;
      }
    }
    return {
      ...base,
      testVariant: "pro",
      questions: questions as BasicQuestion[],
      answers: strAnswers
    };
  }

  return null;
}

import type { BasicScore } from "@/lib/basic-scoring";

/**
 * 与当前 `drawLiteTestQuestions` 一致：10×E(权2) + 4×R(权2) + 3×OE(权1) + 3×OR(权1)，
 * 每题单轴极端贡献为 3×权值（见 `lite-scoring.ts`）。
 */
export const LITE_RAW_SCORE_CAP: BasicScore = {
  historyKnowledge: 102,
  mingPreference: 91
};

/** 将原始累加分映射到 0–78，供普通版结果档位与结果页展示。 */
export function normalizeLiteScore(raw: BasicScore): BasicScore {
  const hk = Math.round(
    Math.min(78, (raw.historyKnowledge / LITE_RAW_SCORE_CAP.historyKnowledge) * 78)
  );
  const mp = Math.round(
    Math.min(78, (raw.mingPreference / LITE_RAW_SCORE_CAP.mingPreference) * 78)
  );
  return { historyKnowledge: hk, mingPreference: mp };
}

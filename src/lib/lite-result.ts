import type { BasicResultEvaluation, BasicScore } from "@/lib/basic-scoring";
import type { BasicResultTier } from "@/data/types";
import { basicResultTiers } from "@/data/basic-results";

const baseTierById = new Map(
  basicResultTiers.filter((t) => !t.sourceResultId).map((t) => [t.id, t])
);

function displayVariantForNeutral(base: BasicResultTier, random: () => number): BasicResultTier {
  const variant = basicResultTiers.find(
    (t) => t.sourceResultId === base.id && t.id === "manchu-loyalist" && random() < (t.displayChance ?? 0)
  );
  return variant ?? base;
}

function wrap(score: BasicScore, base: BasicResultTier, random: () => number): BasicResultEvaluation {
  const display =
    base.id === "objective-neutral" ? displayVariantForNeutral(base, random) : base;
  return { score, baseResult: base, displayResult: display };
}

/**
 * 普通版（文档题库 20 题）结果划分。
 * 分数须已按 `normalizeLiteScore` 映射到 0–78；横轴 H = `historyKnowledge`（理性/材料与制度分析），纵轴 M = `mingPreference`（明朝偏向）。
 *
 * 匹配顺序（先命中先出）：
 * 1. 朱元璋梦男：M≥68 且 H≤40（明极高、理性低）
 * 2. 旧明粉：H≥52 且 M≥52（双高）
 * 3. 中立客观：H≥52 且 M≤38（理性高、明低）
 * 4. 清粉：H≤32 且 M≤32（双低）
 * 5. 新明粉：H<52 且 48≤M<68（理性低、明高，且未落入梦男）
 * 6. 萌萌人：其余
 *
 * 「中立客观」命中后仍有 10% 展示为满遗彩蛋（`manchu-loyalist`）。
 */
export function getLiteTestResult(score: BasicScore, random: () => number = Math.random): BasicResultEvaluation {
  const H = score.historyKnowledge;
  const M = score.mingPreference;

  const zhu = baseTierById.get("zhu-yuanzhang-dreamer");
  const oldM = baseTierById.get("old-ming-fan");
  const neutral = baseTierById.get("objective-neutral");
  const qing = baseTierById.get("qing-fan");
  const newM = baseTierById.get("new-ming-fan");
  const moe = baseTierById.get("ming-leaning-moe");

  if (zhu && M >= 68 && H <= 40) {
    return wrap(score, zhu, random);
  }
  if (oldM && H >= 52 && M >= 52) {
    return wrap(score, oldM, random);
  }
  if (neutral && H >= 52 && M <= 38) {
    return wrap(score, neutral, random);
  }
  if (qing && H <= 32 && M <= 32) {
    return wrap(score, qing, random);
  }
  if (newM && H < 52 && M >= 48 && M < 68) {
    return wrap(score, newM, random);
  }
  if (moe) {
    return wrap(score, moe, random);
  }

  const fallback = neutral ?? moe ?? basicResultTiers[0];
  return wrap(score, fallback, random);
}

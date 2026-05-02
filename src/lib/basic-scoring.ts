import { basicResultTiers } from "@/data/basic-results";
import type { BasicOption, BasicQuestion, BasicResultId, BasicResultTier, BasicScoreAxis } from "@/data/types";

export type BasicAnswerMap = Record<string, string>;

export type BasicScore = Record<BasicScoreAxis, number>;

export type BasicResultEvaluation = {
  score: BasicScore;
  baseResult: BasicResultTier;
  displayResult: BasicResultTier;
};

/** 首个匹配的矩形即为结果（与 `basic-evaluation-standard.md` §6 优先级一致）。 */
const BASE_TIER_MATCH_ORDER: BasicResultId[] = [
  "objective-neutral",
  "ming-leaning-moe",
  "old-ming-fan",
  "new-ming-fan",
  "zhu-yuanzhang-dreamer"
];

function getSelectedOption(question: BasicQuestion, answerId: string): BasicOption | undefined {
  return question.options.find((option) => option.id === answerId);
}

function isScoreInRange(score: BasicScore, result: BasicResultTier): boolean {
  return (
    score.historyKnowledge >= result.historyKnowledge.min &&
    score.historyKnowledge <= result.historyKnowledge.max &&
    score.mingPreference >= result.mingPreference.min &&
    score.mingPreference <= result.mingPreference.max
  );
}

function getBaseTierMap(): Map<BasicResultId, BasicResultTier> {
  return new Map(
    basicResultTiers.filter((result) => !result.sourceResultId).map((tier) => [tier.id, tier])
  );
}

function getDisplayVariant(baseResult: BasicResultTier, random: () => number): BasicResultTier {
  const variant = basicResultTiers.find(
    (result) => result.sourceResultId === baseResult.id && random() < (result.displayChance ?? 0)
  );

  return variant ?? baseResult;
}

export function scoreBasicAnswers(questions: BasicQuestion[], answers: BasicAnswerMap): BasicScore {
  return questions.reduce<BasicScore>(
    (score, question) => {
      const answerId = answers[question.id];
      const selectedOption = answerId ? getSelectedOption(question, answerId) : undefined;

      if (!selectedOption) {
        return score;
      }

      return {
        historyKnowledge:
          score.historyKnowledge + selectedOption.score.historyKnowledge * question.weight,
        mingPreference: score.mingPreference + selectedOption.score.mingPreference * question.weight
      };
    },
    { historyKnowledge: 0, mingPreference: 0 }
  );
}

export function getBasicResult(
  score: BasicScore,
  random: () => number = Math.random
): BasicResultEvaluation {
  const baseMap = getBaseTierMap();

  for (const id of BASE_TIER_MATCH_ORDER) {
    const tier = baseMap.get(id);
    if (tier && isScoreInRange(score, tier)) {
      return {
        score,
        baseResult: tier,
        displayResult: getDisplayVariant(tier, random)
      };
    }
  }

  const fallback = baseMap.get("ming-leaning-moe") ?? basicResultTiers[0];

  return {
    score,
    baseResult: fallback,
    displayResult: getDisplayVariant(fallback, random)
  };
}

export function evaluateBasicAnswers(
  questions: BasicQuestion[],
  answers: BasicAnswerMap,
  random: () => number = Math.random
): BasicResultEvaluation {
  return getBasicResult(scoreBasicAnswers(questions, answers), random);
}

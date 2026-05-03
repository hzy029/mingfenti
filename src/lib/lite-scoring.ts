import { basicQuestions } from "@/data/basic-questions";
import type { TfQuestion } from "@/data/types";
import type { BasicScore } from "@/lib/basic-scoring";
import { BASIC_MAX_OPTION_SCORE } from "@/data/basic-test-config";

const questionById = new Map(basicQuestions.map((question) => [question.id, question]));

function scoreLiteDocumentQuestion(tf: TfQuestion, userSupport: boolean): BasicScore {
  const ls = tf.liteScoring;
  if (!ls) {
    return { historyKnowledge: 0, mingPreference: 0 };
  }

  const w = tf.weight;
  const unit = BASIC_MAX_OPTION_SCORE;
  const leanIsSupport = ls.lean === "支持";

  if (ls.mode === "extreme") {
    const mingAligned = userSupport === leanIsSupport;
    if (mingAligned) {
      return { mingPreference: unit * w, historyKnowledge: 0 };
    }
    return { mingPreference: 0, historyKnowledge: unit * w };
  }

  const rationalAligned = userSupport === leanIsSupport;
  if (rationalAligned) {
    return { mingPreference: 0, historyKnowledge: unit * w };
  }
  return { mingPreference: 2 * w, historyKnowledge: 1 * w };
}

export function scoreLiteAnswers(questions: TfQuestion[], answers: Record<string, boolean>): BasicScore {
  return questions.reduce<BasicScore>(
    (score, tf) => {
      const userTrue = answers[tf.id];
      if (typeof userTrue !== "boolean") {
        return score;
      }

      if (tf.liteScoring) {
        const delta = scoreLiteDocumentQuestion(tf, userTrue);
        return {
          historyKnowledge: score.historyKnowledge + delta.historyKnowledge,
          mingPreference: score.mingPreference + delta.mingPreference
        };
      }

      const base = questionById.get(tf.sourceQuestionId);
      if (!base) {
        return score;
      }

      const correct = userTrue === tf.correctTrue;
      const optId = correct ? "d" : "a";
      const option = base.options.find((o) => o.id === optId);
      if (!option) {
        return score;
      }

      return {
        historyKnowledge: score.historyKnowledge + option.score.historyKnowledge * tf.weight,
        mingPreference: score.mingPreference + option.score.mingPreference * tf.weight
      };
    },
    { historyKnowledge: 0, mingPreference: 0 }
  );
}

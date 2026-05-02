import { basicCoreQuestions } from "./basic-core-questions";
import { basicSupplementalQuestions } from "./basic-supplemental-questions";

export const basicQuestionBanks = {
  core: basicCoreQuestions,
  supplemental: basicSupplementalQuestions
} as const;

export const basicQuestions = [...basicCoreQuestions, ...basicSupplementalQuestions];

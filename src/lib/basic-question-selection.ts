import { basicCoreQuestions } from "@/data/basic-core-questions";
import { basicSupplementalQuestions } from "@/data/basic-supplemental-questions";
import {
  BASIC_CORE_DRAW_COUNT,
  BASIC_SUPPLEMENTAL_DRAW_COUNT
} from "@/data/basic-test-config";
import type { BasicQuestion } from "@/data/types";

function shuffleQuestions<T>(questions: T[], random: () => number): T[] {
  const shuffled = [...questions];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function drawQuestions(
  questions: BasicQuestion[],
  count: number,
  random: () => number
): BasicQuestion[] {
  return shuffleQuestions(questions, random).slice(0, count);
}

export function drawBasicTestQuestions(random: () => number = Math.random): BasicQuestion[] {
  const coreQuestions = drawQuestions(basicCoreQuestions, BASIC_CORE_DRAW_COUNT, random);
  const supplementalQuestions = drawQuestions(
    basicSupplementalQuestions,
    BASIC_SUPPLEMENTAL_DRAW_COUNT,
    random
  );

  return shuffleQuestions([...coreQuestions, ...supplementalQuestions], random).map((question, index) => ({
    ...question,
    order: index + 1
  }));
}

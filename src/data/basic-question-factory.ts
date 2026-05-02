import type { BasicOption, BasicQuestion, ReferenceTopicId, SampleCategoryId } from "./types";

const optionLabels = ["A", "B", "C", "D"] as const;

export type BasicQuestionInput = {
  id: string;
  order: number;
  category: string;
  title: string;
  tags?: string[];
  referenceTopicIds?: ReferenceTopicId[];
  sampleCategoryIds?: SampleCategoryId[];
  options: [string, string, string, string];
};

export function basicOptions(labels: [string, string, string, string]): BasicOption[] {
  return labels.map((label, index) => ({
    id: optionLabels[index].toLowerCase(),
    label,
    score: {
      historyKnowledge: [0, 1, 0, 3][index],
      mingPreference: [3, 2, 1, 0][index]
    }
  }));
}

export function buildBasicQuestion(
  bank: BasicQuestion["bank"],
  weight: BasicQuestion["weight"],
  input: BasicQuestionInput
): BasicQuestion {
  return {
    ...input,
    bank,
    weight,
    options: basicOptions(input.options)
  };
}

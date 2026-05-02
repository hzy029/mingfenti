import type { BasicQuestion, BasicResultId } from "@/data/types";
import type { BasicAnswerMap, BasicScore } from "@/lib/basic-scoring";

export const BASIC_TEST_SESSION_STORAGE_KEY = "mingqing-basic-test-session";

export type BasicTestSession = {
  questions: BasicQuestion[];
  answers: BasicAnswerMap;
  score: BasicScore;
  resultId: BasicResultId;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
};

import type { LiteBankEntry, LiteBankKind } from "@/lib/lite-bank-types";
import type { TfQuestion } from "@/data/types";
import {
  LITE_BANK_CORE_EXTREME,
  LITE_BANK_CORE_RATIONAL,
  LITE_BANK_ORDINARY_EXTREME,
  LITE_BANK_ORDINARY_RATIONAL
} from "@/data/lite-bank-data";

/** 与文档总题量比例对齐：44:20:15:13 → 20 题取 10:4:3:3 */
const LITE_DRAW = {
  coreExtreme: 10,
  coreRational: 4,
  ordinaryExtreme: 3,
  ordinaryRational: 3
} as const;

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const j = Math.floor(random() * (index + 1));
    const tmp = copy[index]!;
    copy[index] = copy[j]!;
    copy[j] = tmp;
  }
  return copy;
}

function categoryLabel(kind: LiteBankKind): string {
  switch (kind) {
    case "core-extreme":
      return "核心极端题";
    case "core-rational":
      return "核心理性题";
    case "ordinary-extreme":
      return "普通极端题";
    case "ordinary-rational":
      return "普通理性题";
    default:
      return "判断题";
  }
}

function entryToTfQuestion(entry: LiteBankEntry, order: number): TfQuestion {
  const isCore = entry.kind === "core-extreme" || entry.kind === "core-rational";
  return {
    id: `lite-${entry.id}-${order}`,
    sourceQuestionId: `lite-bank-${entry.id}`,
    variant: order % 2 === 0 ? "support" : "oppose",
    order,
    category: categoryLabel(entry.kind),
    bank: isCore ? "core" : "supplemental",
    weight: isCore ? 2 : 1,
    statement: entry.stem,
    correctTrue: false,
    liteScoring: { mode: entry.mode, lean: entry.lean }
  };
}

export function drawLiteTestQuestions(random: () => number = Math.random): TfQuestion[] {
  const extreme = shuffle(LITE_BANK_CORE_EXTREME, random).slice(0, LITE_DRAW.coreExtreme);
  const rational = shuffle(LITE_BANK_CORE_RATIONAL, random).slice(0, LITE_DRAW.coreRational);
  const ordEx = shuffle(LITE_BANK_ORDINARY_EXTREME, random).slice(0, LITE_DRAW.ordinaryExtreme);
  const ordRat = shuffle(LITE_BANK_ORDINARY_RATIONAL, random).slice(0, LITE_DRAW.ordinaryRational);

  const merged = shuffle([...extreme, ...rational, ...ordEx, ...ordRat], random);
  return merged.map((entry, index) => entryToTfQuestion(entry, index + 1));
}

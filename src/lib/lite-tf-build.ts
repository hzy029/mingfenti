import type { BasicQuestion, TfQuestion, TfQuestionVariant } from "@/data/types";

const MAX_SNIPPET = 110;

function shorten(text: string, max = MAX_SNIPPET): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) {
    return t;
  }
  return `${t.slice(0, max)}…`;
}

function optionLabel(question: BasicQuestion, optionId: string): string {
  return question.options.find((o) => o.id === optionId)?.label ?? "";
}

/**
 * 从四选一母题生成判断题陈述。
 * - oppose：嵌说明粉式辩护 + 常见甩锅，理性应答为「错」
 * - support：理性侧（D）摘要，理性应答为「对」
 */
export function buildTfQuestionFromBasic(
  question: BasicQuestion,
  variant: TfQuestionVariant,
  order: number
): TfQuestion {
  const a = shorten(optionLabel(question, "a"));
  const d = shorten(optionLabel(question, "d"));

  let statement: string;
  let correctTrue: boolean;

  if (variant === "oppose") {
    statement = `【反对】关于本题「${question.title}」，网络上常见的一种辩护是：${a}。也有人将争议归咎于清代修史抹黑，或斥之为「别有用心」。若你认为单凭这类说法就足以推翻学界对制度成本、财政与货币后果的主要共识，则上述判断成立。`;
    correctTrue = false;
  } else {
    statement = `【支持】关于本题「${question.title}」，更侧重史料机制与制度后果分析的表述是：${d}。若认可以上判断，则本题表述为真。`;
    correctTrue = true;
  }

  return {
    id: `${question.id}-tf-${variant}`,
    sourceQuestionId: question.id,
    variant,
    order,
    category: question.category,
    bank: question.bank,
    weight: question.weight,
    statement,
    correctTrue
  };
}

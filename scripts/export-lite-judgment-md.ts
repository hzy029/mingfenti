/**
 * 导出「普通版判断题」文档：拆分到 docs/详细设计/题库/lite/。
 * 每条题为段落形式三行：序号（二级标题）→ `题干：` → `（明粉）支持或反对：`，便于手工删改题干。
 * 用法：npm run export:lite-judgment-md
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { basicQuestions } from "../src/data/basic-questions";
import type { BasicQuestion, TfQuestionVariant } from "../src/data/types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LITE_DIR = join(__dirname, "..", "docs", "详细设计", "题库", "lite");

/** 题干压缩为一句、单一判断点（文档校对用，不要求与实现全文一致） */
function liteStem(question: BasicQuestion, variant: TfQuestionVariant): string {
  const topic = truncTopic(question.title, 32);
  if (variant === "oppose") {
    return `「${topic}」仅凭常见辩护话术即可推翻学界对制度成本与货币后果的主要共识。`;
  }
  return `「${topic}」更应依据史料机制与制度后果作出判断。`;
}

function truncTopic(title: string, max: number): string {
  const t = title.replace(/\s+/g, " ").replace(/[「」]/g, "").trim();
  if (t.length <= max) {
    return t;
  }
  return `${t.slice(0, max - 1)}…`;
}

/** 明粉更易误点的按钮（与答题页「支持 / 反对」一致） */
function mingfenMisclick(variant: TfQuestionVariant): string {
  return variant === "oppose" ? "支持" : "反对";
}

function liteDocSlug(question: BasicQuestion): string | null {
  if (question.bank === "core") {
    return "01-core";
  }
  if (question.bank !== "supplemental") {
    return null;
  }
  const id = question.id;
  if (id.startsWith("f")) {
    return "02-fiscal";
  }
  if (id.startsWith("m")) {
    return "03-military";
  }
  if (id.startsWith("a")) {
    return "04-administrative";
  }
  if (id.startsWith("h")) {
    return "05-horizontal";
  }
  if (id.startsWith("e")) {
    return "06-extended";
  }
  return null;
}

const SLUG_META: Record<
  string,
  { title: string; blurb: string }
> = {
  "01-core": {
    title: "普通版判断题 · 核心",
    blurb: "对应核心母题集（c001–c026）；实现上每题会取 oppose 或 support 模板之一。"
  },
  "02-fiscal": {
    title: "普通版判断题 · 财政",
    blurb: "补充题号段 f001–f019。"
  },
  "03-military": {
    title: "普通版判断题 · 军事",
    blurb: "补充题号段 m001–m007。"
  },
  "04-administrative": {
    title: "普通版判断题 · 行政",
    blurb: "补充题号段 a001–a006。"
  },
  "05-horizontal": {
    title: "普通版判断题 · 横向史观",
    blurb: "补充题号段 h001–h012。"
  },
  "06-extended": {
    title: "普通版判断题 · 扩展",
    blurb: "补充题号段 e001–e041。"
  }
};

const SLUG_ORDER = ["01-core", "02-fiscal", "03-military", "04-administrative", "05-horizontal", "06-extended"] as const;

function sortQuestionIds(a: BasicQuestion, b: BasicQuestion): number {
  return a.id.localeCompare(b.id, undefined, { numeric: true });
}

function formatParagraph(serial: string, stem: string, mingfen: string): string {
  return `## ${serial}\n\n题干：${stem}\n\n（明粉）支持或反对：${mingfen}\n\n`;
}

function buildBlocksForSlug(
  questions: BasicQuestion[],
  startSerial: number
): { text: string; nextSerial: number } {
  const sorted = [...questions].sort(sortQuestionIds);
  let chunk = "";
  let n = startSerial;
  for (const q of sorted) {
    for (const variant of ["oppose", "support"] as const) {
      n += 1;
      const serial = `L${String(n).padStart(3, "0")}`;
      chunk += formatParagraph(serial, liteStem(q, variant), mingfenMisclick(variant));
    }
  }
  return { text: chunk, nextSerial: n };
}

mkdirSync(LITE_DIR, { recursive: true });

let serial = 0;
const written: string[] = [];

for (const slug of SLUG_ORDER) {
  const questions = basicQuestions.filter((q) => liteDocSlug(q) === slug);
  if (questions.length === 0) {
    continue;
  }
  const meta = SLUG_META[slug];
  const { text, nextSerial } = buildBlocksForSlug(questions, serial);
  serial = nextSerial;

  const header = `# ${meta.title}

${meta.blurb}

`;

  const path = join(LITE_DIR, `${slug}.md`);
  writeFileSync(path, `${header}${text}`, "utf8");
  written.push(path);
}

console.log(`Wrote ${written.length} files under docs/详细设计/题库/lite/`);

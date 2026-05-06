/**
 * 从 docs/详细设计/题库/lite 下 Markdown 解析判断题，生成 src/data/lite-bank-data.ts。
 *
 * 用法：
 *   npx tsx scripts/generate-lite-bank-data.ts
 *   npx tsx scripts/generate-lite-bank-data.ts --check-only   # 只解析与校验题量，不写文件
 *   npx tsx scripts/generate-lite-bank-data.ts --verbose      # 打印各池题数
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { LiteBankEntry, LiteBankKind } from "../src/lib/lite-bank-types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DOCS_LITE = join(ROOT, "docs", "详细设计", "题库", "lite");
const OUT = join(ROOT, "src", "data", "lite-bank-data.ts");

/** 须与 `src/lib/lite-question-selection.ts` 中 `LITE_DRAW` 一致 */
const MIN_POOL = {
  coreExtreme: 10,
  coreRational: 4,
  ordinaryExtreme: 3,
  ordinaryRational: 3
} as const;

const HEADER_RE = /^## (E|R|OE|OR)(\d{3})\s*$/gm;

function kindFromPrefix(prefix: string): LiteBankKind {
  if (prefix === "E") {
    return "core-extreme";
  }
  if (prefix === "R") {
    return "core-rational";
  }
  if (prefix === "OE") {
    return "ordinary-extreme";
  }
  return "ordinary-rational";
}

function splitHeaderId(full: string): { prefix: string; num: string; id: string } {
  if (full.startsWith("OE") || full.startsWith("OR")) {
    return { prefix: full.slice(0, 2), num: full.slice(2), id: full };
  }
  return { prefix: full.slice(0, 1), num: full.slice(1), id: full };
}

function parseBlock(body: string, headerId: string): Omit<LiteBankEntry, "id" | "kind"> {
  const isRational = headerId.startsWith("R") || headerId.startsWith("OR");
  const mode: "extreme" | "rational" = isRational ? "rational" : "extreme";

  let stem = "";
  const stemMatch = body.match(/^\s*题干[：:]\s*(.+)$/m);
  if (stemMatch) {
    stem = stemMatch[1].trim();
  } else {
    const afterCore = body.split(/核心题[：:][^\n]*/).pop() ?? "";
    const candidate = afterCore
      .split(/\n/)
      .map((l) => l.trim())
      .find(
        (l) =>
          l.length > 0 &&
          !l.startsWith("类型") &&
          !l.startsWith("核心题") &&
          !l.startsWith("明粉倾向") &&
          !l.startsWith("理性倾向") &&
          !l.startsWith("材料来源")
      );
    stem = candidate?.replace(/^题干[：:]?\s*/, "").trim() ?? "";
  }

  const leanLine = isRational
    ? body.match(/^\s*理性倾向[：:]\s*(支持|反对)\s*$/m)
    : body.match(/^\s*明粉倾向[：:]\s*(支持|反对)\s*$/m);
  const leanRaw = leanLine?.[1];
  if (leanRaw !== "支持" && leanRaw !== "反对") {
    throw new Error(`[${headerId}] missing 明粉倾向/理性倾向`);
  }

  if (!stem) {
    throw new Error(`[${headerId}] empty stem`);
  }

  return { stem, lean: leanRaw, mode };
}

function parseFile(path: string, fileKind: LiteBankKind): LiteBankEntry[] {
  const raw = readFileSync(path, "utf8");
  const entries: LiteBankEntry[] = [];
  const matches = [...raw.matchAll(HEADER_RE)];
  for (let i = 0; i < matches.length; i += 1) {
    const m = matches[i];
    const fullHeader = `${m[1]}${m[2]}`;
    const { id } = splitHeaderId(fullHeader);
    const start = (m.index ?? 0) + m[0].length;
    const end = i + 1 < matches.length ? (matches[i + 1].index ?? raw.length) : raw.length;
    const blockBody = raw.slice(start, end);
    const parsed = parseBlock(blockBody, id);
    const { prefix } = splitHeaderId(fullHeader);
    const kind = kindFromPrefix(prefix);
    if (kind !== fileKind) {
      throw new Error(`header ${id} kind mismatch file ${fileKind}`);
    }
    entries.push({ id, kind, ...parsed });
  }
  return entries;
}

function assertPoolSizes(
  coreExtreme: LiteBankEntry[],
  coreRational: LiteBankEntry[],
  ordinaryExtreme: LiteBankEntry[],
  ordinaryRational: LiteBankEntry[]
): void {
  const checks: [string, number, number][] = [
    ["core-extreme (E)", coreExtreme.length, MIN_POOL.coreExtreme],
    ["core-rational (R)", coreRational.length, MIN_POOL.coreRational],
    ["ordinary-extreme (OE)", ordinaryExtreme.length, MIN_POOL.ordinaryExtreme],
    ["ordinary-rational (OR)", ordinaryRational.length, MIN_POOL.ordinaryRational]
  ];
  const bad = checks.filter(([, n, min]) => n < min);
  if (bad.length > 0) {
    const msg = bad.map(([name, n, min]) => `${name}: ${n} < ${min}`).join("; ");
    throw new Error(`题库题量不足以支撑当前抽题比例（LITE_DRAW）。${msg}`);
  }
}

function main(): void {
  const argv = process.argv.slice(2);
  const checkOnly = argv.includes("--check-only");
  const verbose = argv.includes("--verbose");

  const coreExtreme = parseFile(join(DOCS_LITE, "01-core-extreme.md"), "core-extreme");
  const coreRational = parseFile(join(DOCS_LITE, "02-core-rational.md"), "core-rational");
  const ordinaryExtreme = parseFile(join(DOCS_LITE, "ordinary", "01-ordinary-extreme.md"), "ordinary-extreme");
  const ordinaryRational = parseFile(join(DOCS_LITE, "ordinary", "02-ordinary-rational.md"), "ordinary-rational");

  assertPoolSizes(coreExtreme, coreRational, ordinaryExtreme, ordinaryRational);

  if (verbose) {
    console.log(
      JSON.stringify({
        coreExtreme: coreExtreme.length,
        coreRational: coreRational.length,
        ordinaryExtreme: ordinaryExtreme.length,
        ordinaryRational: ordinaryRational.length
      })
    );
  }

  const banner = `// Generated by scripts/generate-lite-bank-data.ts — run: npm run generate:lite-bank（或 generate:lite-bank:check）\n`;

  const fileBody = `${banner}
import type { LiteBankEntry } from "../lib/lite-bank-types";

export const LITE_BANK_CORE_EXTREME: readonly LiteBankEntry[] = ${JSON.stringify(coreExtreme, null, 2)} as const;

export const LITE_BANK_CORE_RATIONAL: readonly LiteBankEntry[] = ${JSON.stringify(coreRational, null, 2)} as const;

export const LITE_BANK_ORDINARY_EXTREME: readonly LiteBankEntry[] = ${JSON.stringify(ordinaryExtreme, null, 2)} as const;

export const LITE_BANK_ORDINARY_RATIONAL: readonly LiteBankEntry[] = ${JSON.stringify(ordinaryRational, null, 2)} as const;
`;

  if (checkOnly) {
    console.log(
      `check-only OK: E=${coreExtreme.length}, R=${coreRational.length}, OE=${ordinaryExtreme.length}, OR=${ordinaryRational.length} (>= ${MIN_POOL.coreExtreme}/${MIN_POOL.coreRational}/${MIN_POOL.ordinaryExtreme}/${MIN_POOL.ordinaryRational})`
    );
    return;
  }

  writeFileSync(OUT, fileBody, "utf8");
  console.log(
    `Wrote ${OUT} (E=${coreExtreme.length}, R=${coreRational.length}, OE=${ordinaryExtreme.length}, OR=${ordinaryRational.length})`
  );
}

main();

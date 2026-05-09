import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const refsRoot = path.join(rootDir, "docs", "references");
const articlesRoot = path.join(rootDir, "docs", "library", "articles");
const force = process.argv.includes("--force");

const defaultAuthor = "契科夫的变色龙";
const defaultZhihuUrl = "https://www.zhihu.com/people/khg9ng";
const defaultBilibiliUrl = "https://space.bilibili.com/23467654";

type RefKind = "papers" | "本人内容" | "zhihu";

function toPosixPath(value: string) {
  return value.split(path.sep).join("/");
}

function walkMarkdownFiles(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }

  return readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return walkMarkdownFiles(fullPath);
      }

      return entry.isFile() && entry.name.endsWith(".md") ? [fullPath] : [];
    })
    .sort((a, b) => a.localeCompare(b, "zh-CN"));
}

function shouldSkipSource(basename: string): boolean {
  const lower = basename.toLowerCase();

  if (lower === "readme.md") {
    return true;
  }

  if (lower === "bibliography.md" || lower === "topic-index.md") {
    return true;
  }

  if (/-ai检索索引\.md$/i.test(basename)) {
    return true;
  }

  return false;
}

function stripExistingFrontmatter(raw: string): string {
  if (!raw.startsWith("---\n")) {
    return raw;
  }

  const end = raw.indexOf("\n---", 4);

  if (end === -1) {
    return raw;
  }

  return raw.slice(end + 4).replace(/^\r?\n/, "");
}

function inferAuthorsFromPaperFilename(titleBase: string): string[] {
  const colonIdx = (() => {
    const a = titleBase.indexOf("：");
    const b = titleBase.indexOf(":");

    if (a === -1) {
      return b;
    }

    if (b === -1) {
      return a;
    }

    return Math.min(a, b);
  })();

  if (colonIdx !== -1) {
    const authorZone = titleBase.slice(0, colonIdx).trim();

    if (authorZone.length > 0 && authorZone.length <= 80) {
      const authors = splitMultiAuthors(authorZone);

      if (authors.length > 0) {
        return authors;
      }
    }
  }

  const commaIdx = (() => {
    const a = titleBase.indexOf(",");
    const b = titleBase.indexOf("，");

    if (a === -1) {
      return b;
    }

    if (b === -1) {
      return a;
    }

    return Math.min(a, b);
  })();

  if (commaIdx !== -1 && commaIdx < 24) {
    const part = titleBase.slice(0, commaIdx).trim();

    if (part.length > 0) {
      return splitMultiAuthors(part);
    }
  }

  return ["佚名"];
}

function splitMultiAuthors(segment: string): string[] {
  const pieces = segment
    .split(/\s*[,，]\s*/)
    .map((s) => s.trim())
    .filter(Boolean);

  return pieces.length > 0 ? pieces : [segment.trim()];
}

function inferYearFromFilename(base: string): string | undefined {
  const matches = base.match(/(?:19|20)\d{2}/g);

  if (!matches?.length) {
    return undefined;
  }

  return matches[matches.length - 1];
}

function makeSummary(body: string): string {
  const plain = body
    .replace(/^# .+$/gm, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#>*_`[\]()]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const slice = plain.slice(0, 280);

  return slice.length < plain.length ? `${slice}…` : slice;
}

function keywordsFromTitle(title: string): string[] {
  const parts = title
    .split(/[，。、；：:《》「」\s\-—\-+,]+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2 && s.length <= 24);

  const uniq = [...new Set(parts)];

  return uniq.slice(0, 12);
}

function aiUseFor(sourceType: "paper" | "zhihu" | "original"): string {
  if (sourceType === "paper") {
    return "检索明代财政、货币史相关论文论点与史料线索时优先查阅本文。";
  }

  if (sourceType === "zhihu") {
    return "检索知乎搬运类短文中的论点与常见表述时优先查阅本文。";
  }

  return "检索站主原创论述与综合评析时优先查阅本文。";
}

function yamlDoubleQuoted(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function yamlStringArray(values: string[]): string {
  return `[${values.map((v) => yamlDoubleQuoted(v)).join(", ")}]`;
}

function stableId(articlesRelativePosix: string): string {
  const hash = createHash("sha256").update(articlesRelativePosix, "utf8").digest("hex").slice(0, 16);

  return `lib_${hash}`;
}

function buildFrontmatterBlock(params: {
  id: string;
  title: string;
  theme: "paper-archive" | "song-ming-finance";
  sourceType: "paper" | "zhihu" | "original";
  authors: string[];
  date: string;
  summary: string;
  keywords: string[];
  aiUse: string;
}): string {
  const lines = [
    "---",
    `id: ${yamlDoubleQuoted(params.id)}`,
    `title: ${yamlDoubleQuoted(params.title)}`,
    `theme: ${params.theme}`,
    `secondaryThemes: []`,
    `sourceType: ${params.sourceType}`,
    `authors: ${yamlStringArray(params.authors)}`,
    `date: ${yamlDoubleQuoted(params.date)}`,
    `summary: ${yamlDoubleQuoted(params.summary)}`,
    `keywords: ${yamlStringArray(params.keywords)}`,
    `aiUse: ${yamlDoubleQuoted(params.aiUse)}`,
    `zhihuUrl: ${yamlDoubleQuoted(defaultZhihuUrl)}`,
    `bilibiliUrl: ${yamlDoubleQuoted(defaultBilibiliUrl)}`,
    `externalSourceUrl: `,
    `public: true`,
    "---",
    ""
  ];

  return lines.join("\n");
}

function destinationFor(kind: RefKind, sourceFile: string): string {
  const basename = path.basename(sourceFile);

  if (kind === "papers") {
    return path.join(articlesRoot, "paper-archive", basename);
  }

  if (kind === "本人内容") {
    return path.join(articlesRoot, "song-ming-finance", "本人内容", basename);
  }

  return path.join(articlesRoot, "song-ming-finance", "zhihu", basename);
}

function articlesRelativeKey(destAbsolute: string): string {
  return toPosixPath(path.relative(articlesRoot, destAbsolute)).replace(/\.md$/i, "");
}

function processMapping(kind: RefKind): { written: number; skipped: number } {
  const sourceDir = path.join(refsRoot, kind === "papers" ? "papers" : kind);
  let written = 0;
  let skipped = 0;

  if (!existsSync(sourceDir)) {
    console.warn(`跳过：源目录不存在 ${toPosixPath(path.relative(rootDir, sourceDir))}`);

    return { written: 0, skipped: 0 };
  }

  for (const filePath of walkMarkdownFiles(sourceDir)) {
    const base = path.basename(filePath);

    if (shouldSkipSource(base)) {
      skipped += 1;
      continue;
    }

    const rawFull = readFileSync(filePath, "utf8");
    const body = stripExistingFrontmatter(rawFull).trim();

    if (body.length === 0) {
      console.warn(`跳过空正文：${toPosixPath(path.relative(rootDir, filePath))}`);
      skipped += 1;
      continue;
    }

    const dest = destinationFor(kind, filePath);
    const title = path.basename(filePath, ".md");
    const relKey = `${articlesRelativeKey(dest)}.md`;
    const id = stableId(relKey);

    const theme: "paper-archive" | "song-ming-finance" =
      kind === "papers" ? "paper-archive" : "song-ming-finance";

    let sourceType: "paper" | "zhihu" | "original";
    let authors: string[];

    if (kind === "papers") {
      sourceType = "paper";
      authors = inferAuthorsFromPaperFilename(title);
    } else if (kind === "zhihu") {
      sourceType = "zhihu";
      authors = [defaultAuthor];
    } else {
      sourceType = "original";
      authors = [defaultAuthor];
    }

    const year = inferYearFromFilename(title);
    const date = year ?? new Date().toISOString().slice(0, 10);
    const summary = makeSummary(body);
    const keywords = keywordsFromTitle(title);
    const aiUse = aiUseFor(sourceType);
    const fm = buildFrontmatterBlock({
      id,
      title,
      theme,
      sourceType,
      authors,
      date,
      summary,
      keywords,
      aiUse
    });

    const output = `${fm}${body}\n`;

    if (existsSync(dest) && !force) {
      const existing = readFileSync(dest, "utf8");

      if (existing === output) {
        skipped += 1;
        continue;
      }

      skipped += 1;
      console.warn(`已存在且内容不同（使用 --force 覆盖）：${toPosixPath(path.relative(rootDir, dest))}`);
      continue;
    }

    mkdirSync(path.dirname(dest), { recursive: true });
    writeFileSync(dest, output, "utf8");
    written += 1;
  }

  return { written, skipped };
}

mkdirSync(articlesRoot, { recursive: true });

const p1 = processMapping("papers");
const p2 = processMapping("本人内容");
const p3 = processMapping("zhihu");

console.log(
  [
    `import-library-from-references 完成。`,
    `papers：写入 ${p1.written}，跳过 ${p1.skipped}`,
    `本人内容：写入 ${p2.written}，跳过 ${p2.skipped}`,
    `zhihu：写入 ${p3.written}，跳过 ${p3.skipped}`,
    force ? "模式：--force" : "模式：默认（存在且相同则跳过）"
  ].join("\n")
);

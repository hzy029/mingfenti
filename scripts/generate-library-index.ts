import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

type LibraryThemeId =
  | "song-ming-finance"
  | "zhu-dreamer"
  | "paper-archive";

type LibrarySourceType = "original" | "paper" | "zhihu" | "sample" | "note";

type Frontmatter = {
  id: string;
  title: string;
  theme: LibraryThemeId;
  secondaryThemes: LibraryThemeId[];
  sourceType: LibrarySourceType;
  authors: string[];
  date: string;
  summary: string;
  keywords: string[];
  aiUse: string;
  zhihuUrl?: string;
  bilibiliUrl?: string;
  externalSourceUrl?: string;
  public: boolean;
};

type LibraryArticle = Frontmatter & {
  slug: string;
  href: string;
  url: string;
  rawMarkdownUrl: string;
  wordCount: number;
  excerpt: string;
  body: string;
  rawMarkdown: string;
};

const rootDir = process.cwd();
const articlesDir = path.join(rootDir, "docs", "library", "articles");
const docsIndexPath = path.join(rootDir, "docs", "library", "library-AI检索索引.md");
const publicJsonPath = path.join(rootDir, "public", "ai", "library-index.json");
/** 必须与 `/library/[...slug]` 文章页错开前缀，否则 `/library/raw/...` 会被动态路由吃掉导致 404。 */
const publicRawDir = path.join(rootDir, "public", "library-raw");
const legacyPublicRawDir = path.join(rootDir, "public", "library", "raw");
const rawUrlPrefix = "/library-raw/";
const generatedTsPath = path.join(rootDir, "src", "data", "library-generated.ts");
const checkOnly = process.argv.includes("--check-only");
const siteUrl = "https://mingfen.sbs";
const defaultZhihuUrl = "https://www.zhihu.com/people/khg9ng";
const defaultBilibiliUrl = "https://space.bilibili.com/23467654";

const allowedThemes: LibraryThemeId[] = [
  "song-ming-finance",
  "zhu-dreamer",
  "paper-archive"
];

const allowedSourceTypes: LibrarySourceType[] = ["original", "paper", "zhihu", "sample", "note"];

const themeTitles: Record<LibraryThemeId, string> = {
  "song-ming-finance": "宋进明退论、宋明货币财政、洪武型财政的问题",
  "zhu-dreamer": "朱元璋梦男系列",
  "paper-archive": "搬运论文合集"
};

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

function parseScalar(raw: string): string | boolean {
  const value = raw.trim();

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return value.replace(/^["']|["']$/g, "");
}

function parseInlineArray(raw: string): string[] {
  const value = raw.trim();

  if (!value.startsWith("[") || !value.endsWith("]")) {
    return [String(parseScalar(value))].filter(Boolean);
  }

  const inner = value.slice(1, -1).trim();

  if (!inner) {
    return [];
  }

  return inner
    .split(",")
    .map((item) => item.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
}

function parseFrontmatter(filePath: string): { data: Record<string, unknown>; body: string; raw: string } {
  const raw = readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");

  if (!/^---\r?\n/.test(raw)) {
    throw new Error(`${filePath} 缺少 frontmatter 起始 ---`);
  }

  const end = raw.indexOf("\n---", 4);

  if (end === -1) {
    throw new Error(`${filePath} 缺少 frontmatter 结束 ---`);
  }

  const block = raw.slice(4, end).trim();
  const body = raw.slice(end + 4).replace(/^\r?\n/, "");
  const data: Record<string, unknown> = {};
  const lines = block.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf(":");

    if (separator === -1) {
      throw new Error(`${filePath} frontmatter 行格式错误：${line}`);
    }

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();

    data[key] = value.startsWith("[") ? parseInlineArray(value) : parseScalar(value);
  }

  return { data, body, raw };
}

function requiredString(data: Record<string, unknown>, key: keyof Frontmatter, filePath: string) {
  const value = data[key];

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${filePath} 缺少必填字符串字段 ${key}`);
  }

  return value.trim();
}

function requiredBoolean(data: Record<string, unknown>, key: keyof Frontmatter, filePath: string) {
  const value = data[key];

  if (typeof value !== "boolean") {
    throw new Error(`${filePath} 缺少必填布尔字段 ${key}`);
  }

  return value;
}

function requiredStringArray(data: Record<string, unknown>, key: keyof Frontmatter, filePath: string) {
  const value = data[key];

  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`${filePath} 缺少必填数组字段 ${key}`);
  }

  return value.map((item) => String(item).trim()).filter(Boolean);
}

function optionalString(data: Record<string, unknown>, key: keyof Frontmatter) {
  const value = data[key];

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}

function validateTheme(value: string, filePath: string): LibraryThemeId {
  if (!allowedThemes.includes(value as LibraryThemeId)) {
    throw new Error(`${filePath} 使用了非法主题 ${value}`);
  }

  return value as LibraryThemeId;
}

function validateSourceType(value: string, filePath: string): LibrarySourceType {
  if (!allowedSourceTypes.includes(value as LibrarySourceType)) {
    throw new Error(`${filePath} 使用了非法来源类型 ${value}`);
  }

  return value as LibrarySourceType;
}

function countCjkFriendlyWords(text: string) {
  const cjk = text.match(/[\u4e00-\u9fff]/g)?.length ?? 0;
  const words = text.match(/[A-Za-z0-9_]+/g)?.length ?? 0;

  return cjk + words;
}

function makeExcerpt(body: string) {
  return body
    .replace(/^# .+$/gm, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#>*_`[\]()]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);
}

/** 相对 `docs/library/articles` 的路径去掉 `.md`，拆成 URL 段（未编码）。`slug` 与之对应为 `segments.join('/')`。 */
function articlePathSegments(filePath: string): string[] {
  const rel = toPosixPath(path.relative(articlesDir, filePath));
  const normalized = rel.replace(/\.md$/i, "");

  return normalized.split("/").filter(Boolean);
}

function encodePathSegments(prefix: string, segments: string[]): string {
  return `${prefix}${segments.map((segment) => encodeURIComponent(segment)).join("/")}`;
}

function assertPublicJsonHasNoInternalPaths(jsonText: string) {
  const forbidden = ["docs/references", "docs/library/articles", "sourcePath", "sourceFile"];

  for (const needle of forbidden) {
    if (jsonText.includes(needle)) {
      throw new Error(`公开索引 JSON 不允许包含内部路径字段片段：${needle}`);
    }
  }
}

function loadArticles(): LibraryArticle[] {
  const files = walkMarkdownFiles(articlesDir);
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();

  return files.map((filePath) => {
    const { data, body, raw } = parseFrontmatter(filePath);
    const relPath = toPosixPath(path.relative(rootDir, filePath));
    const segments = articlePathSegments(filePath);

    if (segments.length < 2) {
      throw new Error(`${relPath} 须位于主题子目录下（例如 paper-archive/文章.md）`);
    }

    const slug = segments.join("/");
    const id = requiredString(data, "id", relPath);
    const themeFromPath = segments[0];

    if (!allowedThemes.includes(themeFromPath as LibraryThemeId)) {
      throw new Error(`${relPath} 首段目录 ${themeFromPath} 不是合法主题文件夹名`);
    }

    const theme = validateTheme(requiredString(data, "theme", relPath), relPath);

    if (theme !== themeFromPath) {
      throw new Error(`${relPath} frontmatter theme（${theme}）与文件路径首段（${themeFromPath}）不一致`);
    }

    const href = encodePathSegments("/library/", segments);
    const rawSegments = [...segments.slice(0, -1), `${segments[segments.length - 1]}.md`];
    const rawMarkdownPath = encodePathSegments(rawUrlPrefix, rawSegments);

    if (seenIds.has(id)) {
      throw new Error(`重复资料 ID：${id}`);
    }

    if (seenSlugs.has(slug)) {
      throw new Error(`重复资料路径 slug：${slug}`);
    }

    seenIds.add(id);
    seenSlugs.add(slug);

    const secondaryThemes = requiredStringArray(data, "secondaryThemes", relPath).map((value) =>
      validateTheme(value, relPath)
    );

    return {
      id,
      slug,
      title: requiredString(data, "title", relPath),
      theme,
      secondaryThemes,
      sourceType: validateSourceType(requiredString(data, "sourceType", relPath), relPath),
      authors: requiredStringArray(data, "authors", relPath),
      date: requiredString(data, "date", relPath),
      summary: requiredString(data, "summary", relPath),
      keywords: requiredStringArray(data, "keywords", relPath),
      aiUse: requiredString(data, "aiUse", relPath),
      zhihuUrl: optionalString(data, "zhihuUrl") ?? defaultZhihuUrl,
      bilibiliUrl: optionalString(data, "bilibiliUrl") ?? defaultBilibiliUrl,
      externalSourceUrl: optionalString(data, "externalSourceUrl"),
      public: requiredBoolean(data, "public", relPath),
      href,
      url: `${siteUrl}${href}`,
      rawMarkdownUrl: `${siteUrl}${rawMarkdownPath}`,
      wordCount: countCjkFriendlyWords(body),
      excerpt: makeExcerpt(body),
      body: body.trim(),
      rawMarkdown: raw.trim()
    };
  });
}

function buildGeneratedTs(articles: LibraryArticle[]) {
  const publicArticles = articles.filter((article) => article.public).map((article) => ({
    id: article.id,
    slug: article.slug,
    title: article.title,
    theme: article.theme,
    secondaryThemes: article.secondaryThemes,
    sourceType: article.sourceType,
    authors: article.authors,
    date: article.date,
    summary: article.summary,
    keywords: article.keywords,
    aiUse: article.aiUse,
    zhihuUrl: article.zhihuUrl,
    bilibiliUrl: article.bilibiliUrl,
    externalSourceUrl: article.externalSourceUrl,
    public: article.public,
    href: article.href,
    url: article.url,
    rawMarkdownUrl: article.rawMarkdownUrl,
    wordCount: article.wordCount,
    excerpt: article.excerpt,
    body: article.body
  }));

  return `import type { LibraryArticle, LibraryTheme } from "./types";

export const libraryThemes: LibraryTheme[] = ${JSON.stringify(
    allowedThemes.map((id) => ({
      id,
      title: themeTitles[id],
      description: {
        finance: "财政汲取、赋役结构、国家能力与制度成本。",
        currency: "宝钞、禁钱、白银化、铜钱流通与区域货币结构。",
        military: "边防供给、军费、卫所、战役与军事财政联动。",
        maritime: "海禁、下西洋、朝贡体系与海外开拓。",
        historiography: "宋明比较、学术争论、史观框架与方法批判。",
        "public-history": "公共历史传播、圈层话术、平台内容与科普争议。",
        "song-ming-finance": "宋明比较、货币财政、洪武型财政、海禁和军事财政等主线材料。",
        "zhu-dreamer": "朱元璋梦男、祖制护航、强人格投射和圈层话术样本。",
        "paper-archive": "论文搬运、论文摘录、书摘和学术资料汇编。"
      }[id]
    })),
    null,
    2
  )};

export const libraryArticles: LibraryArticle[] = ${JSON.stringify(publicArticles, null, 2)};
`;
}

function buildJsonIndex(articles: LibraryArticle[]) {
  const publicArticles = articles.filter((article) => article.public);

  return {
    generatedAt: new Date().toISOString(),
    articleCount: publicArticles.length,
    themes: allowedThemes.map((id) => ({ id, title: themeTitles[id] })),
    articles: publicArticles.map((article) => ({
      id: article.id,
      slug: article.slug,
      title: article.title,
      theme: article.theme,
      secondaryThemes: article.secondaryThemes,
      sourceType: article.sourceType,
      authors: article.authors,
      date: article.date,
      summary: article.summary,
      keywords: article.keywords,
      aiUse: article.aiUse,
      zhihuUrl: article.zhihuUrl,
      bilibiliUrl: article.bilibiliUrl,
      externalSourceUrl: article.externalSourceUrl,
      public: article.public,
      href: article.href,
      url: article.url,
      rawMarkdownUrl: article.rawMarkdownUrl,
      wordCount: article.wordCount,
      excerpt: article.excerpt
    }))
  };
}

function buildMarkdownIndex(articles: LibraryArticle[]) {
  const publicArticles = articles.filter((article) => article.public);
  const lines = [
    "# 主题资料库 · AI 检索索引",
    "",
    `生成时间：${new Date().toISOString()}`,
    "",
    "本文由 `npm run generate:library-index` 自动生成。优先阅读本索引定位文章；需要全文时打开线上文章页或 raw Markdown。",
    "",
    "## 主题入口",
    "",
    ...allowedThemes.map((theme) => {
      const count = publicArticles.filter(
        (article) => article.theme === theme || article.secondaryThemes.includes(theme)
      ).length;

      return `- **${themeTitles[theme]}**（\`${theme}\`）：${count} 篇`;
    }),
    "",
    "## 文章索引",
    ""
  ];

  for (const article of publicArticles) {
    lines.push(
      `### ${article.title}`,
      "",
      `- **网页：** ${article.url}`,
      `- **Markdown 原文：** ${article.rawMarkdownUrl}`,
      `- **主题：** ${themeTitles[article.theme]}${
        article.secondaryThemes.length > 0
          ? `；副主题：${article.secondaryThemes.map((theme) => themeTitles[theme]).join("、")}`
          : ""
      }`,
      `- **来源类型：** \`${article.sourceType}\`；作者：${article.authors.join("、")}`,
      `- **知乎：** ${article.zhihuUrl}`,
      `- **B 站：** ${article.bilibiliUrl}`,
      article.externalSourceUrl ? `- **外部来源：** ${article.externalSourceUrl}` : "",
      `- **摘要：** ${article.summary}`,
      `- **AI 使用：** ${article.aiUse}`,
      `- **关键词：** ${article.keywords.map((keyword) => `\`${keyword}\``).join(" ")}`,
      ""
    );
  }

  return `${lines.join("\n")}\n`;
}

function ensureParent(filePath: string) {
  mkdirSync(path.dirname(filePath), { recursive: true });
}

function rawOutputPathForArticle(slug: string): string {
  const parts = slug.split("/");
  const last = `${parts[parts.length - 1]}.md`;

  return path.join(publicRawDir, ...parts.slice(0, -1), last);
}

const articles = loadArticles();

if (articles.length === 0) {
  throw new Error("docs/library/articles/ 下没有可生成索引的 Markdown 文章");
}

const jsonPayload = buildJsonIndex(articles);
const jsonText = `${JSON.stringify(jsonPayload, null, 2)}\n`;

assertPublicJsonHasNoInternalPaths(jsonText);

const outputs = [
  { filePath: generatedTsPath, content: buildGeneratedTs(articles) },
  { filePath: publicJsonPath, content: jsonText },
  { filePath: docsIndexPath, content: buildMarkdownIndex(articles) },
  ...articles
    .filter((article) => article.public)
    .map((article) => ({
      filePath: rawOutputPathForArticle(article.slug),
      content: `\uFEFF${article.rawMarkdown}\n`
    }))
];

if (!checkOnly) {
  rmSync(publicRawDir, { recursive: true, force: true });
  mkdirSync(publicRawDir, { recursive: true });

  if (existsSync(legacyPublicRawDir)) {
    rmSync(legacyPublicRawDir, { recursive: true, force: true });
  }

  for (const output of outputs) {
    ensureParent(output.filePath);
    writeFileSync(output.filePath, output.content, "utf8");
  }
}

console.log(
  `${checkOnly ? "Checked" : "Generated"} library index for ${articles.length} article(s).`
);

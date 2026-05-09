import { ArrowLeft, Bot, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BoardMarkdownBody } from "@/components/board-markdown-body";
import { SiteHeader } from "@/components/site-header";
import { libraryArticles, libraryThemes } from "@/data/library-generated";
import type { LibrarySourceType, LibraryThemeId } from "@/data/types";

type LibraryArticlePageProps = {
  params: Promise<{
    slug: string[];
  }>;
};

const sourceLabels: Record<LibrarySourceType, string> = {
  original: "原创",
  paper: "论文",
  zhihu: "知乎",
  sample: "样本",
  note: "笔记"
};

function themeLabel(id: LibraryThemeId) {
  return libraryThemes.find((theme) => theme.id === id)?.title ?? id;
}

/** 个别环境下路由参数仍带百分号编码，或存在 NFC/NFD 差异；与 generate 脚本里的 href 规则对齐后再匹配。 */
function decodeSlugSegment(segment: string): string {
  try {
    return decodeURIComponent(segment.replace(/\+/g, " "));
  } catch {
    return segment;
  }
}

function normalizeSlugSegments(slug: string[] | undefined): string[] {
  if (!slug?.length) {
    return [];
  }

  return slug.filter(Boolean).map((s) => decodeSlugSegment(s).normalize("NFC"));
}

function findArticle(slug: string[] | undefined) {
  const segments = normalizeSlugSegments(slug);
  const key = segments.join("/");

  if (!key) {
    return undefined;
  }

  const direct = libraryArticles.find((item) => item.slug === key);

  if (direct) {
    return direct;
  }

  const keyNfc = key.normalize("NFC");
  const byNfc = libraryArticles.find((item) => item.slug.normalize("NFC") === keyNfc);

  if (byNfc) {
    return byNfc;
  }

  const hrefFromRequest = `/library/${segments.map((s) => encodeURIComponent(s)).join("/")}`;

  return libraryArticles.find((item) => item.href === hrefFromRequest);
}

export function generateStaticParams() {
  return libraryArticles.map((article) => ({
    slug: article.slug.split("/").filter(Boolean)
  }));
}

export async function generateMetadata({ params }: LibraryArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = findArticle(slug);

  if (!article) {
    return {
      title: "资料不存在"
    };
  }

  return {
    title: article.title,
    description: article.summary,
    alternates: {
      canonical: article.href
    },
    openGraph: {
      title: article.title,
      description: article.summary,
      url: article.url,
      type: "article"
    }
  };
}

export default async function LibraryArticlePage({ params }: LibraryArticlePageProps) {
  const { slug } = await params;
  const article = findArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-950">
      <SiteHeader />

      <article className="mx-auto max-w-4xl px-5 py-10">
        <Link className="inline-flex items-center gap-2 text-sm font-black text-[#4937db]" href="/library">
          <ArrowLeft size={16} />
          返回资料库
        </Link>

        <header className="mt-8 border-b border-slate-200 pb-8">
          <div className="flex flex-wrap gap-2 text-sm font-black">
            <span className="rounded bg-[#eef1ff] px-2.5 py-1 text-[#4937db]">{themeLabel(article.theme)}</span>
            <span className="rounded bg-slate-100 px-2.5 py-1 text-slate-600">{sourceLabels[article.sourceType]}</span>
            <span className="rounded bg-slate-100 px-2.5 py-1 text-slate-600">{article.date}</span>
          </div>

          <h1 className="mt-5 text-4xl font-black leading-tight md:text-5xl">{article.title}</h1>
          <p className="mt-5 text-lg font-bold leading-8 text-slate-600">{article.summary}</p>

          <dl className="mt-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-5 text-sm font-bold text-slate-600 md:grid-cols-2">
            <div>
              <dt className="font-black text-slate-950">作者</dt>
              <dd className="mt-1">{article.authors.join("、")}</dd>
            </div>
            <div>
              <dt className="font-black text-slate-950">Markdown 原文</dt>
              <dd className="mt-1">
                <a
                  className="inline-flex items-center gap-1 text-[#4937db] underline decoration-2 underline-offset-4"
                  href={article.rawMarkdownUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  查看原文
                  <ExternalLink size={13} />
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-black text-slate-950">副主题</dt>
              <dd className="mt-1">
                {article.secondaryThemes.length > 0
                  ? article.secondaryThemes.map((item) => themeLabel(item)).join("、")
                  : "无"}
              </dd>
            </div>
            <div>
              <dt className="font-black text-slate-950">外部链接</dt>
              <dd className="mt-2 flex flex-wrap gap-2">
                {article.zhihuUrl ? (
                  <a
                    className="inline-flex items-center gap-1 rounded bg-[#eef1ff] px-2.5 py-1 text-[#4937db]"
                    href={article.zhihuUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    知乎
                    <ExternalLink size={13} />
                  </a>
                ) : null}
                {article.bilibiliUrl ? (
                  <a
                    className="inline-flex items-center gap-1 rounded bg-[#eef1ff] px-2.5 py-1 text-[#4937db]"
                    href={article.bilibiliUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    B 站
                    <ExternalLink size={13} />
                  </a>
                ) : null}
                {article.externalSourceUrl ? (
                  <a
                    className="inline-flex items-center gap-1 rounded bg-slate-100 px-2.5 py-1 text-slate-700"
                    href={article.externalSourceUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    外部来源
                    <ExternalLink size={13} />
                  </a>
                ) : null}
              </dd>
            </div>
          </dl>

          <div className="mt-5 rounded-lg border border-[#4937db]/20 bg-[#eef1ff] p-5">
            <div className="flex items-center gap-2 text-base font-black text-[#4937db]">
              <Bot size={18} />
              AI 使用场景
            </div>
            <p className="mt-2 text-sm font-bold leading-7 text-slate-700">{article.aiUse}</p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {article.keywords.map((keyword, index) => (
              <span
                key={`${article.id}-${index}-${keyword}`}
                className="rounded bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600"
              >
                {keyword}
              </span>
            ))}
          </div>
        </header>

        <BoardMarkdownBody className="mt-8 rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200" markdown={article.body} />
      </article>
    </main>
  );
}

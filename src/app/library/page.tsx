import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "主题资料库 · 程序化索引",
  description: "本站资料全文通过结构化 JSON 与固定 URL 提供，供检索与程序化抓取；不设站内浏览列表。",
  robots: {
    index: false,
    follow: true
  },
  alternates: {
    canonical: "/library"
  }
};

export default function LibraryPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-950">
      <SiteHeader />

      <section className="mx-auto max-w-2xl px-5 py-16">
        <p className="text-sm font-black uppercase tracking-normal text-[#4937db]">Library</p>
        <h1 className="mt-3 text-3xl font-black leading-tight md:text-4xl">主题资料库</h1>
        <p className="mt-6 text-base font-bold leading-8 text-slate-600">
          本站不提供资料列表浏览入口。全文与元数据请使用下列<strong>机器可读索引</strong>（JSON），其中包含每篇文章的网页 URL、Markdown 原文 URL、摘要与关键词等字段。
        </p>
        <p className="mt-6">
          <a
            className="text-lg font-black text-[#4937db] underline decoration-2 underline-offset-4"
            href="/ai/library-index.json"
          >
            /ai/library-index.json
          </a>
        </p>
        <p className="mt-8 text-sm font-bold text-slate-500">
          若已知文章链接，仍可直达 HTML 正文页（路径形如 <code className="rounded bg-slate-100 px-1">/library/…</code>
          ）或 Markdown 原文（ <code className="rounded bg-slate-100 px-1">/library-raw/…</code>
          ）。本站首页导航不收录资料库入口。
        </p>
        <p className="mt-6">
          <Link className="text-sm font-black text-[#4937db] underline decoration-2 underline-offset-4" href="/">
            返回首页
          </Link>
        </p>
      </section>
    </main>
  );
}

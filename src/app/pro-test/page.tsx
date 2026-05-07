import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Pro 测试暂停访问",
  description: "Pro 测试当前暂停访问。请使用新明粉检测器普通测试。",
  robots: {
    index: false,
    follow: false
  }
};

export default function ProTestIntroPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-5 py-16 text-center">
        <p className="text-sm font-black text-[#4937db]">暂停访问</p>
        <h1 className="mt-3 text-4xl font-black leading-tight md:text-5xl">Pro 测试暂时关闭</h1>
        <p className="mt-6 text-lg font-bold leading-8 text-slate-600">
          Pro 版收到较多反馈，目前暂停访问并等待后续调整。当前公开测试入口为普通测试，完成后仍可生成结果并参与留言板讨论。
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link className="rounded-xl bg-[#4937db] px-6 py-3 text-lg font-black text-white" href="/test">
            前往普通测试
          </Link>
          <Link className="rounded-xl border border-slate-300 px-6 py-3 text-lg font-black text-slate-700" href="/">
            返回首页
          </Link>
        </div>
      </section>
    </main>
  );
}

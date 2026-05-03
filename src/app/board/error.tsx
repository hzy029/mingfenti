"use client";

import Link from "next/link";

export default function BoardErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  if (process.env.NODE_ENV === "development") {
    console.error("board error:", error);
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f8fafc] px-5 py-16 text-center text-slate-900">
      <p className="text-lg font-black text-[#b45309]">留言板加载失败</p>
      <p className="mt-3 max-w-md text-sm font-bold leading-7 text-slate-600">
        多为数据库尚未就绪或 Worker 未绑定 D1。请在 Cloudflare 对远程 D1 执行 schema.sql，保存 Worker 绑定后重新部署。
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          className="rounded-xl bg-[#4937db] px-6 py-3 text-sm font-black text-white"
          type="button"
          onClick={() => reset()}
        >
          重试
        </button>
        <Link className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-black text-slate-700" href="/board">
          返回留言板首页
        </Link>
        <Link className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-black text-slate-700" href="/">
          返回站点首页
        </Link>
      </div>
    </main>
  );
}

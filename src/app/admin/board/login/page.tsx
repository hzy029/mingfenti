"use client";

import { useAdminBoard } from "@/components/admin-board-provider";

export default function AdminBoardLoginPage() {
  const { secretInput, setSecretInput, persistSecret, importStoredSecret, loadTopics, status } = useAdminBoard();

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-black">登录</h1>
        <p className="mt-2 text-sm font-bold text-slate-400">
          在 Cloudflare / 本地环境变量中配置 <code className="text-slate-200">ADMIN_BOARD_SECRET</code>
          ，并在此输入相同密钥。密钥可保存在浏览器 sessionStorage。
        </p>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <label className="grid gap-2 text-sm font-black text-slate-200">
          管理密钥
          <input
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 font-bold text-slate-50 outline-none ring-[#6366f1]/40 focus:ring-2"
            type="password"
            value={secretInput}
            onChange={(event) => setSecretInput(event.target.value)}
          />
        </label>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            className="rounded-xl bg-[#6366f1] px-4 py-2 text-sm font-black text-white"
            type="button"
            onClick={persistSecret}
          >
            保存密钥并加载
          </button>
          <button
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-black text-slate-200"
            type="button"
            onClick={importStoredSecret}
          >
            从 sessionStorage 导入
          </button>
          <button
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-black text-slate-200"
            type="button"
            onClick={() => loadTopics()}
          >
            刷新主题
          </button>
        </div>
        {status ? <p className="mt-3 text-sm font-bold text-amber-300">{status}</p> : null}
      </section>
    </>
  );
}

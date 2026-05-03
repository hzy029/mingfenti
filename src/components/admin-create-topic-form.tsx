"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BoardMarkdownEditor } from "@/components/board-markdown-editor";

type AdminCreateTopicFormProps = {
  adminSecret: string;
  onCreated?: () => void;
};

export function AdminCreateTopicForm({ adminSecret, onCreated }: AdminCreateTopicFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const trimmedSecret = adminSecret.trim();

    if (!trimmedSecret) {
      setError("请先在上文保存管理密钥。");
      return;
    }

    setPending(true);

    try {
      const response = await fetch("/api/admin/board/topics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-board-secret": trimmedSecret
        },
        body: JSON.stringify({ title, description })
      });
      const payload = (await response.json()) as { ok?: boolean; topicId?: number; reason?: string };

      if (!response.ok || !payload.ok) {
        const reason = payload.reason;
        setError(
          reason === "title-required"
            ? "请填写标题"
            : reason === "unauthorized"
              ? "密钥与服务器 ADMIN_BOARD_SECRET 不一致。"
              : reason === "admin-not-configured"
                ? "服务端未设置 ADMIN_BOARD_SECRET：请在 Cloudflare Worker → 变量和机密中添加该 Secret，并重新部署。"
              : reason === "database-not-configured"
                ? "当前环境未连接 D1，无法创建主题（本地 dev 常见）。请在已部署站点操作。"
                : reason === "database-write-failed" || reason === "topic-create-failed"
                  ? "数据库写入失败：请确认远程 D1 已执行最新 schema.sql（至少含 board_topics）；若仍失败，查看 Worker 日志。"
                  : "创建失败，请稍后再试。"
        );
        setPending(false);
        return;
      }

      setTitle("");
      setDescription("");
      onCreated?.();
      router.refresh();
    } catch {
      setError("网络错误，请稍后再试。");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
      <h2 className="text-lg font-black text-slate-100">发布新主题（仅管理员）</h2>
      <p className="mt-2 text-xs font-bold text-slate-500">用户只能在主题下写回答与评论，不能自行开主题。</p>
      <form className="mt-4 grid gap-3" onSubmit={handleSubmit}>
        <label className="grid gap-1 text-xs font-black text-slate-300">
          标题
          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-bold text-slate-50"
            maxLength={200}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </label>
        <label className="grid gap-1 text-xs font-black text-slate-300">
          主题说明（可选，Markdown，显示在标题下方）
          <BoardMarkdownEditor
            maxLength={8000}
            minHeightClass="min-h-32"
            placeholder="支持 Markdown；图片仅可插入 https 外链。"
            textareaRequired={false}
            tone="dark"
            value={description}
            onChange={setDescription}
          />
        </label>
        {error ? <p className="text-xs font-bold text-amber-400">{error}</p> : null}
        <button
          className="inline-flex justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-black text-white disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? "发布中…" : "发布主题"}
        </button>
      </form>
    </section>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { BoardMarkdownEditor } from "@/components/board-markdown-editor";

type AdminTopicCreateAnswerProps = {
  topicId: number;
  adminSecret: string;
  onPosted: () => void;
};

function buildAuthHeaders(secret: string) {
  return { "x-admin-board-secret": secret };
}

export function AdminTopicCreateAnswer({ topicId, adminSecret, onPosted }: AdminTopicCreateAnswerProps) {
  const [authorDisplay, setAuthorDisplay] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const trimmed = adminSecret.trim();

    if (!trimmed) {
      setError("请先保存管理密钥");
      return;
    }

    setPending(true);

    try {
      const response = await fetch(`/api/admin/board/topics/${topicId}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...buildAuthHeaders(trimmed)
        },
        body: JSON.stringify({ body, authorDisplay })
      });
      const payload = (await response.json()) as { ok?: boolean; reason?: string };

      if (!response.ok || !payload.ok) {
        setError(payload.reason === "body-required" ? "请填写回答正文" : "发布失败");
        setPending(false);
        return;
      }

      setBody("");
      setAuthorDisplay("");
      onPosted();
    } catch {
      setError("网络错误");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mb-6 rounded-2xl border border-slate-700 bg-slate-900/80 p-4 sm:p-6">
      <h2 className="text-base font-black text-slate-100">管理员发布回答</h2>
      <p className="mt-1 text-xs font-bold text-slate-500">跳过 AI 审核，直接以已发布状态写入该主题。</p>
      <form className="mt-4 grid gap-3" onSubmit={(e) => void handleSubmit(e)}>
        <label className="grid gap-1 text-xs font-black text-slate-300">
          显示昵称（可选）
          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-bold text-slate-50"
            maxLength={64}
            value={authorDisplay}
            onChange={(event) => setAuthorDisplay(event.target.value)}
          />
        </label>
        <label className="grid gap-1 text-xs font-black text-slate-300">
          正文（Markdown）
          <BoardMarkdownEditor
            maxLength={8000}
            minHeightClass="min-h-36"
            placeholder="管理员代发回答…"
            textareaRequired={false}
            tone="dark"
            value={body}
            onChange={setBody}
          />
        </label>
        {error ? <p className="text-xs font-bold text-amber-400">{error}</p> : null}
        <button
          className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-black text-white disabled:opacity-50"
          disabled={pending}
          type="submit"
        >
          {pending ? "发布中…" : "发布回答"}
        </button>
      </form>
    </section>
  );
}

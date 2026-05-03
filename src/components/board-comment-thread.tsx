"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BoardMarkdownBody } from "@/components/board-markdown-body";
import { BoardMarkdownEditor } from "@/components/board-markdown-editor";
import { BoardCommentLikeButton } from "@/components/board-comment-like-button";

export type BoardCommentPublicRow = {
  id: number;
  author_display: string | null;
  body: string;
  heat_score: number;
  created_at: string;
};

type BoardCommentThreadProps = {
  answerId: number;
  comments: BoardCommentPublicRow[];
};

export function BoardCommentThread({ answerId, comments: initialComments }: BoardCommentThreadProps) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [authorDisplay, setAuthorDisplay] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const response = await fetch(`/api/board/posts/${answerId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, authorDisplay })
      });
      const payload = (await response.json()) as { ok?: boolean; reason?: string };

      if (!response.ok || !payload.ok) {
        setError(payload.reason === "body-required" ? "请填写评论正文" : "发布失败，请稍后再试。");
        setPending(false);
        return;
      }

      setBody("");
      setAuthorDisplay("");
      router.refresh();
    } catch {
      setError("网络错误，请稍后再试。");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">评论区</p>
      <ul className="mt-3 space-y-3">
        {initialComments.map((comment) => (
          <li key={comment.id} className="rounded-lg bg-slate-50 px-3 py-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-500">
                {comment.author_display ?? "匿名"}
                <span className="ml-2 text-slate-400">{comment.created_at}</span>
              </span>
              <BoardCommentLikeButton commentId={comment.id} initialHeat={comment.heat_score} />
            </div>
            <BoardMarkdownBody className="mt-1.5 text-sm" markdown={comment.body} />
          </li>
        ))}
      </ul>
      <form className="mt-4 grid gap-3" onSubmit={handleSubmit}>
        <p className="text-xs font-bold text-slate-600">
          发表评论：填写<strong className="text-slate-800">昵称（可选）</strong>与<strong className="text-slate-800">正文</strong>；正文支持与回答相同的 Markdown 与工具栏（图片仅可插入
          <strong className="text-slate-800">https</strong> 外链）。
        </p>
        <label className="grid gap-1.5 text-sm font-bold text-slate-700">
          昵称（可选）
          <input
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 outline-none ring-[#4937db]/25 focus:ring-2"
            maxLength={64}
            placeholder="例如：明史爱好者"
            value={authorDisplay}
            onChange={(event) => setAuthorDisplay(event.target.value)}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-bold text-slate-700">
          评论正文（Markdown）
          <BoardMarkdownEditor
            maxLength={4000}
            minHeightClass="min-h-28"
            placeholder="支持 Markdown；图片请使用 https 图床链接。"
            textareaRequired
            value={body}
            onChange={setBody}
          />
        </label>
        <div>
          <button
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-black text-white transition hover:bg-slate-900 disabled:opacity-60"
            disabled={pending}
            type="submit"
          >
            {pending ? "发送中…" : "发布评论"}
          </button>
        </div>
        {error ? <p className="text-xs font-bold text-red-600">{error}</p> : null}
      </form>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BoardMarkdownBody } from "@/components/board-markdown-body";
import { BoardMarkdownEditor } from "@/components/board-markdown-editor";
import { readBasicTestResultId, useBoardPostPermission } from "@/hooks/use-board-post-permission";

export type BoardCommentPublicRow = {
  id: number;
  author_display: string | null;
  body: string;
  created_at: string;
};

type BoardCommentThreadProps = {
  answerId: number;
  comments: BoardCommentPublicRow[];
};

export function BoardCommentThread({ answerId, comments: initialComments }: BoardCommentThreadProps) {
  const router = useRouter();
  const { ready, canPost } = useBoardPostPermission();
  const [body, setBody] = useState("");
  const [authorDisplay, setAuthorDisplay] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setPending(true);

    const resultId = readBasicTestResultId();

    try {
      const response = await fetch(`/api/board/posts/${answerId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, authorDisplay, resultId })
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        reason?: string;
        message?: string;
        reviewStatus?: string;
      };

      if (!response.ok || !payload.ok) {
        if (payload.reason === "board-post-not-eligible") {
          setError(payload.message ?? "发表评论需先完成普通版测试并取得发帖资格。");
        } else if (payload.reason === "daily-limit-exceeded") {
          setError(payload.message ?? "今日发帖次数已达上限。");
        } else if (payload.reason === "site-daily-limit") {
          setError(payload.message ?? "本站今日留言名额已满，请明天再来。");
        } else if (payload.reason === "body-required") {
          setError("请填写评论正文");
        } else {
          setError("发布失败，请稍后再试。");
        }
        setPending(false);
        return;
      }

      setBody("");
      setAuthorDisplay("");
      setMessage(payload.reviewStatus === "published" ? "发布成功，评论已显示。" : "提交成功，内容已进入审核，通过后将会显示。");
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
            </div>
            <BoardMarkdownBody className="mt-1.5 text-sm" markdown={comment.body} />
          </li>
        ))}
      </ul>

      {!ready ? (
        <p className="mt-4 text-xs font-bold text-slate-500">加载权限信息…</p>
      ) : !canPost ? (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold leading-6 text-amber-900">
          发表评论需先完成测验（
          <Link className="mx-1 font-black text-[#4937db] underline" href="/test">
            普通
          </Link>
          /
          <Link className="mx-1 font-black text-[#4937db] underline" href="/pro-test">
            Pro
          </Link>
          ）并取得发帖资格。
        </p>
      ) : (
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
          {message ? <p className="text-xs font-bold text-emerald-700">{message}</p> : null}
        </form>
      )}
    </div>
  );
}

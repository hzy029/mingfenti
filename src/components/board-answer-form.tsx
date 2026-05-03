"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BoardMarkdownEditor } from "@/components/board-markdown-editor";
import { readBasicTestResultId, useBoardPostPermission } from "@/hooks/use-board-post-permission";

type BoardAnswerFormProps = {
  topicId: number;
};

export function BoardAnswerForm({ topicId }: BoardAnswerFormProps) {
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
      const response = await fetch(`/api/board/topics/${topicId}/posts`, {
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
          setError(payload.message ?? "发布回答需先完成普通版测试并取得发帖资格。");
        } else if (payload.reason === "daily-limit-exceeded") {
          setError(payload.message ?? "今日发帖次数已达上限。");
        } else if (payload.reason === "site-daily-limit") {
          setError(payload.message ?? "本站今日留言名额已满，请明天再来。");
        } else if (payload.reason === "body-required") {
          setError("请填写回答内容");
        } else {
          setError("发布失败，请稍后再试。");
        }
        setPending(false);
        return;
      }

      setBody("");
      setAuthorDisplay("");
      setMessage(payload.reviewStatus === "published" ? "发布成功，回答已显示。" : "提交成功，内容已进入审核，通过后将会显示在本主题下。");
      router.refresh();
    } catch {
      setError("网络错误，请稍后再试。");
    } finally {
      setPending(false);
    }
  }

  if (!ready) {
    return (
      <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <p className="text-sm font-bold text-slate-500">加载权限信息…</p>
      </div>
    );
  }

  if (!canPost) {
    return (
      <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="text-lg font-black text-amber-950">写回答</h2>
        <p className="mt-3 text-sm font-bold leading-7 text-amber-900">
          浏览主题与回答不受限；发布回答需先完成测验（
          <Link className="mx-1 font-black text-[#4937db] underline" href="/test">
            普通测试
          </Link>
          或
          <Link className="mx-1 font-black text-[#4937db] underline" href="/pro-test">
            Pro 测试
          </Link>
          ）并取得发帖资格（以当前浏览器会话为准）。
        </p>
      </section>
    );
  }

  return (
    <form className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-6" onSubmit={handleSubmit}>
      <h2 className="text-xl font-black text-slate-900">写回答</h2>
      <p className="mt-2 text-sm font-bold text-slate-600">
        回答支持 Markdown：撤销/重做、标题下拉、加粗斜体、列表、目录模板、引用、分割线、代码块、脚注、图片（https 外链）、链接等；与评论区工具栏一致。
      </p>
      <label className="grid gap-2 text-sm font-bold text-slate-700">
        显示昵称（可选）
        <input
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 outline-none ring-[#4937db]/30 focus:ring-2"
          maxLength={64}
          value={authorDisplay}
          onChange={(event) => setAuthorDisplay(event.target.value)}
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-slate-700">
        回答内容（Markdown）
        <BoardMarkdownEditor
          maxLength={8000}
          placeholder="条理、史料或观点均可，理性讨论。支持 Markdown。"
          value={body}
          onChange={setBody}
        />
      </label>
      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
      {message ? <p className="text-sm font-bold text-emerald-700">{message}</p> : null}
      <button
        className="inline-flex justify-center rounded-xl bg-[#4937db] px-5 py-3 text-lg font-black text-white transition hover:bg-[#3b2fc4] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "发布中…" : "发布回答"}
      </button>
    </form>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BoardMarkdownEditor } from "@/components/board-markdown-editor";

type BoardAnswerFormProps = {
  topicId: number;
};

export function BoardAnswerForm({ topicId }: BoardAnswerFormProps) {
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
      const response = await fetch(`/api/board/topics/${topicId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, authorDisplay })
      });
      const payload = (await response.json()) as { ok?: boolean; reason?: string };

      if (!response.ok || !payload.ok) {
        setError(payload.reason === "body-required" ? "请填写回答内容" : "发布失败，请稍后再试。");
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

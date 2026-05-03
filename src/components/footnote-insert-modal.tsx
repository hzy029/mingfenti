"use client";

import { useState } from "react";

export type FootnoteInsertPayload = {
  n: number;
  text: string;
  url: string;
};

type FootnoteInsertModalProps = {
  open: boolean;
  tone: "light" | "dark";
  suggestedN: number;
  onClose: () => void;
  onInsert: (payload: FootnoteInsertPayload) => void;
};

export function FootnoteInsertModal({ open, tone, suggestedN, onClose, onInsert }: FootnoteInsertModalProps) {
  const dark = tone === "dark";
  const [n, setN] = useState(suggestedN);
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");

  if (!open) {
    return null;
  }

  const panel = dark
    ? "border-slate-600 bg-slate-900 text-slate-100 shadow-xl"
    : "border-slate-200 bg-white text-slate-900 shadow-xl";
  const input = dark
    ? "border-slate-600 bg-slate-950 text-slate-50 placeholder:text-slate-500"
    : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400";
  const labelCls = dark ? "text-slate-400" : "text-slate-500";

  const maxOption = Math.max(30, suggestedN + 5);
  const numberOptions = Array.from({ length: maxOption }, (_, index) => index + 1);

  function submit() {
    const trimmed = text.trim();

    if (!trimmed) {
      window.alert("请填写注释文本。");
      return;
    }

    const u = url.trim();

    if (u && !/^https?:\/\//i.test(u)) {
      window.alert("链接须以 http:// 或 https:// 开头，或留空。");
      return;
    }

    onInsert({ n, text: trimmed, url: u });
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-8" role="dialog">
      <div className={`w-full max-w-lg rounded-2xl border p-6 ${panel}`}>
        <h2 className="text-center text-lg font-black">插入注释</h2>

        <div className="mt-5 grid gap-4">
          <div className="grid gap-2 sm:grid-cols-[8rem_1fr] sm:items-center">
            <label className={`text-sm font-bold ${labelCls}`}>编号</label>
            <select
              aria-label="脚注编号"
              className={`rounded-xl border px-3 py-2.5 text-sm font-bold ${input}`}
              value={n}
              onChange={(event) => setN(Number.parseInt(event.target.value, 10))}
            >
              {numberOptions.map((num) => (
                <option key={num} value={num}>
                  [{num}] {num === suggestedN ? "新注释" : ""}
                </option>
              ))}
            </select>
          </div>

          <label className="grid gap-2">
            <span className={`text-sm font-bold ${labelCls}`}>注释文本</span>
            <textarea
              className={`min-h-[88px] rounded-xl border px-3 py-2.5 text-sm font-bold leading-6 ${input}`}
              placeholder="输入注释文本"
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
          </label>

          <label className="grid gap-2">
            <span className={`text-sm font-bold ${labelCls}`}>链接地址（可选）</span>
            <input
              className={`rounded-xl border px-3 py-2.5 text-sm font-bold ${input}`}
              placeholder="输入链接地址"
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
            />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            className={`rounded-xl border px-5 py-2.5 text-sm font-black ${
              dark ? "border-slate-600 text-slate-200 hover:bg-slate-800" : "border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
            type="button"
            onClick={onClose}
          >
            取消
          </button>
          <button
            className={`rounded-xl px-5 py-2.5 text-sm font-black text-white ${
              dark ? "bg-[#6366f1] hover:bg-[#5558e3]" : "bg-[#4937db] hover:bg-[#3b2fc4]"
            }`}
            type="button"
            onClick={submit}
          >
            插入
          </button>
        </div>
      </div>
    </div>
  );
}

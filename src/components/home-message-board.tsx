"use client";

import { ChevronRight, MessagesSquare } from "lucide-react";
import Link from "next/link";
import type { BoardHomeSlide } from "@/lib/board-home-data";

type HomeMessageBoardProps = {
  pin: BoardHomeSlide | null;
  embedded?: boolean;
};

function SlideCard({ label, slide }: { label: string; slide: BoardHomeSlide }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-black uppercase tracking-wide text-[#4937db]">{label}</p>
      <h3 className="mt-3 text-xl font-black leading-snug text-slate-900 md:text-2xl">{slide.topicTitle}</h3>
      {slide.topPostPreview ? (
        <p className="mt-4 text-base font-bold leading-7 text-slate-600">{slide.topPostPreview}</p>
      ) : (
        <p className="mt-4 text-base font-bold text-slate-400">该主题下还没有公开回答。</p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-bold text-slate-400">
        <span>管理员置顶展示</span>
        {slide.pinWeight > 0 ? (
          <span className="rounded-full bg-[#fef08a] px-2 py-0.5 text-xs font-black text-[#854d0e]">
            置顶权值 {slide.pinWeight}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function HomeMessageBoard({ pin, embedded = false }: HomeMessageBoardProps) {
  const shellClass = embedded
    ? "border-0 bg-transparent p-0 shadow-none"
    : "rounded-2xl border border-slate-200 bg-white p-8 shadow-sm";

  if (!pin) {
    return (
      <article className={shellClass}>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3e7ff] text-[#141537]">
          <MessagesSquare size={30} />
        </div>
        <h2 className="mt-6 text-3xl font-black text-slate-900">留言板</h2>
        <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">
          暂无首页展示主题。管理员发布主题并设置置顶权值后，将在这里展示。
        </p>
        <Link className="mt-7 inline-flex items-center gap-2 text-lg font-black text-[#4937db]" href="/board">
          进入留言板
          <ChevronRight size={18} />
        </Link>
      </article>
    );
  }

  return (
    <article
      className={[
        "overflow-hidden",
        embedded
          ? "border-0 bg-gradient-to-br from-transparent to-transparent p-0 shadow-none"
          : "rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-sm"
      ].join(" ")}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3e7ff] text-[#141537]">
            <MessagesSquare size={30} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900">留言板</h2>
            <p className="mt-1 text-sm font-bold text-slate-500">管理员置顶主题预览</p>
          </div>
        </div>
        <Link
          className="inline-flex items-center gap-2 rounded-full bg-[#4937db] px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-[#3b2fc4]"
          href="/board"
        >
          进入留言板
          <ChevronRight size={16} />
        </Link>
      </div>

      <div className="mt-8">
        <SlideCard label="站内置顶主题" slide={pin} />
      </div>
    </article>
  );
}

"use client";

import { ChevronLeft, ChevronRight, MessagesSquare } from "lucide-react";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import type { BoardHomeSlide } from "@/lib/board-home-data";

type HomeMessageBoardProps = {
  pin: BoardHomeSlide | null;
  hotTen: BoardHomeSlide[];
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
        {slide.topPostHeat > 0 ? <span>最高热度回答 · 热度 {slide.topPostHeat}</span> : <span>热度随「赞同」累积</span>}
        {slide.pinWeight > 0 ? <span className="rounded-full bg-[#fef08a] px-2 py-0.5 text-xs font-black text-[#854d0e]">置顶权值 {slide.pinWeight}</span> : null}
      </div>
    </div>
  );
}

export function HomeMessageBoard({ pin, hotTen }: HomeMessageBoardProps) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const total = hotTen.length;
  const current = total > 0 ? hotTen[Math.min(index, total - 1)] : undefined;

  const goPrev = useCallback(() => {
    setIndex((value) => (total <= 0 ? 0 : (value - 1 + total) % total));
  }, [total]);

  const goNext = useCallback(() => {
    setIndex((value) => (total <= 0 ? 0 : (value + 1) % total));
  }, [total]);

  const empty = !pin && total === 0;

  if (empty) {
    return (
      <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3e7ff] text-[#141537]">
          <MessagesSquare size={30} />
        </div>
        <h2 className="mt-6 text-3xl font-black text-slate-900">留言板</h2>
        <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">暂无主题。管理员发布主题后，用户可在主题下写回答与评论。</p>
        <Link className="mt-7 inline-flex items-center gap-2 text-lg font-black text-[#4937db]" href="/board">
          进入留言板
          <ChevronRight size={18} />
        </Link>
      </article>
    );
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3e7ff] text-[#141537]">
            <MessagesSquare size={30} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900">留言板</h2>
            <p className="mt-1 text-sm font-bold text-slate-500">置顶预览 + 热门主题滑动浏览</p>
          </div>
        </div>
        <Link className="inline-flex items-center gap-2 rounded-full bg-[#4937db] px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-[#3b2fc4]" href="/board">
          进入留言板
          <ChevronRight size={16} />
        </Link>
      </div>

      {pin ? (
        <div className="mt-8">
          <SlideCard label="站内置顶（权值最高主题）" slide={pin} />
        </div>
      ) : null}

      {total > 0 && current ? (
        <div
          className="mt-8 select-none"
          onTouchEnd={(event) => {
            const startX = touchStartX.current;

            if (startX === null) {
              return;
            }

            touchStartX.current = null;
            const endX = event.changedTouches[0]?.clientX;

            if (typeof endX !== "number") {
              return;
            }

            const delta = endX - startX;

            if (delta > 48) {
              goPrev();
            } else if (delta < -48) {
              goNext();
            }
          }}
          onTouchStart={(event) => {
            touchStartX.current = event.touches[0]?.clientX ?? null;
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-black text-slate-600">热门主题（共 {total} 个）· 左右滑动或点击箭头切换</p>
            <div className="flex items-center gap-2">
              <button
                aria-label="上一主题"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:border-[#4937db]/40"
                type="button"
                onClick={goPrev}
              >
                <ChevronLeft size={22} />
              </button>
              <span className="min-w-[3.5rem] text-center text-sm font-black text-slate-500">
                {index + 1} / {total}
              </span>
              <button
                aria-label="下一主题"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:border-[#4937db]/40"
                type="button"
                onClick={goNext}
              >
                <ChevronRight size={22} />
              </button>
            </div>
          </div>

          <div className="mt-4">
            <SlideCard label="当前热门主题" slide={current} />
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {hotTen.map((slide, dotIndex) => (
              <button
                key={slide.topicId}
                aria-label={`切换到第 ${dotIndex + 1} 个热门主题`}
                className={[
                  "h-2.5 w-2.5 rounded-full transition",
                  dotIndex === Math.min(index, total - 1) ? "bg-[#4937db]" : "bg-slate-300 hover:bg-slate-400"
                ].join(" ")}
                type="button"
                onClick={() => setIndex(dotIndex)}
              />
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-6 text-sm font-bold text-slate-500">热门列表暂无数据；有回答并点赞后会按热度排序展示。</p>
      )}
    </article>
  );
}

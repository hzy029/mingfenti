"use client";

import { ArrowRight, ChevronLeft, ChevronRight, FlaskConical } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { HomeMessageBoard } from "@/components/home-message-board";
import type { BoardHomeSlide } from "@/lib/board-home-data";

type HomeTestBoardCarouselProps = {
  pin: BoardHomeSlide | null;
  hotTen: BoardHomeSlide[];
};

export function HomeTestBoardCarousel({ pin }: HomeTestBoardCarouselProps) {
  const [panel, setPanel] = useState(0);
  const flip = () => setPanel((panel + 1) % 2);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <button
            className={[
              "rounded-full px-4 py-2 text-sm font-black transition",
              panel === 0 ? "bg-[#4937db] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            ].join(" ")}
            type="button"
            onClick={() => setPanel(0)}
          >
            留言板
          </button>
          <button
            className={[
              "rounded-full px-4 py-2 text-sm font-black transition",
              panel === 1 ? "bg-[#4937db] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            ].join(" ")}
            type="button"
            onClick={() => setPanel(1)}
          >
            标准鉴定
          </button>
        </div>
        <p className="text-xs font-bold text-slate-400">可点标签或箭头切换</p>
        <div className="flex items-center gap-2">
          <button
            aria-label="上一屏"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:border-[#4937db]/40"
            type="button"
            onClick={flip}
          >
            <ChevronLeft size={22} />
          </button>
          <button
            aria-label="下一屏"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:border-[#4937db]/40"
            type="button"
            onClick={flip}
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>

      <div className="relative min-h-[300px] pt-6">
        <div className={panel === 0 ? "block" : "hidden"}>
          <HomeMessageBoard embedded pin={pin} />
        </div>
        <div className={panel === 1 ? "block" : "hidden"}>
          <HomeStandardTestPanel />
        </div>
      </div>
    </article>
  );
}

function HomeStandardTestPanel() {
  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3e7ff] text-[#141537]">
          <FlaskConical size={30} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-900">标准鉴定</h2>
          <p className="mt-1 text-sm font-bold text-slate-500">20 题 · 约 3 分钟 · 即时结果</p>
        </div>
      </div>
      <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
        20 道题，测试你对明清历史的基本认知偏差。约 3 分钟完成，即时出结果。
      </p>
      <div className="mt-7 flex flex-wrap gap-3 text-sm font-bold text-slate-500">
        <span className="rounded-full bg-slate-100 px-3 py-1">20 题</span>
        <span className="rounded-full bg-slate-100 px-3 py-1">约 3 分钟</span>
        <span className="rounded-full bg-slate-100 px-3 py-1">5 种结果</span>
      </div>
      <Link className="mt-7 inline-flex items-center gap-2 text-lg font-black text-[#4937db]" href="/test">
        立即开始
        <ArrowRight size={18} />
      </Link>
    </div>
  );
}

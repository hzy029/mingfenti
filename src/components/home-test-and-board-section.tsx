import Link from "next/link";
import { ArrowRight, Microscope, TestTube } from "lucide-react";
import type { BoardHomeSlide } from "@/lib/board-home-data";
import { HomeMessageBoard } from "@/components/home-message-board";

type HomeTestAndBoardSectionProps = {
  pin: BoardHomeSlide | null;
};

export function HomeTestAndBoardSection({ pin }: HomeTestAndBoardSectionProps) {
  return (
    <div className="space-y-10 lg:space-y-14">
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <Link
          className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:border-[#6366f1]/40 hover:shadow-md"
          href="/test"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <TestTube className="h-8 w-8" strokeWidth={2.25} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-black text-slate-900 md:text-3xl">标准鉴定</h2>
              <p className="mt-2 text-sm font-bold text-slate-500">20 道是非题 · 约 3 分钟 · 即时结果</p>
            </div>
          </div>
          <p className="mt-6 flex-1 text-lg leading-8 text-slate-600">
            20 道是非题，测试你对明清议题的基本认知偏差。题干由题库自动生成「反对 / 支持」陈述，当场出档。
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-black text-slate-600">20 题</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-black text-slate-600">~3 分钟</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-black text-slate-600">五种档位</span>
          </div>
          <span className="mt-8 inline-flex items-center gap-2 text-lg font-black text-[#6366f1]">
            立即开始
            <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
          </span>
        </Link>

        <Link
          className="group relative flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-[#4338ca] via-[#4f46e5] to-[#6366f1] p-8 text-white shadow-lg transition hover:shadow-xl"
          href="/pro-test"
        >
          <span className="absolute right-6 top-6 rounded-full bg-amber-300 px-3 py-1 text-xs font-black text-slate-900 shadow-sm">
            PRO
          </span>
          <div className="flex items-start gap-4 pr-16">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/25">
              <Microscope className="h-8 w-8" strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-black md:text-3xl">专业深度鉴定</h2>
              <p className="mt-2 text-sm font-bold text-white/80">20 题四选一 · 双轴计分 · 即时结果</p>
            </div>
          </div>
          <p className="mt-6 flex-1 text-lg leading-8 text-white/95">
            四选一进阶路径：在同一套题材上量化「历史了解程度」与「明朝偏向程度」，适合需要区分立场强度的深度自测。
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-black text-white ring-1 ring-white/25">
              20 题
            </span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-black text-white ring-1 ring-white/25">
              ~5 分钟
            </span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-black text-white ring-1 ring-white/25">
              双轴评分
            </span>
          </div>
          <span className="mt-8 inline-flex items-center gap-2 text-lg font-black text-white">
            开始 PRO 鉴定
            <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
        <HomeMessageBoard embedded pin={pin} />
      </div>
    </div>
  );
}

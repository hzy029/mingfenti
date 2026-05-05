import Link from "next/link";
import { ArrowRight, MessagesSquare, TestTube } from "lucide-react";
import type { BoardHomeSlide } from "@/lib/board-home-data";

type HomeTestAndBoardSectionProps = {
  pin: BoardHomeSlide | null;
};

function BoardThumbnailCard({ pin }: { pin: BoardHomeSlide | null }) {
  return (
    <Link
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:border-[#4937db]/35 hover:shadow-md"
      href="/board"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#e3e7ff] text-[#141537] ring-1 ring-[#c7d2fe]">
          <MessagesSquare className="h-8 w-8" strokeWidth={2.25} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-black text-slate-900 md:text-3xl">留言板</h2>
          <p className="mt-2 text-sm font-bold text-slate-500">置顶主题 · 最新公开回复预览</p>
        </div>
      </div>

      <div className="mt-6 flex min-h-[7.5rem] flex-1 flex-col rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
        {pin ? (
          <>
            <p className="text-xs font-black uppercase tracking-wide text-[#4937db]">站内置顶</p>
            <h3 className="mt-2 line-clamp-2 text-lg font-black leading-snug text-slate-900">{pin.topicTitle}</h3>
            {pin.topPostPreview ? (
              <p className="mt-3 line-clamp-3 text-base font-bold leading-7 text-slate-600">{pin.topPostPreview}</p>
            ) : (
              <p className="mt-3 text-base font-bold text-slate-400">该主题下还没有公开回答。</p>
            )}
          </>
        ) : (
          <p className="text-base font-bold leading-7 text-slate-500">
            暂无首页展示主题。进入留言板查看全部讨论；管理员设置置顶后将在此预览。
          </p>
        )}
      </div>

      <div className="mt-7 flex flex-wrap gap-2">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-black text-slate-600">讨论区</span>
        {pin && pin.pinWeight > 0 ? (
          <span className="rounded-full bg-[#fef08a] px-3 py-1 text-sm font-black text-[#854d0e]">
            置顶权值 {pin.pinWeight}
          </span>
        ) : null}
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-black text-slate-600">实时更新</span>
      </div>

      <span className="mt-8 inline-flex items-center gap-2 text-lg font-black text-[#4937db]">
        进入留言板
        <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

export function HomeTestAndBoardSection({ pin }: HomeTestAndBoardSectionProps) {
  return (
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

      <BoardThumbnailCard pin={pin} />
    </div>
  );
}

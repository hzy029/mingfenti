import { ArrowRight, BarChart3, FlaskConical } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { HomeAnnouncementModal } from "@/components/home-announcement-modal";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/data/site-config";
import { getBasicStats, type BasicStats } from "@/lib/basic-stats";

export const dynamic = "force-dynamic";

function getDonutBackground(stats: BasicStats) {
  return (
  stats.totalTests === 0
    ? "#e2e8f0"
    : `conic-gradient(${stats.distribution
        .reduce<{ start: number; stops: string[] }>(
          (state, item) => {
            const end = state.start + item.percent;
            state.stops.push(`${item.color} ${state.start}% ${end}%`);
            state.start = end;
            return state;
          },
          { start: 0, stops: [] }
        )
        .stops.join(", ")})`
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export default async function HomePage() {
  const stats = await getBasicStats();
  const donutBackground = getDonutBackground(stats);

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#050816]">
      <HomeAnnouncementModal />

      <SiteHeader />

      <div className="bg-[#141537] text-white">
        <section className="mx-auto flex min-h-[620px] max-w-5xl flex-col items-center justify-center px-5 py-16 text-center">
          <p className="mb-10 self-start text-lg font-black text-white md:-ml-8">
            君非亡国之君,臣皆亡国之臣!大明有好皇帝,却无好百姓!
          </p>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-base font-black text-white shadow-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-[#48d579]" />
            免费在线测试 · 无需注册
          </div>

          <h1 className="mt-8 text-6xl font-black leading-tight tracking-normal md:text-7xl">
            你是<span className="text-[#7b7cff]">明粉</span>吗?
          </h1>
          <p className="mt-6 max-w-3xl text-2xl font-bold leading-10 text-white/85">
            通过 20 道专业问题，科学检测你的历史认知偏差程度。
            <br />
            看看你在“明粉谱系”上处于什么位置。
          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-5">
            <Link
              className="inline-flex min-w-56 items-center justify-center gap-2 rounded-2xl bg-[#6567f2] px-8 py-5 text-2xl font-black text-white shadow-xl shadow-[#6567f2]/25"
              href="/test"
            >
              开始测试
              <ArrowRight size={24} />
            </Link>
            <span className="inline-flex min-w-72 cursor-not-allowed items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-8 py-5 text-2xl font-black text-white/90">
              <FlaskConical size={28} />
              PRO 深度鉴定
            </span>
          </div>

          <div className="mt-16 grid w-full max-w-2xl grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl font-black">{formatNumber(stats.totalTests)}</div>
              <div className="mt-2 text-base font-bold text-[#9fb0e8]">累计测试次数</div>
            </div>
            <div>
              <div className="text-4xl font-black">{stats.questionCount}</div>
              <div className="mt-2 text-base font-bold text-[#9fb0e8]">道专业题目</div>
            </div>
            <div>
              <div className="text-4xl font-black">{stats.resultTypes}</div>
              <div className="mt-2 text-base font-bold text-[#9fb0e8]">种结果类型</div>
            </div>
          </div>
        </section>
      </div>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-16 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3e7ff] text-[#141537]">
            <FlaskConical size={30} />
          </div>
          <h2 className="mt-6 text-3xl font-black">标准鉴定</h2>
          <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">
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
        </article>

        <article className="relative overflow-hidden rounded-2xl bg-[#4937db] p-8 text-white shadow-sm">
          <span className="absolute right-0 top-4 rounded-l-full bg-[#facc15] px-3 py-1 text-sm font-black text-[#141537]">
            PRO
          </span>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
            <FlaskConical size={30} />
          </div>
          <h2 className="mt-6 text-3xl font-black">专业深度鉴定</h2>
          <p className="mt-4 max-w-xl text-lg leading-8 text-white/85">
            四维度量表正在建设中，后续会加入政治威权、民族双标、经济蒙昧、社会文明等深度画像。
          </p>
          <div className="mt-7 flex flex-wrap gap-3 text-sm font-bold text-white/70">
            <span className="rounded-full bg-white/10 px-3 py-1">建设中</span>
            <span className="rounded-full bg-white/10 px-3 py-1">四维画像</span>
            <span className="rounded-full bg-white/10 px-3 py-1">AI 锐评</span>
          </div>
          <span className="mt-7 inline-flex cursor-not-allowed items-center gap-2 text-lg font-black text-white">
            开始 PRO 鉴定
            <ArrowRight size={18} />
          </span>
        </article>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="flex items-center gap-2 text-3xl font-black">
            <BarChart3 size={30} />
            全站测试分布
          </h2>
          <p className="mt-2 text-lg text-slate-500">基于所有用户的标准测试结果</p>

          <div className="mt-10 grid items-center gap-10 md:grid-cols-[220px_1fr]">
            <div className="relative mx-auto h-44 w-44 rounded-full" style={{ background: donutBackground }}>
              <div className="absolute inset-11 flex flex-col items-center justify-center rounded-full bg-white text-center">
                <strong>{formatNumber(stats.totalTests)}</strong>
                <span className="text-xs text-slate-500">次测试</span>
              </div>
            </div>

            <div className="grid gap-7 sm:grid-cols-2">
              {stats.distribution.map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <span className="h-4 w-4 rounded-full" style={{ backgroundColor: item.color }} />
                  <div>
                    <div className="text-lg font-black">{item.label}</div>
                    <div className="text-2xl font-black" style={{ color: item.color }}>
                      {item.percent.toFixed(1)}%
                      <span className="ml-2 text-base font-bold text-slate-400">{formatNumber(item.count)} 人</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16 text-center">
        <h2 className="text-3xl font-black">你会得到哪种结果?</h2>
        <p className="mt-3 text-lg font-bold text-slate-400">测试结果分为五个类型</p>

        <div className="mt-10 grid gap-5 md:grid-cols-5">
          {stats.distribution.map((item) => (
            <article
              key={item.label}
              className="overflow-hidden rounded-2xl border bg-white shadow-sm"
              style={{ borderColor: `${item.color}33`, backgroundColor: `${item.color}0d` }}
            >
              <div className="flex aspect-square items-center justify-center bg-white p-4">
                <Image
                  alt={item.label}
                  className="h-full w-full object-contain"
                  height={420}
                  src={item.image}
                  width={420}
                />
              </div>
              <div className="border-t border-slate-200/70 p-5 text-left">
                <h3 className="text-xl font-black" style={{ color: item.color }}>
                  {item.label}
                </h3>
                <p className="mt-2 font-bold" style={{ color: item.color }}>
                  {item.tone}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500">
        {siteConfig.homepageQuote}
      </footer>
    </main>
  );
}

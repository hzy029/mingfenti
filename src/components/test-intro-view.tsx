"use client";

import Link from "next/link";

export type TestIntroVariant = "lite" | "pro";

type RuleItem = { text: string };

const LITE_RULES: RuleItem[] = [
  {
    text: "共 20 道题，每题判断「支持」或「反对」；「支持 / 反对」按钮顺序每场随机，不显示题号标签。"
  },
  {
    text: "题干含「正向题」与「反向题」两类，请依据史实与逻辑判断表述是否成立。"
  },
  {
    text: "选择后自动进入下一题；可使用页面底部「上一题」返回修改。"
  },
  {
    text: "答题不满 20 秒将被判定为作弊；预计用时约 2～4 分钟。"
  },
  {
    text: "完成后生成与 Pro 版共用档位的鉴定结果，可保存图片、复制分享文案。"
  }
];

const PRO_RULES: RuleItem[] = [
  {
    text: "共 20 道题，每题 4 个选项。选项展示顺序每场随机打乱（仍显示 A–D），计分按选项语义不变。"
  },
  {
    text: "采用「西史辨伪化程度 × 明朝偏向程度」双轴计分；核心题与补充题权重不同。"
  },
  {
    text: "选择后自动进入下一题；可使用「上一题」返回修改。"
  },
  {
    text: "完成用时过短可能影响匿名统计入库；预计用时约 3～5 分钟。"
  },
  {
    text: "完成后展示双轴分数与档位鉴定结果，可保存图片分享。"
  }
];

type TestIntroViewProps = {
  variant: TestIntroVariant;
};

export function TestIntroView({ variant }: TestIntroViewProps) {
  const isLite = variant === "lite";
  const badge = isLite ? "标准版 · 是非鉴定" : "PRO · 专业版";
  const titleZh = isLite ? "明粉浓度快速鉴定" : "明清史观 Pro 鉴定";
  const titleEn = isLite ? "QUICK TRUE / FALSE SCREENING" : "PROFESSIONAL SCENARIO TEST";
  const description = isLite
    ? [
        "基于同一套题库生成的判断陈述，覆盖财政、制度与史观话术；按「支持 / 反对」累积映射到与 Pro 版一致的档位。",
        "从百余道题库随机抽取 20 题，当场出分；适合快速自测与传播。"
      ]
    : [
        "四选一进阶路径：在同一套题材上区分立场强度，双轴分数反映「西史辨伪化程度」与「明朝偏向」。",
        "从百余道题库随机抽取 20 题（核心 6 + 补充 14），当场生成结果。"
      ];
  const rules = isLite ? LITE_RULES : PRO_RULES;
  const playHref = isLite ? "/test/play" : "/pro-test/play";

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
      <section className="bg-gradient-to-b from-[#0c1447] via-[#141c6b] to-[#1e2a8f] px-5 pb-14 pt-12 text-center text-white md:pb-20 md:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="inline-flex rounded-full border border-amber-400/80 bg-[#0c1447]/60 px-5 py-2 text-sm font-black tracking-wide text-amber-200">
            {badge}
          </p>
          <h1 className="mt-8 text-3xl font-black leading-tight md:text-5xl">{titleZh}</h1>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.25em] text-white/75 md:text-sm">{titleEn}</p>
          <div className="mt-10 space-y-4 text-left text-base font-bold leading-8 text-white/90 md:text-center md:text-lg md:leading-9">
            {description.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-5 pb-24 pt-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
          <h2 className="text-xl font-black text-slate-900 md:text-2xl">答题须知</h2>
          <ol className="mt-8 space-y-6">
            {rules.map((rule, index) => (
              <li key={rule.text} className="flex gap-4 text-left">
                <span
                  className={[
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black text-white",
                    isLite ? "bg-[#6366f1]" : "bg-[#4338ca]"
                  ].join(" ")}
                >
                  {index + 1}
                </span>
                <p className="pt-1 text-base font-bold leading-8 text-slate-700">{rule.text}</p>
              </li>
            ))}
          </ol>

          <div className="mt-12 flex flex-col items-center gap-4 border-t border-slate-100 pt-10">
            <p className="text-center text-sm font-bold text-slate-500">
              当前类别：{isLite ? "普通测试（判断题）" : "Pro 测试（四选一）"}
            </p>
            <Link
              className={[
                "inline-flex min-w-[240px] items-center justify-center rounded-2xl px-10 py-4 text-lg font-black text-white shadow-lg transition",
                isLite
                  ? "bg-[#6567f2] shadow-[#6567f2]/30 hover:bg-[#5558e3]"
                  : "bg-[#4338ca] shadow-[#4338ca]/30 hover:bg-[#3730a3]"
              ].join(" ")}
              href={playHref}
            >
              开始答题
            </Link>
            <Link className="text-sm font-bold text-[#4937db] underline hover:text-[#3730a3]" href="/">
              返回首页
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

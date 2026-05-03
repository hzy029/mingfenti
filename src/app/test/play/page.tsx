"use client";

import { ArrowLeft, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import type { TfQuestion } from "@/data/types";
import { BASIC_TEST_SESSION_STORAGE_KEY, type BasicTestSessionLite } from "@/lib/basic-test-session";
import { drawLiteTestQuestions } from "@/lib/lite-question-selection";
import { getLiteTestResult } from "@/lib/lite-result";
import { normalizeLiteScore } from "@/lib/lite-score-normalize";
import { scoreLiteAnswers } from "@/lib/lite-scoring";
import { recordBasicAttempt } from "@/lib/record-basic-attempt";

type TfChoice = {
  userMeansTrue: boolean;
};

/** 左「支持」右「反对」，不做乱序映射 */
const DISPLAY_CHOICES: readonly TfChoice[] = [{ userMeansTrue: true }, { userMeansTrue: false }];

export default function LiteTestPlayPage() {
  const router = useRouter();
  const [questions] = useState<TfQuestion[]>(() => drawLiteTestQuestions());
  const [startedAt] = useState(() => new Date().toISOString());
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentQuestion = questions[currentIndex];

  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / Math.max(questions.length, 1)) * 100);

  const bankCounts = useMemo(
    () =>
      questions.reduce(
        (counts, question) => ({
          ...counts,
          [question.bank]: counts[question.bank] + 1
        }),
        { core: 0, supplemental: 0 }
      ),
    [questions]
  );

  function completeTest(finalAnswers: Record<string, boolean>) {
    const rawScore = scoreLiteAnswers(questions, finalAnswers);
    const score = normalizeLiteScore(rawScore);
    const result = getLiteTestResult(score);
    const completedAt = new Date().toISOString();
    const durationSeconds = Math.max(0, Math.round((Date.parse(completedAt) - Date.parse(startedAt)) / 1000));
    const session: BasicTestSessionLite = {
      testVariant: "lite",
      questions,
      answers: finalAnswers,
      score,
      resultId: result.displayResult.id,
      startedAt,
      completedAt,
      durationSeconds
    };

    window.localStorage.setItem(BASIC_TEST_SESSION_STORAGE_KEY, JSON.stringify(session));
    void recordBasicAttempt(session, result.displayResult.title);
    router.push("/test/complete");
  }

  function selectTruth(userMeansTrue: boolean) {
    const nextAnswers = { ...answers, [currentQuestion.id]: userMeansTrue };
    setAnswers(nextAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((index) => index + 1);
    } else {
      completeTest(nextAnswers);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f4ee] text-[#15120d]">
      <SiteHeader />

      <main className="mx-auto flex min-h-[calc(100vh-74px)] w-full max-w-4xl flex-col px-5 py-6">
        <section className="py-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#5d5447]">
            <span className="font-black text-[#7a1f18]">普通版检测 · 判断题</span>
            <span>
              第 {currentIndex + 1} / {questions.length} 题
            </span>
            <span>
              已答 {answeredCount} 题，核心 {bankCounts.core} 题，补充 {bankCounts.supplemental} 题
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#15120d]/10">
            <div className="h-full bg-[#b72f24]" style={{ width: `${progressPercent}%` }} />
          </div>
        </section>

        <section className="rounded-lg border border-[#15120d]/10 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="rounded-md bg-[#7a1f18]/10 px-2 py-1 text-xs font-bold text-[#7a1f18]">
              {currentQuestion.category}
            </span>
            <span className="rounded-md bg-[#15120d]/5 px-2 py-1 text-xs font-bold text-[#5d5447]">
              {currentQuestion.bank === "core" ? "核心题" : "补充题"}
            </span>
            {!currentQuestion.liteScoring ? (
              <span className="rounded-md bg-[#15120d]/5 px-2 py-1 text-xs font-bold text-[#5d5447]">
                {currentQuestion.variant === "oppose" ? "反向题" : "正向题"}
              </span>
            ) : (
              <span className="rounded-md bg-[#15120d]/5 px-2 py-1 text-xs font-bold text-[#5d5447]">
                {currentQuestion.liteScoring.mode === "extreme" ? "极端倾向" : "理性倾向"}
              </span>
            )}
          </div>

          <p className="text-lg font-bold leading-8 text-[#25211b]">{currentQuestion.statement}</p>

          <p className="mt-6 text-sm font-bold text-[#5d5447]">你是否认同上述表述？</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {DISPLAY_CHOICES.map((choice) => {
              const isSupport = choice.userMeansTrue;
              const selected =
                currentQuestion.id in answers && answers[currentQuestion.id] === choice.userMeansTrue;

              const semanticBase = isSupport
                ? "border-emerald-500/70 bg-emerald-50 text-emerald-950 hover:border-emerald-600"
                : "border-slate-200 bg-white text-[#15120d] hover:border-slate-300";

              const semanticSelected = selected
                ? isSupport
                  ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600/40 shadow-md"
                  : "border-slate-500 bg-white ring-2 ring-slate-400/50 shadow-md"
                : "";

              return (
                <button
                  key={choice.userMeansTrue ? "t" : "f"}
                  className={[
                    "flex min-h-16 items-center justify-center gap-2 rounded-md border p-4 text-xl font-black transition",
                    semanticBase,
                    semanticSelected
                  ].join(" ")}
                  type="button"
                  onClick={() => selectTruth(choice.userMeansTrue)}
                >
                  {isSupport ? (
                    <>
                      <Check className="h-6 w-6 shrink-0 text-emerald-700" aria-hidden />
                      <span>支持</span>
                    </>
                  ) : (
                    <>
                      <X className="h-6 w-6 shrink-0 text-slate-600" aria-hidden />
                      <span>反对</span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <footer className="mt-5 flex justify-start">
          <button
            className="inline-flex items-center gap-2 rounded-md border border-[#15120d]/20 px-4 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-40"
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((index) => Math.max(index - 1, 0))}
          >
            <ArrowLeft size={18} />
            上一题
          </button>
        </footer>
      </main>
    </div>
  );
}

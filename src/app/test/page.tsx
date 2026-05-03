"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { BASIC_TEST_DRAW_COUNT } from "@/data/basic-test-config";
import type { BasicQuestion } from "@/data/types";
import { drawBasicTestQuestions } from "@/lib/basic-question-selection";
import { getBasicResult, scoreBasicAnswers, type BasicAnswerMap } from "@/lib/basic-scoring";
import { BASIC_TEST_SESSION_STORAGE_KEY, type BasicTestSession } from "@/lib/basic-test-session";
import { shuffleWithSeed } from "@/lib/shuffle-seed";

function createShuffleSessionSalt(): string {
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(bytes);

    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return "shuffle-salt-fallback";
}

export default function BasicTestPage() {
  const router = useRouter();
  const [shuffleSalt] = useState(createShuffleSessionSalt);
  const [questions] = useState<BasicQuestion[]>(() => drawBasicTestQuestions());
  const [startedAt] = useState(() => new Date().toISOString());
  const [answers, setAnswers] = useState<BasicAnswerMap>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentQuestion = questions[currentIndex];
  const displayOptions = useMemo(
    () => shuffleWithSeed(currentQuestion.options, `${shuffleSalt}:${currentQuestion.id}`),
    [currentQuestion.id, currentQuestion.options, shuffleSalt]
  );
  const answeredCount = Object.keys(answers).length;
  const selectedOptionId = answers[currentQuestion.id];
  const progressPercent = Math.round((answeredCount / BASIC_TEST_DRAW_COUNT) * 100);

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

  function completeTest(finalAnswers: BasicAnswerMap) {
    const score = scoreBasicAnswers(questions, finalAnswers);
    const result = getBasicResult(score);
    const completedAt = new Date().toISOString();
    const durationSeconds = Math.max(0, Math.round((Date.parse(completedAt) - Date.parse(startedAt)) / 1000));
    const session: BasicTestSession = {
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

  function selectOption(optionId: string) {
    const nextAnswers = { ...answers, [currentQuestion.id]: optionId };
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
          </div>

          <h1 className="text-2xl font-black leading-10">{currentQuestion.title}</h1>

          <div className="mt-6 grid gap-3">
            {displayOptions.map((option, slotIndex) => {
              const selected = selectedOptionId === option.id;
              const displayLetter = String.fromCharCode(65 + slotIndex);

              return (
                <button
                  key={option.id}
                  className={[
                    "flex min-h-16 w-full items-start gap-3 rounded-md border p-4 text-left leading-7 transition",
                    selected
                      ? "border-[#b72f24] bg-[#b72f24]/10 text-[#15120d]"
                      : "border-[#15120d]/15 bg-white hover:border-[#b72f24]/60"
                  ].join(" ")}
                  type="button"
                  onClick={() => selectOption(option.id)}
                >
                  <span
                    className={[
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sm font-black",
                      selected ? "bg-[#b72f24] text-white" : "bg-[#15120d]/10 text-[#15120d]"
                    ].join(" ")}
                  >
                    {displayLetter}
                  </span>
                  <span>{option.label}</span>
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

function recordBasicAttempt(session: BasicTestSession, resultTitle: string) {
  const payload = JSON.stringify({
    resultId: session.resultId,
    resultTitle,
    historyKnowledge: session.score.historyKnowledge,
    mingPreference: session.score.mingPreference,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    durationSeconds: session.durationSeconds
  });

  if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon("/api/basic-attempts", blob);
    return;
  }

  fetch("/api/basic-attempts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true
  }).catch(() => {
    // Result display must not depend on analytics storage.
  });
}

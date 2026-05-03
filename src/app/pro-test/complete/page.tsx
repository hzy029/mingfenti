"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { BASIC_TEST_SESSION_STORAGE_KEY, parseBasicTestSession } from "@/lib/basic-test-session";

const REDIRECT_SECONDS = 3;

export default function ProTestCompletePage() {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const session = parseBasicTestSession(window.localStorage.getItem(BASIC_TEST_SESSION_STORAGE_KEY));
    if (!session || session.testVariant !== "pro") {
      router.replace("/pro-test");
      return;
    }

    const redirectTimer = window.setTimeout(() => {
      router.replace("/result");
    }, REDIRECT_SECONDS * 1000);

    const countdownTimer = window.setInterval(() => {
      setSecondsLeft((previous) => Math.max(0, previous - 1));
    }, 1000);

    return () => {
      window.clearTimeout(redirectTimer);
      window.clearInterval(countdownTimer);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f7f4ee] text-[#15120d]">
      <SiteHeader />
      <main className="mx-auto flex min-h-[calc(100vh-74px)] w-full max-w-lg flex-col items-center justify-center px-5 py-12 text-center">
        <p className="text-sm font-black text-[#4937db]">Pro 版检测</p>
        <h1 className="mt-3 text-4xl font-black leading-tight md:text-5xl">答题完成</h1>
        <p className="mt-6 text-lg font-bold leading-8 text-[#4e4639]">正在为你生成结果，请稍候…</p>
        <p className="mt-4 text-2xl font-black text-[#b72f24]">
          {secondsLeft > 0 ? `${secondsLeft} 秒后进入结果页` : "正在跳转…"}
        </p>
      </main>
    </div>
  );
}

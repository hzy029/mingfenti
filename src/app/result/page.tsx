"use client";

import { ArrowRight, Download, Home, MessageSquare, RotateCcw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { BASIC_TEST_MAX_AXIS_SCORE } from "@/data/basic-test-config";
import { basicResultTiers } from "@/data/basic-results";
import type { BasicResultTier } from "@/data/types";
import { BASIC_TEST_SESSION_STORAGE_KEY, type BasicTestSession } from "@/lib/basic-test-session";

const RESULT_DOWNLOAD_FILENAME = "明粉检测器ti-测试结果.png";

const resultVisuals: Record<string, { image: string; tone: string; color: string; background: string }> = {
  "objective-neutral": { image: "/icons/中立理性.png", tone: "客观中立", color: "#18c48f", background: "#e8f8f4" },
  "manchu-loyalist": { image: "/icons/八旗.png", tone: "满遗", color: "#18c48f", background: "#e8f8f4" },
  "ming-leaning-moe": { image: "/icons/萌萌人.png", tone: "萌萌人", color: "#f59e0b", background: "#fff7e8" },
  "old-ming-fan": { image: "/icons/旧明粉.png", tone: "旧明粉", color: "#94a3b8", background: "#eef2f7" },
  "new-ming-fan": { image: "/icons/新明粉.png", tone: "汉服鹿角妈妈窝", color: "#6366f1", background: "#eef1ff" },
  "zhu-yuanzhang-dreamer": {
    image: "/icons/朱元璋梦男.png",
    tone: "所有心理问题都是性压抑",
    color: "#ef233c",
    background: "#fff1f4"
  }
};

function findResult(resultId: string): BasicResultTier | undefined {
  return basicResultTiers.find((result) => result.id === resultId);
}

function subscribeToSessionChanges(callback: () => void) {
  window.addEventListener("storage", callback);

  return () => window.removeEventListener("storage", callback);
}

let cachedSessionRaw: string | null = null;
let cachedSession: BasicTestSession | null = null;

function getSessionSnapshot(): BasicTestSession | null {
  const storedSession = window.localStorage.getItem(BASIC_TEST_SESSION_STORAGE_KEY);

  if (!storedSession) {
    cachedSessionRaw = null;
    cachedSession = null;
    return null;
  }

  if (storedSession === cachedSessionRaw) {
    return cachedSession;
  }

  try {
    cachedSessionRaw = storedSession;
    cachedSession = JSON.parse(storedSession) as BasicTestSession;
    return cachedSession;
  } catch {
    window.localStorage.removeItem(BASIC_TEST_SESSION_STORAGE_KEY);
    cachedSessionRaw = null;
    cachedSession = null;
    return null;
  }
}

function getServerSessionSnapshot() {
  return null;
}

function formatToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}/${month}/${day}`;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const percent = Math.round((value / BASIC_TEST_MAX_AXIS_SCORE) * 100);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm font-bold">
        <span>{label}</span>
        <span>
          {value} / {BASIC_TEST_MAX_AXIS_SCORE}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-[#15120d]/10">
        <div className="h-full bg-[#b72f24]" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function loadCanvasImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const characters = Array.from(text);
  let line = "";
  let cursorY = y;

  characters.forEach((character) => {
    const testLine = `${line}${character}`;

    if (context.measureText(testLine).width > maxWidth && line) {
      context.fillText(line, x, cursorY);
      line = character;
      cursorY += lineHeight;
    } else {
      line = testLine;
    }
  });

  if (line) {
    context.fillText(line, x, cursorY);
  }

  return cursorY + lineHeight;
}

function drawContainedImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const imageWidth = image.naturalWidth * scale;
  const imageHeight = image.naturalHeight * scale;

  context.drawImage(image, x + (width - imageWidth) / 2, y + (height - imageHeight) / 2, imageWidth, imageHeight);
}

function drawShareScoreBar(
  context: CanvasRenderingContext2D,
  label: string,
  value: number,
  x: number,
  y: number,
  width: number
) {
  const percent = value / BASIC_TEST_MAX_AXIS_SCORE;

  context.fillStyle = "#15120d";
  context.font = "700 26px sans-serif";
  context.fillText(label, x, y);
  context.textAlign = "right";
  context.fillText(`${value} / ${BASIC_TEST_MAX_AXIS_SCORE}`, x + width, y);
  context.textAlign = "left";
  context.fillStyle = "#e7e1d8";
  context.fillRect(x, y + 18, width, 16);
  context.fillStyle = "#b72f24";
  context.fillRect(x, y + 18, width * percent, 16);
}

async function downloadResultImage({
  result,
  session,
  imageSrc,
  visual
}: {
  result: BasicResultTier;
  session: BasicTestSession;
  imageSrc: string;
  visual: { tone: string; color: string; background: string };
}) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 1450;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is not available.");
  }

  const resultImage = await loadCanvasImage(imageSrc);
  const today = formatToday();

  context.fillStyle = "#f7f4ee";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "#fff";
  context.fillRect(80, 70, 1040, 1240);

  context.fillStyle = visual.background;
  context.fillRect(80, 70, 1040, 430);

  context.fillStyle = "#7a1f18";
  context.font = "800 28px sans-serif";
  context.fillText("普通版测试结果", 136, 140);

  context.fillStyle = "#15120d";
  context.font = "900 72px sans-serif";
  drawWrappedText(context, result.title, 136, 240, 610, 84);

  context.fillStyle = visual.color;
  context.font = "900 30px sans-serif";
  context.fillText(visual.tone, 136, 376);

  drawContainedImage(context, resultImage, 770, 130, 260, 260);

  context.fillStyle = "#15120d";
  context.font = "900 38px sans-serif";
  context.fillText("分数", 136, 590);
  drawShareScoreBar(context, "历史了解程度", session.score.historyKnowledge, 136, 660, 920);
  drawShareScoreBar(context, "明朝偏向程度", session.score.mingPreference, 136, 740, 920);

  context.fillStyle = "#15120d";
  context.font = "900 38px sans-serif";
  context.fillText("诊断结果", 136, 880);
  context.fillStyle = "#4e4639";
  context.font = "400 30px sans-serif";
  drawWrappedText(context, result.summary, 136, 940, 920, 48);

  context.fillStyle = "#c2c8d4";
  context.font = "700 24px sans-serif";
  context.fillText(today, 136, 1230);
  context.textAlign = "right";
  context.fillText("b站解雨泽熙", 1056, 1230);
  context.textAlign = "left";

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((resultBlob) => {
      if (resultBlob) {
        resolve(resultBlob);
      } else {
        reject(new Error("Unable to export result image."));
      }
    }, "image/png");
  });

  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = RESULT_DOWNLOAD_FILENAME;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(downloadUrl);
}

export default function BasicResultPage() {
  const [isDownloading, setIsDownloading] = useState(false);
  const session = useSyncExternalStore(subscribeToSessionChanges, getSessionSnapshot, getServerSessionSnapshot);
  const result = useMemo(() => (session ? findResult(session.resultId) : undefined), [session]);
  const visual = result ? resultVisuals[result.id] : undefined;
  const today = formatToday();

  async function handleDownload() {
    if (!session || !result || !visual) {
      return;
    }

    setIsDownloading(true);

    try {
      await downloadResultImage({ result, session, imageSrc: visual.image, visual });
    } catch {
      window.alert("生成结果图片失败，请稍后再试。");
    } finally {
      setIsDownloading(false);
    }
  }

  if (!session || !result || !visual) {
    return (
      <main className="min-h-screen bg-[#f7f4ee] px-5 py-8 text-[#15120d]">
        <section className="mx-auto max-w-3xl rounded-lg border border-[#15120d]/10 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-black">没有找到答题记录</h1>
          <p className="mt-4 leading-7 text-[#4e4639]">请先完成普通测试，再查看结果。</p>
          <Link className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#b72f24] px-5 py-3 font-bold text-white" href="/test">
            开始普通测试
            <ArrowRight size={18} />
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#15120d]">
      <div className="mx-auto w-full max-w-5xl px-5 py-6">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#15120d]/10 pb-4">
          <Link className="inline-flex items-center gap-2 text-sm font-bold text-[#4e4639]" href="/">
            <Home size={16} />
            返回首页
          </Link>
        </header>

        <section className="mt-6 overflow-hidden rounded-3xl border border-[#15120d]/10 bg-white shadow-lg">
          <div className="grid gap-6 p-8 md:grid-cols-[1fr_300px]" style={{ backgroundColor: visual.background }}>
            <div>
              <p className="text-sm font-black text-[#7a1f18]">普通版测试结果</p>
              <h1 className="mt-4 text-5xl font-black leading-tight md:text-6xl">{result.title}</h1>
              <p className="mt-4 inline-flex rounded-full bg-white/70 px-4 py-2 text-lg font-black" style={{ color: visual.color }}>
                {visual.tone}
              </p>
            </div>
            <div className="flex items-center justify-center">
              <div className="flex h-64 w-64 items-center justify-center rounded-2xl bg-white/75 p-4">
                <Image
                  alt={result.title}
                  className="h-full w-full object-contain"
                  height={360}
                  priority
                  src={visual.image}
                  width={360}
                />
              </div>
            </div>
          </div>

          <div className="p-8">
            <section>
              <h2 className="text-xl font-black">分数</h2>
              <div className="mt-5 grid gap-5">
                <ScoreBar label="历史了解程度" value={session.score.historyKnowledge} />
                <ScoreBar label="明朝偏向程度" value={session.score.mingPreference} />
              </div>
            </section>

            <section className="mt-8 border-t border-[#15120d]/10 pt-8">
              <h2 className="text-xl font-black text-[#8790a3]">诊断结果</h2>
              <p className="mt-4 text-lg font-bold leading-9 text-[#25211b]">{result.summary}</p>
            </section>

            <footer className="mt-10 flex items-center justify-between border-t border-[#15120d]/10 pt-6 text-sm font-bold text-[#c2c8d4]">
              <span>{today}</span>
              <span>b站解雨泽熙</span>
            </footer>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <button
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-5 py-4 text-lg font-black text-white transition hover:bg-[#1d4ed8] disabled:cursor-wait disabled:opacity-70"
            disabled={isDownloading}
            type="button"
            onClick={handleDownload}
          >
            <Download size={22} />
            {isDownloading ? "正在生成图片..." : "保存结果图片"}
          </button>
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#475569] px-5 py-4 text-lg font-black text-white transition hover:bg-[#334155]"
            href="/test"
          >
            <RotateCcw size={22} />
            重新测试
          </Link>
        </section>

        <section className="mt-4 flex flex-col items-center border-t border-[#15120d]/10 pt-6 pb-10">
          <Link
            className="inline-flex w-full max-w-md items-center justify-center gap-2 rounded-2xl border-2 border-[#6366f1] bg-[#eef1ff] px-5 py-4 text-lg font-black text-[#4338ca] transition hover:bg-[#e0e7ff]"
            href="/board"
          >
            <MessageSquare size={22} />
            前往留言板
          </Link>
          <p className="mt-3 text-center text-sm font-bold text-[#5d5447]">通过检测后，欢迎到留言板参与讨论</p>
        </section>
      </div>
    </main>
  );
}

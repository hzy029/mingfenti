"use client";

import { ArrowRight, Download, MessageSquare, RotateCcw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { useMemo, useState, useSyncExternalStore } from "react";
import { SiteHeader } from "@/components/site-header";
import { BASIC_TEST_MAX_AXIS_SCORE } from "@/data/basic-test-config";
import { basicResultTiers } from "@/data/basic-results";
import type { BasicResultTier } from "@/data/types";
import { BASIC_TEST_SESSION_STORAGE_KEY, parseBasicTestSession, type BasicTestSession } from "@/lib/basic-test-session";

const RESULT_DOWNLOAD_FILENAME = "明粉检测器ti-测试结果.png";
const SHARE_SITE_LABEL = "mingfen.sbs";
const SHARE_SITE_URL = "https://mingfen.sbs/";

const resultVisuals: Record<string, { image: string; tone: string; color: string; background: string }> = {
  "objective-neutral": { image: "/icons/中立理性.png", tone: "中立客观", color: "#18c48f", background: "#e8f8f4" },
  "manchu-loyalist": { image: "/icons/八旗.png", tone: "满遗", color: "#18c48f", background: "#e8f8f4" },
  "qing-fan": { image: "/icons/八旗.png", tone: "清粉", color: "#0d9488", background: "#e6fffa" },
  "ming-leaning-moe": { image: "/icons/萌萌人.png", tone: "萌萌人", color: "#f59e0b", background: "#fff7e8" },
  "old-ming-fan": { image: "/icons/旧明粉.png", tone: "旧明粉", color: "#94a3b8", background: "#eef2f7" },
  "new-ming-fan": { image: "/icons/新明粉.png", tone: "皇汉瓜粉西史辩伪", color: "#6366f1", background: "#eef1ff" },
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

  const parsed = parseBasicTestSession(storedSession);
  cachedSessionRaw = storedSession;
  cachedSession = parsed;

  if (!parsed) {
    window.localStorage.removeItem(BASIC_TEST_SESSION_STORAGE_KEY);
    cachedSessionRaw = null;
    cachedSession = null;
  }

  return parsed;
}

function getRetestHref(session: BasicTestSession): string {
  return session.testVariant === "lite" ? "/test" : "/pro-test";
}

function getTestModeLabel(session: BasicTestSession): string {
  return session.testVariant === "lite" ? "普通版（判断）" : "Pro 版";
}

function getScoreAxisMeta(session: BasicTestSession): {
  max: number;
  hkLabel: string;
  mpLabel: string;
} {
  const max = BASIC_TEST_MAX_AXIS_SCORE;
  if (session.testVariant === "lite") {
    return {
      max,
      hkLabel: "理性程度（材料与制度分析）",
      mpLabel: "明朝偏向程度"
    };
  }
  return { max, hkLabel: "历史了解程度", mpLabel: "明朝偏向程度" };
}

function getServerSessionSnapshot() {
  return null;
}

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  const percent = Math.round((value / max) * 100);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm font-bold">
        <span>{label}</span>
        <span>
          {value} / {max}
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
  width: number,
  max: number
) {
  const percent = max > 0 ? value / max : 0;

  context.fillStyle = "#15120d";
  context.font = "700 26px sans-serif";
  context.fillText(label, x, y);
  context.textAlign = "right";
  context.fillText(`${value} / ${max}`, x + width, y);
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
  visual,
  testModeLabel
}: {
  result: BasicResultTier;
  session: BasicTestSession;
  imageSrc: string;
  visual: { tone: string; color: string; background: string };
  testModeLabel: string;
}) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 1450;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is not available.");
  }

  const resultImage = await loadCanvasImage(imageSrc);
  const qrDataUrl = await QRCode.toDataURL(SHARE_SITE_URL, {
    errorCorrectionLevel: "M",
    margin: 1,
    scale: 8,
    color: {
      dark: "#15120d",
      light: "#ffffff"
    }
  });
  const qrImage = await loadCanvasImage(qrDataUrl);

  context.fillStyle = "#f7f4ee";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "#fff";
  context.fillRect(80, 70, 1040, 1240);

  context.fillStyle = visual.background;
  context.fillRect(80, 70, 1040, 430);

  context.fillStyle = "#7a1f18";
  context.font = "800 28px sans-serif";
  context.fillText(`${testModeLabel}测试结果`, 136, 140);

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
  const axis = getScoreAxisMeta(session);
  drawShareScoreBar(context, axis.hkLabel, session.score.historyKnowledge, 136, 660, 920, axis.max);
  drawShareScoreBar(context, axis.mpLabel, session.score.mingPreference, 136, 740, 920, axis.max);

  context.fillStyle = "#15120d";
  context.font = "900 38px sans-serif";
  context.fillText("诊断结果", 136, 880);
  context.fillStyle = "#4e4639";
  context.font = "400 30px sans-serif";
  drawWrappedText(context, result.summary, 136, 940, 920, 48);

  context.fillStyle = "#ffffff";
  context.fillRect(892, 1138, 164, 164);
  drawContainedImage(context, qrImage, 904, 1150, 140, 140);

  context.fillStyle = "#c2c8d4";
  context.font = "700 24px sans-serif";
  context.fillText(SHARE_SITE_LABEL, 136, 1230);
  context.textAlign = "right";
  context.fillText("b站解雨泽熙", 860, 1230);
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

  async function handleDownload() {
    if (!session || !result || !visual) {
      return;
    }

    setIsDownloading(true);

    try {
      await downloadResultImage({
        result,
        session,
        imageSrc: visual.image,
        visual,
        testModeLabel: getTestModeLabel(session)
      });
    } catch {
      window.alert("生成结果图片失败，请稍后再试。");
    } finally {
      setIsDownloading(false);
    }
  }

  if (!session || !result || !visual) {
    return (
      <main className="min-h-screen bg-[#f7f4ee] text-[#15120d]">
        <SiteHeader />
        <section className="mx-auto mt-8 max-w-3xl rounded-lg border border-[#15120d]/10 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-black">没有找到答题记录</h1>
          <p className="mt-4 leading-7 text-[#4e4639]">请先完成普通测试（判断）或 Pro 测试，再查看结果。</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center gap-2 rounded-md bg-[#b72f24] px-5 py-3 font-bold text-white"
              href="/test"
            >
              普通测试
              <ArrowRight size={18} />
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-md border-2 border-[#4937db] bg-[#eef1ff] px-5 py-3 font-bold text-[#4338ca]"
              href="/pro-test"
            >
              Pro 测试
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#15120d]">
      <SiteHeader />
      <div className="mx-auto w-full max-w-5xl px-3 py-3 sm:px-5 sm:py-6">
        <section className="overflow-hidden rounded-2xl border border-[#15120d]/10 bg-white shadow-lg sm:rounded-3xl">
          <div
            className="grid grid-cols-[minmax(0,1fr)_7rem] items-center gap-3 p-4 sm:gap-6 sm:p-8 md:grid-cols-[1fr_300px]"
            style={{ backgroundColor: visual.background }}
          >
            <div className="min-w-0">
              <p className="text-xs font-black text-[#7a1f18] sm:text-sm">{getTestModeLabel(session)}测试结果</p>
              <h1 className="mt-2 text-4xl font-black leading-tight sm:mt-4 sm:text-5xl md:text-6xl">{result.title}</h1>
              <p
                className="mt-3 inline-flex rounded-full bg-white/70 px-3 py-1.5 text-base font-black sm:mt-4 sm:px-4 sm:py-2 sm:text-lg"
                style={{ color: visual.color }}
              >
                {visual.tone}
              </p>
            </div>
            <div className="flex items-center justify-center">
              <div className="flex h-28 w-28 items-center justify-center rounded-xl bg-white/75 p-2 sm:h-64 sm:w-64 sm:rounded-2xl sm:p-4">
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

          <div className="p-4 sm:p-8">
            <section>
              <h2 className="text-lg font-black sm:text-xl">分数</h2>
              <div className="mt-3 grid gap-3 sm:mt-5 sm:gap-5">
                {(() => {
                  const axis = getScoreAxisMeta(session);
                  return (
                    <>
                      <ScoreBar label={axis.hkLabel} max={axis.max} value={session.score.historyKnowledge} />
                      <ScoreBar label={axis.mpLabel} max={axis.max} value={session.score.mingPreference} />
                    </>
                  );
                })()}
              </div>
            </section>

            <section className="mt-4 grid grid-cols-3 gap-2 sm:mt-8 sm:gap-4">
              <button
                className="inline-flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg bg-[#2563eb] px-2 py-2.5 text-xs font-black leading-tight text-white transition hover:bg-[#1d4ed8] disabled:cursor-wait disabled:opacity-70 sm:flex-row sm:gap-2 sm:px-5 sm:py-4 sm:text-lg"
                disabled={isDownloading}
                type="button"
                onClick={handleDownload}
              >
                <Download className="h-5 w-5 sm:h-[22px] sm:w-[22px]" />
                <span>{isDownloading ? "生成中" : "保存图片"}</span>
              </button>
              <Link
                className="inline-flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg bg-[#475569] px-2 py-2.5 text-xs font-black leading-tight text-white transition hover:bg-[#334155] sm:flex-row sm:gap-2 sm:px-5 sm:py-4 sm:text-lg"
                href={getRetestHref(session)}
              >
                <RotateCcw className="h-5 w-5 sm:h-[22px] sm:w-[22px]" />
                <span>重新测试</span>
              </Link>
              <Link
                className="inline-flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg border-2 border-[#6366f1] bg-[#eef1ff] px-2 py-2.5 text-xs font-black leading-tight text-[#4338ca] transition hover:bg-[#e0e7ff] sm:flex-row sm:gap-2 sm:px-5 sm:py-4 sm:text-lg"
                href="/board"
              >
                <MessageSquare className="h-5 w-5 sm:h-[22px] sm:w-[22px]" />
                <span>留言板</span>
              </Link>
            </section>

            <section className="mt-5 border-t border-[#15120d]/10 pt-5 sm:mt-8 sm:pt-8">
              <h2 className="text-lg font-black text-[#8790a3] sm:text-xl">诊断结果</h2>
              <p className="mt-3 text-base font-bold leading-8 text-[#25211b] sm:mt-4 sm:text-lg sm:leading-9">{result.summary}</p>
            </section>

            <footer className="mt-6 flex items-center justify-between border-t border-[#15120d]/10 pt-4 text-sm font-bold text-[#c2c8d4] sm:mt-10 sm:pt-6">
              <span>{SHARE_SITE_LABEL}</span>
              <span>b站解雨泽熙</span>
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}

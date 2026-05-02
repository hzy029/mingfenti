"use client";

import { Mail, Megaphone, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { siteConfig } from "@/data/site-config";

const bilibiliQuoteUrl = "https://www.bilibili.com/video/BV1Pm9kBfEDw/";
const zhihuQuoteUrl = "https://www.zhihu.com/question/2030918050808066759";

export function HomeAnnouncementModal() {
  const [open, setOpen] = useState(true);

  function closeModal() {
    setOpen(false);
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
      <section className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-center justify-between bg-[#4937db] px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <Megaphone size={28} />
            <h2 className="text-2xl font-black">最新公告</h2>
          </div>
          <button
            aria-label="关闭公告"
            className="rounded-md p-1 text-white/80 transition hover:bg-white/10 hover:text-white"
            type="button"
            onClick={closeModal}
          >
            <X size={24} />
          </button>
        </header>

        <div className="max-h-[66vh] overflow-y-auto px-6 py-6">
          <div className="border-l-4 border-[#6254f3] bg-[#eef1ff] p-5">
            <div className="grid gap-3 text-xl font-black leading-8">
              <a className="text-[#111827] transition hover:text-[#4937db]" href={bilibiliQuoteUrl} target="_blank" rel="noreferrer">
                君非亡国之君,臣皆亡国之臣!
              </a>
              <a className="text-[#111827] transition hover:text-[#4937db]" href={zhihuQuoteUrl} target="_blank" rel="noreferrer">
                大明有好皇帝,却无好百姓!
              </a>
            </div>
            <p className="mt-2 text-right text-base font-black text-[#596174]">------ 朱元璋梦男</p>
          </div>

          <div className="mt-6 grid gap-5 border-t border-[#15120d]/10 pt-6">
            <div>
              <h3 className="flex items-center gap-3 text-xl font-black">
                <Image alt="B站小电视" height={32} src="/icons/bilibili-tv.png" width={32} />
                关注我的B站
              </h3>
              <a
                className="mt-3 block font-black text-[#4937db]"
                href={siteConfig.bilibiliChekhovUrl}
                target="_blank"
                rel="noreferrer"
              >
                @契科夫的变色龙
              </a>
              <a
                className="mt-2 block font-black text-[#4937db]"
                href={siteConfig.bilibiliXieUrl}
                target="_blank"
                rel="noreferrer"
              >
                @解雨泽熙
              </a>
            </div>

            <div>
              <h3 className="flex items-center gap-3 text-xl font-black">
                <Image alt="知乎 logo" height={32} src="/icons/zhihu-logo.png" width={32} />
                关注我的知乎账号
              </h3>
              <a
                className="mt-2 inline-block font-black text-[#4937db]"
                href={siteConfig.zhihuUrl}
                target="_blank"
                rel="noreferrer"
              >
                @解雨泽熙
              </a>
            </div>

            <div className="border-l-4 border-[#6254f3] bg-[#eef1ff] p-5">
              <h3 className="text-xl font-black">更新计划</h3>
              <div className="mt-3 grid gap-2 leading-7 text-[#596174]">
                <p>· 111 道普通版题库，每次随机抽取 20 题</p>
                <p>· 核心题 6 道，补充题 14 道</p>
                <p>· 本地评分，不登录，不上传答题记录</p>
                <p>· PRO 专业鉴定模式仍在建设中</p>
              </div>
            </div>

            <div>
              <h3 className="flex items-center gap-3 text-xl font-black">
                <Mail size={28} />
                投稿题目
              </h3>
              <p className="mt-2 inline-block rounded-lg bg-[#f2f3f6] px-4 py-3 font-mono text-[#334155]">
                {siteConfig.submissionEmail}
              </p>
            </div>

            <p className="rounded-lg bg-[#f7f8fb] p-5 leading-8 text-[#667085]">
              本项目旨在以讽刺方式提醒人们避免历史认知偏差。保持理性，独立思考！
            </p>
          </div>
        </div>

        <footer className="flex justify-end bg-[#f7f8fb] px-6 py-5">
          <button
            className="rounded-lg bg-[#2563eb] px-8 py-3 text-lg font-black text-white shadow-lg shadow-blue-600/20"
            type="button"
            onClick={closeModal}
          >
            我知道了
          </button>
        </footer>
      </section>
    </div>
  );
}

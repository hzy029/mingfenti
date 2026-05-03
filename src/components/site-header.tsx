import { ClipboardList, Construction, Home, MessagesSquare, PenLine } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/data/site-config";

function LogoMark() {
  return (
    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#0f8fe8] bg-white text-[#0f8fe8]">
      <span className="text-lg font-black">明</span>
      <span className="absolute -bottom-1 -right-1 h-4 w-2 rotate-[-35deg] rounded-full bg-[#0f8fe8]" />
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex h-[74px] max-w-6xl items-center justify-between px-5 text-base font-black text-[#0f1535]">
        <Link className="flex items-center gap-3" href="/">
          <LogoMark />
          <span className="text-xl">明粉检测器ti</span>
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link className="inline-flex items-center gap-1 rounded-xl px-4 py-3 text-[#4937db] transition hover:bg-[#eef1ff]" href="/">
            <Home size={15} />
            首页
          </Link>
          <Link className="inline-flex items-center gap-1 rounded-xl px-4 py-3 text-[#4937db] transition hover:bg-[#eef1ff]" href="/test">
            <ClipboardList size={15} />
            普通测试
          </Link>
          <Link className="inline-flex items-center gap-1 rounded-xl px-4 py-3 text-[#4937db] transition hover:bg-[#eef1ff]" href="/board">
            <MessagesSquare size={15} />
            留言板
          </Link>
          <span className="inline-flex cursor-not-allowed items-center gap-1 rounded-xl px-4 py-3 text-[#0f1535]/70 transition hover:bg-[#eef1ff]">
            <Construction size={15} />
            PRO 鉴定
          </span>
          <a
            className="inline-flex items-center gap-1 rounded-xl px-4 py-3 transition hover:bg-[#eef1ff]"
            href={siteConfig.bilibiliUrl}
            target="_blank"
            rel="noreferrer"
          >
            <PenLine size={15} />
            我的B站
          </a>
        </div>
      </nav>
    </header>
  );
}

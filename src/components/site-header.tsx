"use client";

import { ClipboardList, Home, Menu, MessagesSquare, PenLine, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { siteConfig } from "@/data/site-config";

function LogoMark() {
  return (
    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#0f8fe8] bg-white text-[#0f8fe8]">
      <span className="text-lg font-black">明</span>
      <span className="absolute -bottom-1 -right-1 h-4 w-2 rotate-[-35deg] rounded-full bg-[#0f8fe8]" />
    </div>
  );
}

const navLinkClass =
  "inline-flex items-center gap-1 rounded-xl px-4 py-3 text-[#4937db] transition hover:bg-[#eef1ff]";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex h-[74px] max-w-6xl items-center justify-between px-5 text-base font-black text-[#0f1535]">
        <Link className="flex min-w-0 items-center gap-3" href="/">
          <LogoMark />
          <span className="truncate text-xl">{siteConfig.name}</span>
        </Link>

        <div className="flex items-center lg:hidden">
          <button
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-[#4937db] transition hover:bg-[#eef1ff]"
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <div className="hidden flex-wrap items-center justify-end gap-2 lg:flex">
          <Link className={navLinkClass} href="/">
            <Home size={15} />
            首页
          </Link>
          <Link className={navLinkClass} href="/test">
            <ClipboardList size={15} />
            普通测试
          </Link>
          <Link className={navLinkClass} href="/board">
            <MessagesSquare size={15} />
            留言板
          </Link>
          <a
            className={navLinkClass}
            href={siteConfig.bilibiliUrl}
            target="_blank"
            rel="noreferrer"
          >
            <PenLine size={15} />
            我的B站
          </a>
        </div>
      </nav>

      {menuOpen ? (
        <div className="border-t border-slate-100 bg-white px-5 py-4 lg:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            <Link className={navLinkClass} href="/" onClick={() => setMenuOpen(false)}>
              <Home size={15} />
              首页
            </Link>
            <Link className={navLinkClass} href="/test" onClick={() => setMenuOpen(false)}>
              <ClipboardList size={15} />
              普通测试
            </Link>
            <Link className={navLinkClass} href="/board" onClick={() => setMenuOpen(false)}>
              <MessagesSquare size={15} />
              留言板
            </Link>
            <a
              className={navLinkClass}
              href={siteConfig.bilibiliUrl}
              rel="noreferrer"
              target="_blank"
              onClick={() => setMenuOpen(false)}
            >
              <PenLine size={15} />
              我的B站
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}

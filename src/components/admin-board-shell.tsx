"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin/board/login", label: "登录" },
  { href: "/admin/board/new-topic", label: "发布新主题" },
  { href: "/admin/board/topics", label: "管理主题与回答" }
];

export function AdminBoardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50">
      <aside className="flex w-52 shrink-0 flex-col border-r border-slate-800 bg-slate-900/80 px-3 py-8 sm:w-56">
        <p className="px-2 text-[11px] font-black uppercase tracking-wide text-slate-500">留言板管理</p>
        <nav className="mt-4 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "rounded-xl px-3 py-2.5 text-sm font-black transition",
                  active ? "bg-[#6366f1]/25 text-[#c7d2fe]" : "text-slate-300 hover:bg-slate-800/80 hover:text-slate-50"
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0 flex-1 overflow-auto px-3 py-6 sm:px-5 sm:py-8">
        <div className="w-full max-w-none">{children}</div>
      </div>
    </div>
  );
}

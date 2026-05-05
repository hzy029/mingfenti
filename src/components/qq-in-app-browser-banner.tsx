"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

function detectQqInAppBrowser(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  const ua = navigator.userAgent;

  if (/MicroMessenger/i.test(ua)) {
    return false;
  }

  if (/MQQBrowser/i.test(ua)) {
    return true;
  }

  if (/\bQQ\//i.test(ua)) {
    return true;
  }

  return false;
}

export function QqInAppBrowserBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(detectQqInAppBrowser());
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className="sticky top-0 z-40 border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-bold text-amber-950 shadow-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-center gap-3">
        <p className="min-w-0 flex-1 leading-relaxed">
          检测到当前为 QQ 内置浏览器，部分功能可能异常。建议在系统浏览器中打开本站（可复制地址栏链接后用 Chrome / Edge / Safari 打开）。
        </p>
        <button
          aria-label="关闭提示"
          className="shrink-0 rounded-md p-1 text-amber-800 transition hover:bg-amber-200/80"
          type="button"
          onClick={() => setVisible(false)}
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}

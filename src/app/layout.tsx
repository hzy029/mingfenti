import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "明粉检测器ti",
  description: "测测你的明清史观浓度"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { siteConfig } from "@/data/site-config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "新明粉检测器 - 科学检测你的历史认知倾向",
    template: "%s | 新明粉检测器"
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "新明粉检测器 - 科学检测你的历史认知倾向",
    description: siteConfig.description,
    url: "/",
    siteName: siteConfig.name,
    locale: "zh_CN",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "新明粉检测器 - 科学检测你的历史认知倾向",
    description: siteConfig.description
  },
  robots: {
    index: true,
    follow: true
  }
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

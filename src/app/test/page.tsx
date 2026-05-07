import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { TestIntroView } from "@/components/test-intro-view";

export const metadata: Metadata = {
  title: "普通测试 - 20 道判断题快速鉴定",
  description: "新明粉检测器普通测试入口。通过 20 道判断题，快速检测你的明清史观认知偏差程度并生成即时结果。",
  alternates: {
    canonical: "/test"
  },
  openGraph: {
    title: "普通测试 - 20 道判断题快速鉴定",
    description: "通过 20 道判断题，快速检测你的明清史观认知偏差程度。",
    url: "/test"
  }
};

export default function TestIntroPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "首页",
        item: "https://mingfen.sbs/"
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "普通测试",
        item: "https://mingfen.sbs/test"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <SiteHeader />
      <TestIntroView variant="lite" />
    </>
  );
}

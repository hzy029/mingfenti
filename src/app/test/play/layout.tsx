import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "普通测试答题中",
  robots: {
    index: false,
    follow: false
  }
};

export default function TestPlayLayout({ children }: { children: React.ReactNode }) {
  return children;
}

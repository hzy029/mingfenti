import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pro 测试答题中",
  robots: {
    index: false,
    follow: false
  }
};

export default function ProTestPlayLayout({ children }: { children: React.ReactNode }) {
  return children;
}

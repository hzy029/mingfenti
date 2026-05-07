import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pro 测试完成",
  robots: {
    index: false,
    follow: false
  }
};

export default function ProTestCompleteLayout({ children }: { children: React.ReactNode }) {
  return children;
}

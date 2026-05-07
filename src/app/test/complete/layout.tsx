import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "答题完成",
  robots: {
    index: false,
    follow: false
  }
};

export default function TestCompleteLayout({ children }: { children: React.ReactNode }) {
  return children;
}

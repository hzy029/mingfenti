import type { Metadata } from "next";
import { AdminBoardLayoutClient } from "@/components/admin-board-layout-client";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminBoardLayout({ children }: { children: React.ReactNode }) {
  return <AdminBoardLayoutClient>{children}</AdminBoardLayoutClient>;
}

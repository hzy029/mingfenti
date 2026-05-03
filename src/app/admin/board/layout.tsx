import { AdminBoardLayoutClient } from "@/components/admin-board-layout-client";

export default function AdminBoardLayout({ children }: { children: React.ReactNode }) {
  return <AdminBoardLayoutClient>{children}</AdminBoardLayoutClient>;
}

"use client";

import { AdminBoardProvider } from "@/components/admin-board-provider";
import { AdminBoardShell } from "@/components/admin-board-shell";

export function AdminBoardLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <AdminBoardProvider>
      <AdminBoardShell>{children}</AdminBoardShell>
    </AdminBoardProvider>
  );
}

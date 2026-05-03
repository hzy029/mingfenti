"use client";

import { AdminCreateTopicForm } from "@/components/admin-create-topic-form";
import { useAdminBoard } from "@/components/admin-board-provider";

export default function AdminBoardNewTopicPage() {
  const { secret, loadTopics } = useAdminBoard();

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-black">发布新主题</h1>
        <p className="mt-2 text-sm font-bold text-slate-400">用户只能在主题下写回答与评论，不能自行开主题。</p>
      </header>

      {secret.trim() ? (
        <AdminCreateTopicForm
          adminSecret={secret}
          onCreated={() => {
            void loadTopics();
          }}
        />
      ) : (
        <p className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-sm font-bold text-amber-300">
          请先在「登录」页保存管理密钥。
        </p>
      )}
    </>
  );
}

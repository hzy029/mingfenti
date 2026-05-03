"use client";

import { AdminBoardAnswersPanel } from "@/components/admin-board-answers-panel";
import { useAdminBoard } from "@/components/admin-board-provider";

export default function AdminBoardTopicsPage() {
  const {
    secret,
    topics,
    loadingTopics,
    selectedTopicId,
    pinDraft,
    setPinDraft,
    selectTopic,
    updateTopic,
    deleteTopic
  } = useAdminBoard();

  return (
    <>
      <header className="mb-6 lg:mb-8">
        <h1 className="text-2xl font-black sm:text-3xl">管理主题与回答</h1>
        <p className="mt-2 text-sm font-bold text-slate-400">
          左侧选择主题并调整置顶/可见性；右侧管理该主题下的回答与评论。
        </p>
      </header>

      {!secret.trim() ? (
        <p className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-sm font-bold text-amber-300">
          请先在「登录」页保存管理密钥。
        </p>
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-5">
          <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-[13.5rem] lg:min-w-[13.5rem]">
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <h2 className="text-sm font-black text-slate-200">主题 {loadingTopics ? "（加载中）" : ""}</h2>
              <ul className="mt-3 max-h-[70vh] space-y-2 overflow-y-auto pr-1">
                {topics.map((topic) => (
                  <li key={topic.id}>
                    <button
                      className={[
                        "w-full rounded-lg border px-2.5 py-2 text-left text-sm transition",
                        selectedTopicId === topic.id ? "border-[#6366f1] bg-[#6366f1]/10" : "border-slate-800 bg-slate-950 hover:border-slate-600"
                      ].join(" ")}
                      type="button"
                      onClick={() => selectTopic(topic)}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="line-clamp-2 font-black leading-snug text-slate-50">{topic.title}</span>
                        <span className="shrink-0 text-[10px] font-bold text-slate-500">#{topic.id}</span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] font-bold text-slate-500">
                        <span>{topic.reply_count} 答</span>
                        {topic.hidden ? <span className="text-red-400">隐</span> : null}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>

              {selectedTopicId === null ? (
                <p className="mt-4 border-t border-slate-800 pt-3 text-xs font-bold text-slate-500">点击列表选择主题。</p>
              ) : (
                <div className="mt-4 space-y-3 border-t border-slate-800 pt-4">
                  <label className="grid gap-1 text-[11px] font-black text-slate-400">
                    置顶 pin_weight
                    <input
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm font-bold text-slate-50"
                      inputMode="numeric"
                      value={pinDraft}
                      onChange={(event) => setPinDraft(event.target.value)}
                    />
                  </label>
                  <div className="flex flex-col gap-2">
                    <button
                      className="rounded-lg bg-emerald-600 px-2 py-1.5 text-xs font-black text-white"
                      type="button"
                      onClick={() => {
                        const value = Number.parseInt(pinDraft, 10);

                        if (!Number.isFinite(value)) {
                          window.alert("请输入整数");
                          return;
                        }

                        void updateTopic(selectedTopicId, { pinWeight: value });
                      }}
                    >
                      保存权值
                    </button>
                    <button
                      className="rounded-lg bg-amber-600 px-2 py-1.5 text-xs font-black text-white"
                      type="button"
                      onClick={() => {
                        void updateTopic(selectedTopicId, { hidden: true });
                      }}
                    >
                      隐藏主题
                    </button>
                    <button
                      className="rounded-lg bg-slate-700 px-2 py-1.5 text-xs font-black text-white"
                      type="button"
                      onClick={() => {
                        void updateTopic(selectedTopicId, { hidden: false });
                      }}
                    >
                      恢复主题
                    </button>
                    <button
                      className="rounded-lg border border-red-800 bg-red-950/40 px-2 py-1.5 text-xs font-black text-red-200 hover:bg-red-950/70"
                      type="button"
                      onClick={() => void deleteTopic(selectedTopicId)}
                    >
                      删除主题
                    </button>
                  </div>
                </div>
              )}
            </section>
          </aside>

          <div className="min-w-0 flex-1">
            {selectedTopicId === null ? (
              <p className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center text-sm font-bold text-slate-500">
                请在左侧选择一个主题，将在此显示该主题下的回答。
              </p>
            ) : (
              <AdminBoardAnswersPanel key={selectedTopicId} topicId={selectedTopicId} />
            )}
          </div>
        </div>
      )}
    </>
  );
}

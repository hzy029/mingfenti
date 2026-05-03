"use client";

import { useMemo } from "react";
import { AdminBoardAnswersPanel } from "@/components/admin-board-answers-panel";
import { AdminTopicCreateAnswer } from "@/components/admin-topic-create-answer";
import { useAdminBoard } from "@/components/admin-board-provider";

/** 与公开列表排序一致：置顶上墙用较高权值 */
const ADMIN_TOPIC_PINNED_WEIGHT = 500_000;

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
    deleteTopic,
    loadPostsForSelectedTopic
  } = useAdminBoard();

  const selectedTopic = useMemo(
    () => (selectedTopicId === null ? null : topics.find((t) => t.id === selectedTopicId) ?? null),
    [selectedTopicId, topics]
  );

  return (
    <>
      <header className="mb-6 lg:mb-8">
        <h1 className="text-2xl font-black sm:text-3xl">管理主题与回答</h1>
        <p className="mt-2 text-sm font-bold text-slate-400">
          左栏选主题，中栏调整置顶/可见性，右栏管理该主题下的回答与评论。
        </p>
      </header>

      {!secret.trim() ? (
        <p className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-sm font-bold text-amber-300">
          请先在「登录」页保存管理密钥。
        </p>
      ) : (
        <div className="flex min-w-0 flex-nowrap items-start gap-4 overflow-x-auto lg:gap-6 xl:gap-8">
          <aside className="sticky top-6 w-[11rem] shrink-0">
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
                        {topic.pin_weight > 0 ? (
                          <span className="rounded bg-amber-500/20 px-1 font-black text-amber-300">置顶</span>
                        ) : null}
                        {topic.hidden ? <span className="text-red-400">隐</span> : null}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </aside>

          <aside className="sticky top-6 w-[15rem] shrink-0">
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <h2 className="text-sm font-black text-slate-200">主题控制</h2>
              {selectedTopicId === null ? (
                <p className="mt-3 text-xs font-bold leading-5 text-slate-500">
                  在左栏选择一个主题后，可在此调整权值、置顶与可见性。
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  <p className="text-[11px] font-bold leading-5 text-slate-500">
                    当前权值{" "}
                    <span className="font-mono text-slate-300">{selectedTopic?.pin_weight ?? 0}</span>
                    {selectedTopic && selectedTopic.pin_weight > 0 ? (
                      <span className="ml-2 text-amber-400">已置顶</span>
                    ) : null}
                  </p>
                  <label className="grid gap-1 text-[11px] font-black text-slate-400">
                    手填权值
                    <input
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm font-bold text-slate-50"
                      inputMode="numeric"
                      value={pinDraft}
                      onChange={(event) => setPinDraft(event.target.value)}
                    />
                  </label>
                  <button
                    className="w-full rounded-lg bg-emerald-700 px-2 py-1.5 text-xs font-black text-white hover:bg-emerald-600"
                    type="button"
                    onClick={() => {
                      const value = Number.parseInt(pinDraft, 10);

                      if (!Number.isFinite(value)) {
                        window.alert("请输入整数权值");
                        return;
                      }

                      void updateTopic(selectedTopicId, { pinWeight: value });
                    }}
                  >
                    保存权值
                  </button>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-600">快捷置顶</p>
                  <div className="flex flex-col gap-2">
                    <button
                      className="rounded-lg bg-violet-600 px-2 py-1.5 text-xs font-black text-white hover:bg-violet-500"
                      type="button"
                      onClick={() => void updateTopic(selectedTopicId, { pinWeight: ADMIN_TOPIC_PINNED_WEIGHT })}
                    >
                      置顶主题
                    </button>
                    <button
                      className="rounded-lg border border-slate-600 bg-slate-950 px-2 py-1.5 text-xs font-black text-slate-200 hover:bg-slate-800"
                      type="button"
                      onClick={() => void updateTopic(selectedTopicId, { pinWeight: 0 })}
                    >
                      取消置顶
                    </button>
                  </div>
                  <div className="flex flex-col gap-2 border-t border-slate-800 pt-3">
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

          <div className="min-w-0 flex-1 basis-0">
            {selectedTopicId === null ? (
              <p className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center text-sm font-bold text-slate-500">
                请在左栏选择一个主题，将在此管理该主题下的回答。
              </p>
            ) : (
              <>
                <AdminTopicCreateAnswer
                  adminSecret={secret}
                  topicId={selectedTopicId}
                  onPosted={() => void loadPostsForSelectedTopic()}
                />
                <AdminBoardAnswersPanel key={selectedTopicId} topicId={selectedTopicId} />
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { BoardMarkdownBody } from "@/components/board-markdown-body";
import { BoardMarkdownEditor } from "@/components/board-markdown-editor";
import { type AdminPost, useAdminBoard } from "@/components/admin-board-provider";

/** 右侧「该主题下的回答」面板；依赖上下文中的当前选中主题。 */
export function AdminBoardAnswersPanel({ topicId }: { topicId: number }) {
  const {
    secret,
    posts,
    loadingPosts,
    loadPostsForSelectedTopic,
    updatePostHidden,
    savePostBody,
    deletePost,
    postComments,
    commentsForPostId,
    loadingComments,
    loadCommentsForPost,
    updateCommentHidden,
    deleteComment
  } = useAdminBoard();

  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState("");

  useEffect(() => {
    if (!secret.trim()) {
      return;
    }

    void loadPostsForSelectedTopic();
  }, [secret, topicId, loadPostsForSelectedTopic]);

  function beginEdit(post: AdminPost) {
    setEditingPostId(post.id);
    setEditDraft(post.body);
  }

  async function commitEdit() {
    if (editingPostId === null) {
      return;
    }

    await savePostBody(editingPostId, editDraft);
    setEditingPostId(null);
  }

  return (
    <section className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6">
      <h2 className="text-lg font-black sm:text-xl">该主题下的回答 {loadingPosts ? "（加载中）" : ""}</h2>
      <ul className="mt-4 space-y-4">
        {posts.map((post) => (
          <li key={post.id} className="rounded-xl border border-slate-800 bg-slate-950 p-3 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-400">
              <span>回答 #{post.id}</span>
              <span>{post.created_at}</span>
              <span>热度 {post.heat_score}</span>
              {post.hidden ? <span className="text-red-400">已隐藏</span> : <span className="text-emerald-400">显示</span>}
            </div>

            {editingPostId === post.id ? (
              <div className="mt-3 space-y-3">
                <div className="w-full">
                  <BoardMarkdownEditor
                    maxLength={8000}
                    minHeightClass="min-h-[75vh]"
                    placeholder="支持 Markdown；图片仅可插入 https 外链。"
                    textareaRows={28}
                    textareaStyle={{ minHeight: "min(78vh, 52rem)", boxSizing: "border-box" }}
                    tone="dark"
                    value={editDraft}
                    onChange={setEditDraft}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-black text-white"
                    type="button"
                    onClick={() => void commitEdit()}
                  >
                    保存正文
                  </button>
                  <button
                    className="rounded-lg border border-slate-600 px-3 py-2 text-xs font-black text-slate-200"
                    type="button"
                    onClick={() => {
                      setEditingPostId(null);
                      setEditDraft("");
                    }}
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <>
                <BoardMarkdownBody className="mt-2" markdown={post.body} tone="dark" />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    className="rounded-lg bg-[#6366f1] px-3 py-1 text-xs font-black text-white"
                    type="button"
                    onClick={() => beginEdit(post)}
                  >
                    编辑正文
                  </button>
                  <button
                    className="rounded-lg bg-amber-600 px-3 py-1 text-xs font-black text-white"
                    type="button"
                    onClick={() => void updatePostHidden(post.id, true)}
                  >
                    隐藏回答
                  </button>
                  <button
                    className="rounded-lg bg-slate-700 px-3 py-1 text-xs font-black text-white"
                    type="button"
                    onClick={() => void updatePostHidden(post.id, false)}
                  >
                    恢复回答
                  </button>
                  <button
                    className="rounded-lg border border-red-800 bg-red-950/40 px-3 py-1 text-xs font-black text-red-200 hover:bg-red-950/70"
                    type="button"
                    onClick={() => void deletePost(post.id)}
                  >
                    删除回答
                  </button>
                  <button
                    className="rounded-lg border border-slate-600 px-3 py-1 text-xs font-black text-slate-200"
                    type="button"
                    onClick={() => {
                      if (!secret) {
                        return;
                      }

                      void loadCommentsForPost(post.id);
                    }}
                  >
                    管理评论
                  </button>
                </div>
              </>
            )}

            {commentsForPostId === post.id ? (
              <div className="mt-4 border-t border-slate-800 pt-3">
                <p className="text-xs font-bold text-slate-500">该回答下的评论 {loadingComments ? "（加载中）" : ""}</p>
                <ul className="mt-2 space-y-2">
                  {postComments.map((comment) => (
                    <li key={comment.id} className="rounded-lg bg-slate-900/80 p-2 text-xs">
                      <div className="flex flex-wrap justify-between gap-1 font-bold text-slate-500">
                        <span>#{comment.id}</span>
                        <span>{comment.created_at}</span>
                        <span>热度 {comment.heat_score}</span>
                        {comment.hidden ? <span className="text-red-400">已隐藏</span> : <span className="text-emerald-400">显示</span>}
                      </div>
                      <BoardMarkdownBody className="mt-1 text-xs" markdown={comment.body} tone="dark" />
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          className="rounded bg-amber-700 px-2 py-0.5 font-black text-white"
                          type="button"
                          onClick={() => void updateCommentHidden(comment.id, true)}
                        >
                          隐藏
                        </button>
                        <button
                          className="rounded bg-slate-600 px-2 py-0.5 font-black text-white"
                          type="button"
                          onClick={() => void updateCommentHidden(comment.id, false)}
                        >
                          恢复
                        </button>
                        <button
                          className="rounded border border-red-800 bg-red-950/50 px-2 py-0.5 font-black text-red-200"
                          type="button"
                          onClick={() => void deleteComment(comment.id)}
                        >
                          删除
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { BoardMarkdownBody } from "@/components/board-markdown-body";
import { BoardMarkdownEditor } from "@/components/board-markdown-editor";
import { type AdminPost, type AdminReviewStatus, useAdminBoard } from "@/components/admin-board-provider";

/** 管理页：非当前焦点的回答一律预览高度；当前回答默认收起，由右下角按钮展开 */
export function AdminBoardAnswersPanel({ topicId }: { topicId: number }) {
  const {
    secret,
    posts,
    loadingPosts,
    loadPostsForSelectedTopic,
    updatePostHidden,
    updatePostReviewStatus,
    savePostBody,
    deletePost,
    postComments,
    commentsForPostId,
    loadingComments,
    loadCommentsForPost,
    updateCommentHidden,
    updateCommentReviewStatus,
    deleteComment
  } = useAdminBoard();

  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [manualFocusPostId, setManualFocusPostId] = useState<number | null>(null);
  const [currentAnswerExpanded, setCurrentAnswerExpanded] = useState(false);

  const focusPostId = useMemo(() => {
    if (posts.length === 0) {
      return null;
    }

    if (manualFocusPostId !== null && posts.some((p) => p.id === manualFocusPostId)) {
      return manualFocusPostId;
    }

    return posts[0]?.id ?? null;
  }, [posts, manualFocusPostId]);

  useEffect(() => {
    if (!secret.trim()) {
      return;
    }

    void loadPostsForSelectedTopic();
  }, [secret, topicId, loadPostsForSelectedTopic]);

  function beginEdit(post: AdminPost) {
    setEditingPostId(post.id);
    setEditDraft(post.body);
    setManualFocusPostId(post.id);
    setCurrentAnswerExpanded(true);
  }

  async function commitEdit() {
    if (editingPostId === null) {
      return;
    }

    await savePostBody(editingPostId, editDraft);
    setEditingPostId(null);
  }

  function reviewStatusLabel(status: string | null | undefined) {
    if (status === "published") {
      return "已发布";
    }
    if (status === "rejected") {
      return "已拒绝";
    }
    return "待人工审核";
  }

  function reviewStatusClass(status: string | null | undefined) {
    if (status === "published") {
      return "text-emerald-400";
    }
    if (status === "rejected") {
      return "text-red-400";
    }
    return "text-amber-300";
  }

  function ReviewButtons({
    currentStatus,
    onChange
  }: {
    currentStatus: string | null | undefined;
    onChange: (status: AdminReviewStatus) => void;
  }) {
    return (
      <>
        {currentStatus !== "published" ? (
          <button
            className="rounded-lg bg-emerald-700 px-3 py-1 text-xs font-black text-white"
            type="button"
            onClick={() => onChange("published")}
          >
            通过发布
          </button>
        ) : null}
        {currentStatus !== "pending" ? (
          <button
            className="rounded-lg bg-slate-700 px-3 py-1 text-xs font-black text-white"
            type="button"
            onClick={() => onChange("pending")}
          >
            退回待审
          </button>
        ) : null}
        {currentStatus !== "rejected" ? (
          <button
            className="rounded-lg bg-red-900 px-3 py-1 text-xs font-black text-red-100"
            type="button"
            onClick={() => onChange("rejected")}
          >
            拒绝
          </button>
        ) : null}
      </>
    );
  }

  function collapseBodyForPost(postId: number): boolean {
    if (editingPostId === postId) {
      return false;
    }

    const focused = focusPostId === postId;

    return !focused || !currentAnswerExpanded;
  }

  const fabVisible =
    posts.length > 0 &&
    focusPostId !== null &&
    editingPostId !== focusPostId &&
    posts.some((p) => p.id === focusPostId);

  return (
    <section className={`min-w-0 rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6 ${fabVisible ? "pb-24 sm:pb-28" : ""}`}>
      <h2 className="text-lg font-black sm:text-xl">该主题下的回答 {loadingPosts ? "（加载中）" : ""}</h2>
      <p className="mt-2 text-xs font-bold text-slate-500">
        点击上方「回答 #…」信息条可将该条设为当前回答；右下角按钮展开或收起当前回答正文（默认收起）。
      </p>
      <ul className="mt-4 space-y-4">
        {posts.map((post) => (
          <li key={post.id} className="rounded-xl border border-slate-800 bg-slate-950 p-3 sm:p-4">
            <div
              className={[
                "-mx-1 flex cursor-pointer flex-wrap items-center justify-between gap-2 rounded-lg px-1 py-1.5 text-xs font-bold text-slate-400 hover:bg-slate-900/60",
                focusPostId === post.id ? "bg-slate-900/50 ring-1 ring-indigo-500/40" : ""
              ].join(" ")}
              onClick={() => {
                setManualFocusPostId(post.id);
                setCurrentAnswerExpanded(false);
              }}
            >
              <span>回答 #{post.id}</span>
              <span>{post.created_at}</span>
              <span>热度 {post.heat_score}</span>
              <span className={reviewStatusClass(post.review_status)}>{reviewStatusLabel(post.review_status)}</span>
              {post.hidden ? <span className="text-red-400">已隐藏</span> : <span className="text-emerald-400">显示</span>}
            </div>
            {post.review_provider || post.review_verdict || post.review_reason ? (
              <p className="mt-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-bold leading-5 text-slate-400">
                审核：{post.review_provider ?? "unknown"}
                {post.review_model ? ` / ${post.review_model}` : ""}
                {post.review_verdict ? ` / ${post.review_verdict}` : ""}
                {post.review_reason ? `：${post.review_reason}` : ""}
              </p>
            ) : null}

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
                <div
                  className={
                    collapseBodyForPost(post.id)
                      ? "relative max-h-[13rem] overflow-hidden rounded-lg"
                      : "relative"
                  }
                >
                  <BoardMarkdownBody className="mt-2" markdown={post.body} tone="dark" />
                  {collapseBodyForPost(post.id) ? (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent"
                    />
                  ) : null}
                </div>
                <div className="mt-3 flex flex-wrap gap-2" onClick={(event) => event.stopPropagation()}>
                  <button
                    className="rounded-lg bg-[#6366f1] px-3 py-1 text-xs font-black text-white"
                    type="button"
                    onClick={() => beginEdit(post)}
                  >
                    编辑正文
                  </button>
                  <ReviewButtons currentStatus={post.review_status} onChange={(nextStatus) => void updatePostReviewStatus(post.id, nextStatus)} />
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
              <div className="mt-4 border-t border-slate-800 pt-3" onClick={(event) => event.stopPropagation()}>
                <p className="text-xs font-bold text-slate-500">该回答下的评论 {loadingComments ? "（加载中）" : ""}</p>
                <ul className="mt-2 space-y-2">
                  {postComments.map((comment) => (
                    <li key={comment.id} className="rounded-lg bg-slate-900/80 p-2 text-xs">
                      <div className="flex flex-wrap justify-between gap-1 font-bold text-slate-500">
                        <span>#{comment.id}</span>
                        <span>{comment.created_at}</span>
                        <span>热度 {comment.heat_score}</span>
                        <span className={reviewStatusClass(comment.review_status)}>{reviewStatusLabel(comment.review_status)}</span>
                        {comment.hidden ? <span className="text-red-400">已隐藏</span> : <span className="text-emerald-400">显示</span>}
                      </div>
                      {comment.review_provider || comment.review_verdict || comment.review_reason ? (
                        <p className="mt-1 rounded bg-slate-950 px-2 py-1 font-bold leading-5 text-slate-500">
                          审核：{comment.review_provider ?? "unknown"}
                          {comment.review_model ? ` / ${comment.review_model}` : ""}
                          {comment.review_verdict ? ` / ${comment.review_verdict}` : ""}
                          {comment.review_reason ? `：${comment.review_reason}` : ""}
                        </p>
                      ) : null}
                      <BoardMarkdownBody className="mt-1 text-xs" markdown={comment.body} tone="dark" />
                      <div className="mt-2 flex flex-wrap gap-2">
                        <ReviewButtons
                          currentStatus={comment.review_status}
                          onChange={(nextStatus) => void updateCommentReviewStatus(comment.id, nextStatus)}
                        />
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

      {fabVisible ? (
        <button
          className="fixed bottom-6 right-5 z-[200] rounded-full border border-indigo-500/40 bg-slate-950/95 px-4 py-3 text-sm font-black text-white shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-sm transition hover:bg-slate-900 sm:right-8"
          type="button"
          onClick={() => setCurrentAnswerExpanded((open) => !open)}
        >
          {currentAnswerExpanded ? "收起当前回答" : "展开当前回答"}
        </button>
      ) : null}
    </section>
  );
}

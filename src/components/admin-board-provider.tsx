"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type AdminTopic = {
  id: number;
  title: string;
  pin_weight: number;
  hidden: number;
  created_at: string;
  reply_count: number;
  max_post_heat: number;
};

export type AdminPost = {
  id: number;
  author_display: string | null;
  body: string;
  heat_score: number;
  hidden: number;
  created_at: string;
};

export type AdminComment = {
  id: number;
  author_display: string | null;
  body: string;
  heat_score: number;
  hidden: number;
  created_at: string;
};

const STORAGE_KEY = "mingqing-board-admin-secret";

function buildAuthHeaders(secret: string) {
  return { "x-admin-board-secret": secret };
}

type AdminBoardContextValue = {
  secret: string;
  secretInput: string;
  setSecretInput: (value: string) => void;
  status: string | null;
  topics: AdminTopic[];
  loadingTopics: boolean;
  selectedTopicId: number | null;
  setSelectedTopicId: (id: number | null) => void;
  pinDraft: string;
  setPinDraft: (value: string) => void;
  posts: AdminPost[];
  loadingPosts: boolean;
  postComments: AdminComment[];
  commentsForPostId: number | null;
  loadingComments: boolean;
  authHeaders: ReturnType<typeof buildAuthHeaders> | undefined;
  persistSecret: () => void;
  importStoredSecret: () => void;
  loadTopics: () => void;
  selectTopic: (topic: AdminTopic) => void;
  loadPostsForSelectedTopic: () => Promise<void>;
  updateTopic: (topicId: number, payload: { pinWeight?: number; hidden?: boolean }) => Promise<void>;
  updatePostHidden: (postId: number, hidden: boolean) => Promise<void>;
  savePostBody: (postId: number, body: string) => Promise<void>;
  deleteTopic: (topicId: number) => Promise<void>;
  deletePost: (postId: number) => Promise<void>;
  loadCommentsForPost: (postId: number) => void;
  updateCommentHidden: (commentId: number, hidden: boolean) => Promise<void>;
  deleteComment: (commentId: number) => Promise<void>;
};

const AdminBoardContext = createContext<AdminBoardContextValue | null>(null);

export function AdminBoardProvider({ children }: { children: ReactNode }) {
  const [secretInput, setSecretInput] = useState("");
  const [secret, setSecret] = useState("");
  const [topics, setTopics] = useState<AdminTopic[]>([]);
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [pinDraft, setPinDraft] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postComments, setPostComments] = useState<AdminComment[]>([]);
  const [commentsForPostId, setCommentsForPostId] = useState<number | null>(null);
  const [loadingComments, setLoadingComments] = useState(false);

  const authHeaders = useMemo(() => {
    if (!secret) {
      return undefined;
    }
    return buildAuthHeaders(secret);
  }, [secret]);

  const loadTopicsWithSecret = useCallback(async (activeSecret: string) => {
    if (!activeSecret) {
      setStatus("请先填写并保存管理密钥。");
      return;
    }

    setLoadingTopics(true);
    setStatus(null);

    try {
      const response = await fetch("/api/admin/board/topics", { headers: buildAuthHeaders(activeSecret) });
      const payload = (await response.json()) as { ok?: boolean; topics?: AdminTopic[]; reason?: string };

      if (!response.ok || !payload.ok) {
        const reason = payload.reason;
        setStatus(
          reason === "unauthorized"
            ? "密钥与服务器上的 ADMIN_BOARD_SECRET 不一致，请核对 Cloudflare 中配置的 Secret 与本地输入是否完全相同（含空格与末尾符号）。"
            : reason === "database-not-configured"
              ? "当前环境未连接 D1（例如本地 npm run dev）。请在已部署站点打开 /admin/board，或使用带 D1 的预览环境。"
              : reason === "admin-not-configured"
                ? "服务端未设置环境变量 ADMIN_BOARD_SECRET：请在 Cloudflare Worker（如 mingfenti）→ 变量和机密 → 添加同名 Secret，保存后重新部署 Worker。"
                : "加载主题失败。"
        );
        setTopics([]);
        setLoadingTopics(false);
        return;
      }

      setTopics(payload.topics ?? []);
    } catch {
      setStatus("网络错误。");
      setTopics([]);
    } finally {
      setLoadingTopics(false);
    }
  }, []);

  const loadPostsWithSecret = useCallback(async (activeSecret: string, topicId: number) => {
    if (!activeSecret) {
      return;
    }

    setLoadingPosts(true);

    try {
      const response = await fetch(`/api/admin/board/topics/${topicId}/posts`, {
        headers: buildAuthHeaders(activeSecret)
      });
      const payload = (await response.json()) as { ok?: boolean; posts?: AdminPost[] };

      if (!response.ok || !payload.ok) {
        setPosts([]);
      } else {
        setPosts(payload.posts ?? []);
      }
    } catch {
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  const loadTopics = useCallback(() => {
    void loadTopicsWithSecret(secret);
  }, [loadTopicsWithSecret, secret]);

  const selectTopic = useCallback((topic: AdminTopic) => {
    setSelectedTopicId(topic.id);
    setPinDraft(String(topic.pin_weight));
    setPostComments([]);
    setCommentsForPostId(null);
  }, []);

  const loadPostsForSelectedTopic = useCallback(async () => {
    if (!secret.trim() || selectedTopicId === null) {
      setPosts([]);
      return;
    }
    await loadPostsWithSecret(secret, selectedTopicId);
  }, [loadPostsWithSecret, secret, selectedTopicId]);

  function importStoredSecret() {
    const stored = window.sessionStorage.getItem(STORAGE_KEY) ?? "";
    setSecretInput(stored);
    setSecret(stored);
    setStatus(stored ? "已从 sessionStorage 导入密钥，请点击「刷新主题」。" : "sessionStorage 中没有保存的密钥。");
  }

  function persistSecret() {
    const trimmed = secretInput.trim();
    window.sessionStorage.setItem(STORAGE_KEY, trimmed);
    setSecret(trimmed);
    setStatus("已保存到浏览器会话，正在刷新主题列表…");
    void loadTopicsWithSecret(trimmed);
  }

  async function updateTopic(topicId: number, payload: { pinWeight?: number; hidden?: boolean }) {
    if (!authHeaders) {
      window.alert("请先保存密钥");
      return;
    }

    const response = await fetch(`/api/admin/board/topics/${topicId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify(payload)
    });
    const body = (await response.json()) as { ok?: boolean };

    if (!response.ok || !body.ok) {
      window.alert("更新失败");
      return;
    }

    await loadTopicsWithSecret(secret);

    if (selectedTopicId === topicId) {
      await loadPostsWithSecret(secret, topicId);
    }
  }

  async function updatePostHidden(postId: number, hidden: boolean) {
    if (!authHeaders) {
      window.alert("请先保存密钥");
      return;
    }

    const response = await fetch(`/api/admin/board/posts/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ hidden })
    });
    const body = (await response.json()) as { ok?: boolean };

    if (!response.ok || !body.ok) {
      window.alert("更新失败");
      return;
    }

    if (selectedTopicId !== null) {
      await loadPostsWithSecret(secret, selectedTopicId);
    }
  }

  async function savePostBody(postId: number, body: string) {
    if (!authHeaders) {
      window.alert("请先保存密钥");
      return;
    }

    const response = await fetch(`/api/admin/board/posts/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ body })
    });
    const bodyJson = (await response.json()) as { ok?: boolean; reason?: string };

    if (!response.ok || !bodyJson.ok) {
      window.alert(bodyJson.reason === "body-required" ? "正文不能为空。" : "保存失败");
      return;
    }

    if (selectedTopicId !== null) {
      await loadPostsWithSecret(secret, selectedTopicId);
    }
  }

  const fetchCommentsForPost = useCallback(async (activeSecret: string, postId: number) => {
    setLoadingComments(true);
    setCommentsForPostId(postId);

    try {
      const response = await fetch(`/api/admin/board/posts/${postId}/comments`, {
        headers: buildAuthHeaders(activeSecret)
      });
      const payload = (await response.json()) as { ok?: boolean; comments?: AdminComment[] };

      if (!response.ok || !payload.ok) {
        setPostComments([]);
      } else {
        setPostComments(payload.comments ?? []);
      }
    } catch {
      setPostComments([]);
    } finally {
      setLoadingComments(false);
    }
  }, []);

  const loadCommentsForPost = useCallback(
    (postId: number) => {
      if (!secret.trim()) {
        return;
      }
      void fetchCommentsForPost(secret, postId);
    },
    [secret, fetchCommentsForPost]
  );

  async function updateCommentHidden(commentId: number, hidden: boolean) {
    if (!authHeaders) {
      window.alert("请先保存密钥");
      return;
    }

    const response = await fetch(`/api/admin/board/comments/${commentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ hidden })
    });
    const body = (await response.json()) as { ok?: boolean };

    if (!response.ok || !body.ok) {
      window.alert("更新失败");
      return;
    }

    if (commentsForPostId !== null) {
      await fetchCommentsForPost(secret, commentsForPostId);
    }
  }

  async function deleteComment(commentId: number) {
    if (!authHeaders) {
      window.alert("请先保存密钥");
      return;
    }

    if (!window.confirm("将永久删除该评论，且不可恢复。确定删除？")) {
      return;
    }

    const response = await fetch(`/api/admin/board/comments/${commentId}`, {
      method: "DELETE",
      headers: { ...authHeaders }
    });
    const body = (await response.json()) as { ok?: boolean; reason?: string };

    if (!response.ok || !body.ok) {
      window.alert(body.reason === "not-found" ? "评论不存在或已删除。" : "删除失败");
      return;
    }

    if (commentsForPostId !== null) {
      await fetchCommentsForPost(secret, commentsForPostId);
    }
    await loadTopicsWithSecret(secret);
  }

  async function deleteTopic(topicId: number) {
    if (!authHeaders) {
      window.alert("请先保存密钥");
      return;
    }

    if (!window.confirm("将永久删除该主题及其下全部回答与评论，且不可恢复。确定删除？")) {
      return;
    }

    const response = await fetch(`/api/admin/board/topics/${topicId}`, {
      method: "DELETE",
      headers: { ...authHeaders }
    });
    const body = (await response.json()) as { ok?: boolean; reason?: string };

    if (!response.ok || !body.ok) {
      window.alert(body.reason === "not-found" ? "主题不存在或已删除。" : "删除失败");
      return;
    }

    if (selectedTopicId === topicId) {
      setSelectedTopicId(null);
      setPosts([]);
      setPinDraft("");
      setPostComments([]);
      setCommentsForPostId(null);
    }

    await loadTopicsWithSecret(secret);
  }

  async function deletePost(postId: number) {
    if (!authHeaders) {
      window.alert("请先保存密钥");
      return;
    }

    if (!window.confirm("将永久删除该回答及其下全部评论，且不可恢复。确定删除？")) {
      return;
    }

    const response = await fetch(`/api/admin/board/posts/${postId}`, {
      method: "DELETE",
      headers: { ...authHeaders }
    });
    const body = (await response.json()) as { ok?: boolean; reason?: string };

    if (!response.ok || !body.ok) {
      window.alert(body.reason === "not-found" ? "回答不存在或已删除。" : "删除失败");
      return;
    }

    if (commentsForPostId === postId) {
      setPostComments([]);
      setCommentsForPostId(null);
    }

    if (selectedTopicId !== null) {
      await loadPostsWithSecret(secret, selectedTopicId);
    }

    await loadTopicsWithSecret(secret);
  }

  const value: AdminBoardContextValue = {
    secret,
    secretInput,
    setSecretInput,
    status,
    topics,
    loadingTopics,
    selectedTopicId,
    setSelectedTopicId,
    pinDraft,
    setPinDraft,
    posts,
    loadingPosts,
    postComments,
    commentsForPostId,
    loadingComments,
    authHeaders,
    persistSecret,
    importStoredSecret,
    loadTopics,
    selectTopic,
    loadPostsForSelectedTopic,
    updateTopic,
    updatePostHidden,
    savePostBody,
    deleteTopic,
    deletePost,
    loadCommentsForPost,
    updateCommentHidden,
    deleteComment
  };

  return <AdminBoardContext.Provider value={value}>{children}</AdminBoardContext.Provider>;
}

export function useAdminBoard() {
  const ctx = useContext(AdminBoardContext);
  if (!ctx) {
    throw new Error("useAdminBoard must be used within AdminBoardProvider");
  }
  return ctx;
}

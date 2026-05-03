"use client";

import { useSyncExternalStore } from "react";
import { BASIC_TEST_SESSION_STORAGE_KEY } from "@/lib/basic-test-session";
import { isAllowedBoardPostResultId } from "@/lib/board-post-eligibility";

export function readBasicTestResultId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(BASIC_TEST_SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const session = JSON.parse(raw) as { resultId?: string };

    return typeof session.resultId === "string" ? session.resultId : null;
  } catch {
    return null;
  }
}

function subscribeToBasicTestSession(callback: () => void): () => void {
  window.addEventListener("storage", callback);

  return () => window.removeEventListener("storage", callback);
}

/** 客户端：是否允许在留言板发帖（与服务端白名单一致） */
export function useBoardPostPermission(): { ready: boolean; canPost: boolean; resultId: string | null } {
  const resultId = useSyncExternalStore(subscribeToBasicTestSession, readBasicTestResultId, () => undefined);
  const ready = resultId !== undefined;

  const canPost = isAllowedBoardPostResultId(resultId ?? null);

  return { ready, canPost, resultId: resultId ?? null };
}

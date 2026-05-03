"use client";

import { ThumbsUp } from "lucide-react";
import { useState } from "react";

type BoardCommentLikeButtonProps = {
  commentId: number;
  initialHeat: number;
};

export function BoardCommentLikeButton({ commentId, initialHeat }: BoardCommentLikeButtonProps) {
  const [heatScore, setHeatScore] = useState(initialHeat);
  const [pending, setPending] = useState(false);

  async function handleLike() {
    if (pending) {
      return;
    }

    setPending(true);

    try {
      const response = await fetch(`/api/board/comments/${commentId}/like`, { method: "POST" });
      const payload = (await response.json()) as { ok?: boolean; heatScore?: number };

      if (response.ok && payload.ok && typeof payload.heatScore === "number") {
        setHeatScore(payload.heatScore);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-black text-slate-600 transition hover:border-[#4937db]/40 hover:text-[#4937db] disabled:cursor-wait disabled:opacity-60"
      disabled={pending}
      type="button"
      onClick={handleLike}
    >
      <ThumbsUp size={14} />
      {heatScore}
    </button>
  );
}

"use client";

import { ThumbsUp } from "lucide-react";
import { useState } from "react";

type BoardCommentLikeButtonProps = {
  commentId: number;
  initialHeat: number;
  initialAlreadyLiked?: boolean;
};

export function BoardCommentLikeButton({
  commentId,
  initialHeat,
  initialAlreadyLiked = false
}: BoardCommentLikeButtonProps) {
  const [heatScore, setHeatScore] = useState(initialHeat);
  const [alreadyLiked, setAlreadyLiked] = useState(initialAlreadyLiked);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLike() {
    if (pending || alreadyLiked) {
      return;
    }

    setPending(true);
    setError(null);

    try {
      const response = await fetch(`/api/board/comments/${commentId}/like`, { method: "POST" });
      const payload = (await response.json()) as {
        ok?: boolean;
        heatScore?: number;
        alreadyLiked?: boolean;
        reason?: string;
        message?: string;
      };

      if (response.ok && payload.ok && typeof payload.heatScore === "number") {
        setHeatScore(payload.heatScore);
        setAlreadyLiked(true);
      } else if (payload.reason === "like-daily-limit") {
        setError(payload.message ?? "今日点赞次数已达上限。");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        className={[
          "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-60",
          alreadyLiked
            ? "cursor-default border-slate-200/80 bg-slate-100/80 text-slate-400"
            : "border-slate-200 bg-slate-50 text-slate-600 hover:border-[#4937db]/40 hover:text-[#4937db]"
        ].join(" ")}
        disabled={pending || alreadyLiked}
        type="button"
        onClick={() => void handleLike()}
      >
        <ThumbsUp size={14} />
        <span className="tabular-nums">{alreadyLiked ? `已赞 ${heatScore}` : heatScore}</span>
      </button>
      {error ? <span className="max-w-40 text-right text-[11px] font-bold text-red-600">{error}</span> : null}
    </span>
  );
}

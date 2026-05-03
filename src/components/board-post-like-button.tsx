"use client";

import { ThumbsUp } from "lucide-react";
import { useState } from "react";

type BoardPostLikeButtonProps = {
  postId: number;
  initialHeat: number;
  /** 服务端：当前 IP 是否已在 board_likes 中对该回答点赞 */
  initialAlreadyLiked?: boolean;
};

export function BoardPostLikeButton({ postId, initialHeat, initialAlreadyLiked = false }: BoardPostLikeButtonProps) {
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
      const response = await fetch(`/api/board/posts/${postId}/like`, { method: "POST" });
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
          "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60",
          alreadyLiked
            ? "cursor-default border-slate-100 bg-slate-50 text-slate-400"
            : "border-slate-200 bg-white text-slate-700 hover:border-[#4937db]/40 hover:text-[#4937db]"
        ].join(" ")}
        disabled={pending || alreadyLiked}
        type="button"
        onClick={() => void handleLike()}
      >
        <ThumbsUp size={16} />
        {alreadyLiked ? "已赞" : "赞同"} {heatScore}
      </button>
      {error ? <span className="max-w-48 text-right text-xs font-bold text-red-600">{error}</span> : null}
    </span>
  );
}

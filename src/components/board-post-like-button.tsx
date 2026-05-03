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

  async function handleLike() {
    if (pending || alreadyLiked) {
      return;
    }

    setPending(true);

    try {
      const response = await fetch(`/api/board/posts/${postId}/like`, { method: "POST" });
      const payload = (await response.json()) as {
        ok?: boolean;
        heatScore?: number;
        alreadyLiked?: boolean;
      };

      if (response.ok && payload.ok && typeof payload.heatScore === "number") {
        setHeatScore(payload.heatScore);
        setAlreadyLiked(true);
      }
    } finally {
      setPending(false);
    }
  }

  return (
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
  );
}

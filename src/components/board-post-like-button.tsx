"use client";

import { ThumbsUp } from "lucide-react";
import { useState } from "react";

type BoardPostLikeButtonProps = {
  postId: number;
  initialHeat: number;
};

export function BoardPostLikeButton({ postId, initialHeat }: BoardPostLikeButtonProps) {
  const [heatScore, setHeatScore] = useState(initialHeat);
  const [pending, setPending] = useState(false);

  async function handleLike() {
    if (pending) {
      return;
    }

    setPending(true);

    try {
      const response = await fetch(`/api/board/posts/${postId}/like`, { method: "POST" });
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
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-black text-slate-700 transition hover:border-[#4937db]/40 hover:text-[#4937db] disabled:cursor-wait disabled:opacity-60"
      disabled={pending}
      type="button"
      onClick={handleLike}
    >
      <ThumbsUp size={16} />
      赞同 {heatScore}
    </button>
  );
}

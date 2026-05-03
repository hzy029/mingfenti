/** 允许在留言板发帖（回答/评论）的普通版测评 resultId */
export const BOARD_POST_ALLOWED_RESULT_IDS = new Set([
  "objective-neutral",
  "ming-leaning-moe",
  "manchu-loyalist"
]);

export function isAllowedBoardPostResultId(resultId: string | undefined | null): boolean {
  if (!resultId || typeof resultId !== "string") {
    return false;
  }

  return BOARD_POST_ALLOWED_RESULT_IDS.has(resultId.trim());
}

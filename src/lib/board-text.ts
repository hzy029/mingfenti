const TITLE_MAX = 200;
const BODY_MAX = 8000;
const COMMENT_BODY_MAX = 4000;
const AUTHOR_MAX = 64;

export function clampBoardTitle(value: string): string {
  return value.trim().slice(0, TITLE_MAX);
}

export function clampBoardBody(value: string): string {
  return value.trim().slice(0, BODY_MAX);
}

export function clampBoardAuthor(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  return trimmed.slice(0, AUTHOR_MAX);
}

export function clampBoardCommentBody(value: string): string {
  return value.trim().slice(0, COMMENT_BODY_MAX);
}

/** Remove common Markdown from a fragment（编辑器「清除格式」用，尽力保留换行）。 */
export function stripMarkdownFormatting(text: string): string {
  let s = text.replace(/\r\n/g, "\n");
  s = s.replace(/```[\s\S]*?```/g, "\n");
  s = s.replace(/~~~[\s\S]*?~~~/g, "\n");
  s = s.replace(/`([^`]*)`/g, "$1");
  s = s.replace(/!\[[^\]]*\]\([^)]*\)/g, "");
  s = s.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
  s = s.replace(/^#{1,6}\s+/gm, "");
  s = s.replace(/\*\*([^*]+)\*\*/g, "$1");
  s = s.replace(/__([^_]+)__/g, "$1");
  s = s.replace(/~~([^~]+)~~/g, "$1");
  s = s.replace(/^\s{0,3}[-*+]\s+/gm, "");
  s = s.replace(/^\s{0,3}\d+\.\s+/gm, "");
  s = s.replace(/^\s{0,3}>\s?/gm, "");
  s = s.replace(/\[\^\d+\]/g, "");
  s = s.replace(/\n\[\^\d+\]:[^\n]*/g, "");
  s = s.replace(/(\*\*|__|\*|_|`)/g, "");
  s = s.replace(/^[ \t]*-{3,}[ \t]*$/gm, "");
  return s.replace(/\n{3,}/g, "\n\n").trim();
}

/** Strip common Markdown for one-line homepage previews (best-effort). */
export function stripMarkdownForPreview(md: string): string {
  let s = md;
  s = s.replace(/```[\s\S]*?```/g, " ");
  s = s.replace(/~~~[\s\S]*?~~~/g, " ");
  s = s.replace(/`[^`]*`/g, " ");
  s = s.replace(/!\[[^\]]*\]\([^)]*\)/g, " ");
  s = s.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
  s = s.replace(/^#{1,6}\s+/gm, "");
  s = s.replace(/(\*\*|__|~~)/g, "");
  s = s.replace(/[*_]/g, "");
  return s.replace(/\s+/g, " ").trim();
}

export function previewBoardBody(body: string, maxLength = 160): string {
  const normalized = body.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1)}…`;
}

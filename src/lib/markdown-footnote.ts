/** GFM 脚注：正文插入 `[^n]`，文末维护 `[^n]: ...` 定义行（单行）。 */

export function insertFootnoteReferenceAtCursor(markdown: string, cursorPos: number, n: number, text: string, url: string): string {
  const marker = `[^${n}]`;
  const clampedPos = Math.max(0, Math.min(cursorPos, markdown.length));
  const withMarker = markdown.slice(0, clampedPos) + marker + markdown.slice(clampedPos);
  return upsertGfmFootnoteDefinition(withMarker, n, text, url);
}

export function upsertGfmFootnoteDefinition(markdown: string, n: number, text: string, url: string): string {
  const body = text.trim();

  if (!body) {
    return markdown;
  }

  const urlTrim = url.trim();
  const defLine = urlTrim ? `${body} [来源](${urlTrim})` : body;
  const fullDef = `[^${n}]: ${defLine}`;

  const lines = markdown.split(/\r?\n/);
  const filtered = lines.filter((line) => !new RegExp(`^\\[\\^${n}\\]:\\s*`).test(line.trim()));
  const base = filtered.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd();

  return `${base}\n\n${fullDef}\n`;
}

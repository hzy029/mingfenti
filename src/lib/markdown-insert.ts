/** Insert or wrap Markdown in a controlled textarea; restores focus and selection on the next frame. */

function scheduleSelection(el: HTMLTextAreaElement, start: number, end: number) {
  queueMicrotask(() => {
    el.focus();
    el.setSelectionRange(start, end);
  });
}

export function wrapMarkdownSelection(
  el: HTMLTextAreaElement,
  fullText: string,
  setFullText: (next: string) => void,
  before: string,
  after: string,
  emptyPlaceholder: string
) {
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const selected = fullText.slice(start, end);
  const middle = selected || emptyPlaceholder;
  const next = fullText.slice(0, start) + before + middle + after + fullText.slice(end);
  setFullText(next);

  if (selected) {
    scheduleSelection(el, start + before.length + selected.length + after.length, start + before.length + selected.length + after.length);
  } else {
    const innerStart = start + before.length;
    scheduleSelection(el, innerStart, innerStart + middle.length);
  }
}

export function insertAtCurrentLineStart(
  el: HTMLTextAreaElement,
  fullText: string,
  setFullText: (next: string) => void,
  prefix: string
) {
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const beforeCursor = fullText.slice(0, start);
  const lineStart = beforeCursor.lastIndexOf("\n") + 1;
  const next = fullText.slice(0, lineStart) + prefix + fullText.slice(lineStart);
  const delta = prefix.length;
  setFullText(next);
  scheduleSelection(el, start + delta, end + delta);
}

export function insertSnippetAtCursor(
  el: HTMLTextAreaElement,
  fullText: string,
  setFullText: (next: string) => void,
  snippet: string,
  selectionFromSnippetStart: [number, number]
) {
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const next = fullText.slice(0, start) + snippet + fullText.slice(end);
  setFullText(next);
  const [relStart, relEnd] = selectionFromSnippetStart;
  scheduleSelection(el, start + relStart, start + relEnd);
}

export function nextFootnoteIndex(markdown: string): number {
  let max = 0;

  for (const match of markdown.matchAll(/\[\^(\d+)\]/g)) {
    const n = Number.parseInt(match[1] ?? "0", 10);

    if (Number.isFinite(n)) {
      max = Math.max(max, n);
    }
  }

  return max + 1;
}

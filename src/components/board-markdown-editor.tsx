"use client";

import {
  Braces,
  Code2,
  Eraser,
  Heading2,
  Image as ImageIcon,
  Italic,
  List,
  Minus,
  NotebookText,
  Redo2,
  TextQuote,
  Undo2,
  Bold as BoldIcon
} from "lucide-react";
import { useRef, useState, type CSSProperties } from "react";
import { BoardMarkdownBody } from "@/components/board-markdown-body";
import { FootnoteInsertModal, type FootnoteInsertPayload } from "@/components/footnote-insert-modal";
import { useMarkdownUndo } from "@/hooks/use-markdown-undo";
import { stripMarkdownFormatting } from "@/lib/board-text";
import { insertFootnoteReferenceAtCursor } from "@/lib/markdown-footnote";
import { insertAtCurrentLineStart, insertSnippetAtCursor, nextFootnoteIndex, wrapMarkdownSelection } from "@/lib/markdown-insert";

type BoardMarkdownEditorProps = {
  value: string;
  onChange: (next: string) => void;
  maxLength: number;
  minHeightClass?: string;
  /** 浏览器原生行数（可选）；与 minHeightClass 一起用于拉大编辑区 */
  textareaRows?: number;
  /** 直接作用于 textarea 的内联样式（优先级高于 class，用于确保最小高度等） */
  textareaStyle?: CSSProperties;
  placeholder?: string;
  tone?: "light" | "dark";
  textareaRequired?: boolean;
};

function ToolbarDivider({ tone }: { tone: "light" | "dark" }) {
  return (
    <span
      aria-hidden
      className={[
        "mx-0.5 hidden h-8 w-px shrink-0 sm:inline-block",
        tone === "dark" ? "bg-slate-600" : "bg-slate-300"
      ].join(" ")}
    />
  );
}

export function BoardMarkdownEditor({
  value,
  onChange,
  maxLength,
  minHeightClass = "min-h-40",
  textareaRows,
  textareaStyle,
  placeholder,
  tone = "light",
  textareaRequired = true
}: BoardMarkdownEditorProps) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const footnoteCursorRef = useRef(0);
  const [showPreview, setShowPreview] = useState(false);
  const [footnoteModalOpen, setFootnoteModalOpen] = useState(false);
  const [footnoteModalKey, setFootnoteModalKey] = useState(0);
  const [headingKey, setHeadingKey] = useState(0);
  const [listKey, setListKey] = useState(0);
  const { onUserInput, commitSnapshot, undo, redo } = useMarkdownUndo(value, onChange);

  const dark = tone === "dark";

  const toolBtn = [
    "inline-flex shrink-0 flex-col items-center justify-center gap-0.5 rounded border px-1.5 py-1 text-[10px] font-black leading-none transition sm:min-w-[44px]",
    dark
      ? "border-slate-600 bg-slate-950 text-slate-200 hover:bg-slate-900 disabled:opacity-40"
      : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 disabled:opacity-40"
  ].join(" ");

  const selectCls = [
    "max-w-[5.5rem] rounded border py-1 pl-1 pr-0 text-[10px] font-black sm:max-w-[6.5rem]",
    dark ? "border-slate-600 bg-slate-950 text-slate-200" : "border-slate-200 bg-white text-slate-800"
  ].join(" ");

  function runWithTextarea(run: (el: HTMLTextAreaElement) => void) {
    const el = taRef.current;

    if (el) {
      run(el);
    }
  }

  function applyToolbar(run: (el: HTMLTextAreaElement) => void) {
    commitSnapshot();
    runWithTextarea(run);
  }

  function handleClearFormat() {
    commitSnapshot();
    runWithTextarea((el) => {
      const a = el.selectionStart;
      const b = el.selectionEnd;

      if (a !== b) {
        const stripped = stripMarkdownFormatting(value.slice(a, b));
        onChange(value.slice(0, a) + stripped + value.slice(b));
      } else {
        onChange(stripMarkdownFormatting(value));
      }
    });
  }

  function openFootnoteModal() {
    commitSnapshot();
    const el = taRef.current;
    footnoteCursorRef.current = el?.selectionStart ?? value.length;
    setFootnoteModalKey((k) => k + 1);
    setFootnoteModalOpen(true);
  }

  function handleFootnoteInsert(payload: FootnoteInsertPayload) {
    const next = insertFootnoteReferenceAtCursor(value, footnoteCursorRef.current, payload.n, payload.text, payload.url);
    onChange(next);
    setFootnoteModalOpen(false);
    const marker = `[^${payload.n}]`;
    const pos = footnoteCursorRef.current + marker.length;
    queueMicrotask(() => {
      const ta = taRef.current;
      ta?.focus();
      ta?.setSelectionRange(pos, pos);
    });
  }

  function handleInsertImage() {
    commitSnapshot();
    runWithTextarea((el) => {
      const altRaw = window.prompt("图片说明（alt 文字）", "配图");

      if (altRaw === null) {
        return;
      }

      const urlRaw = window.prompt("图片地址（须 https://，外链图床）", "https://");

      if (urlRaw === null) {
        return;
      }

      const url = urlRaw.trim();
      const alt = altRaw.trim() || "图片";

      if (!/^https:\/\//i.test(url)) {
        window.alert("仅支持以 https:// 开头的图片地址。");
        return;
      }

      const snippet = `\n\n![${alt.replace(/]/g, "")}](${url})\n\n`;
      insertSnippetAtCursor(el, value, onChange, snippet, [snippet.length, snippet.length]);
    });
  }

  function handleInsertToc() {
    applyToolbar((el) => {
      const snippet =
        "\n\n## 目录\n\n- [第一节](#第一节)\n- [第二节](#第二节)\n- [第三节](#第三节)\n\n> 请将锚点文字改成与你文中标题一致（视渲染器而定，可发布后微调）。\n\n";
      const len = snippet.length;
      insertSnippetAtCursor(el, value, onChange, snippet, [len, len]);
    });
  }

  function handleInsertHr() {
    applyToolbar((el) => {
      const snippet = "\n\n---\n\n";
      const len = snippet.length;
      insertSnippetAtCursor(el, value, onChange, snippet, [len, len]);
    });
  }

  function handleInsertCodeFence() {
    applyToolbar((el) => {
      const snippet = "\n\n```\n在此粘贴代码\n```\n\n";
      const ph = "在此粘贴代码";
      const i = snippet.indexOf(ph);
      insertSnippetAtCursor(el, value, onChange, snippet, [i, i + ph.length]);
    });
  }

  return (
    <div className="grid gap-2">
      <div
        className={[
          "flex flex-wrap items-stretch gap-1 rounded-lg border p-1.5 sm:gap-1",
          dark ? "border-slate-600 bg-slate-900/60" : "border-slate-200 bg-slate-50"
        ].join(" ")}
      >
        <button className={toolBtn} title="撤销" type="button" onClick={() => undo()}>
          <Undo2 size={16} strokeWidth={2.25} />
          <span>撤销</span>
        </button>
        <button className={toolBtn} title="重做" type="button" onClick={() => redo()}>
          <Redo2 size={16} strokeWidth={2.25} />
          <span>重做</span>
        </button>
        <button className={toolBtn} title="清除格式" type="button" onClick={handleClearFormat}>
          <Eraser size={16} strokeWidth={2.25} />
          <span>清除格式</span>
        </button>

        <ToolbarDivider tone={tone} />

        <div className={`flex items-center gap-0.5 rounded border px-0.5 py-0.5 ${dark ? "border-slate-600 bg-slate-950" : "border-slate-200 bg-white"}`}>
          <Heading2 size={14} className={dark ? "text-slate-500" : "text-slate-400"} />
          <select
            key={headingKey}
            aria-label="标题级别"
            className={selectCls}
            defaultValue=""
            onChange={(event) => {
              const v = event.target.value;

              if (!v) {
                return;
              }

              const level = Number.parseInt(v, 10);

              if (!Number.isFinite(level) || level < 1 || level > 6) {
                return;
              }

              applyToolbar((el) => insertAtCurrentLineStart(el, value, onChange, `${"#".repeat(level)} `));
              setHeadingKey((k) => k + 1);
            }}
          >
            <option value="">标题</option>
            <option value="1">H1</option>
            <option value="2">H2</option>
            <option value="3">H3</option>
            <option value="4">H4</option>
          </select>
        </div>

        <button
          className={toolBtn}
          title="加粗"
          type="button"
          onClick={() => applyToolbar((el) => wrapMarkdownSelection(el, value, onChange, "**", "**", "加粗"))}
        >
          <BoldIcon size={16} strokeWidth={2.25} />
          <span>加粗</span>
        </button>
        <button
          className={toolBtn}
          title="斜体"
          type="button"
          onClick={() => applyToolbar((el) => wrapMarkdownSelection(el, value, onChange, "*", "*", "斜体"))}
        >
          <Italic size={16} strokeWidth={2.25} />
          <span>斜体</span>
        </button>

        <ToolbarDivider tone={tone} />

        <div className={`flex items-center gap-0.5 rounded border px-0.5 py-0.5 ${dark ? "border-slate-600 bg-slate-950" : "border-slate-200 bg-white"}`}>
          <List size={14} className={dark ? "text-slate-500" : "text-slate-400"} />
          <select
            key={listKey}
            aria-label="列表类型"
            className={selectCls}
            defaultValue=""
            onChange={(event) => {
              const v = event.target.value;

              if (v === "ul") {
                applyToolbar((el) => insertAtCurrentLineStart(el, value, onChange, "- "));
              } else if (v === "ol") {
                applyToolbar((el) => insertAtCurrentLineStart(el, value, onChange, "1. "));
              }

              setListKey((k) => k + 1);
            }}
          >
            <option value="">列表</option>
            <option value="ul">无序</option>
            <option value="ol">有序</option>
          </select>
        </div>

        <button className={toolBtn} title="目录模板" type="button" onClick={handleInsertToc}>
          <NotebookText size={16} strokeWidth={2.25} />
          <span>目录</span>
        </button>
        <button
          className={toolBtn}
          title="引用"
          type="button"
          onClick={() => applyToolbar((el) => insertAtCurrentLineStart(el, value, onChange, "> "))}
        >
          <TextQuote size={16} strokeWidth={2.25} />
          <span>引用</span>
        </button>
        <button className={toolBtn} title="分割线" type="button" onClick={handleInsertHr}>
          <Minus size={16} strokeWidth={2.25} />
          <span>分割线</span>
        </button>
        <button className={toolBtn} title="代码块" type="button" onClick={handleInsertCodeFence}>
          <Code2 size={16} strokeWidth={2.25} />
          <span>代码块</span>
        </button>
        <button className={toolBtn} title="插入注释" type="button" onClick={openFootnoteModal}>
          <Braces size={16} strokeWidth={2.25} />
          <span>注释</span>
        </button>

        <ToolbarDivider tone={tone} />

        <button className={toolBtn} title="图片（外链 https）" type="button" onClick={handleInsertImage}>
          <ImageIcon size={16} strokeWidth={2.25} />
          <span>图片</span>
        </button>
        <button
          className={toolBtn}
          title="超链接"
          type="button"
          onClick={() =>
            applyToolbar((el) => {
              const urlRaw = window.prompt("链接地址（https:// 或 http://）", "https://");

              if (urlRaw === null) {
                return;
              }

              const url = urlRaw.trim() || "https://";
              wrapMarkdownSelection(el, value, onChange, "[", `](${url})`, "链接文字");
            })
          }
        >
          <span className="text-xs font-black">🔗</span>
          <span>链接</span>
        </button>

        <ToolbarDivider tone={tone} />

        <button
          className={[
            toolBtn,
            showPreview ? (dark ? "border-[#818cf8] bg-slate-800" : "border-[#4937db] bg-[#e3e7ff]") : ""
          ].join(" ")}
          title="预览"
          type="button"
          onClick={() => setShowPreview((v) => !v)}
        >
          <span className="text-xs font-black">▣</span>
          <span>{showPreview ? "关预览" : "预览"}</span>
        </button>
      </div>

      <textarea
        ref={taRef}
        required={textareaRequired}
        className={[
          "w-full resize-y rounded-xl border px-4 py-3 font-mono text-sm font-bold leading-7 outline-none focus:ring-2",
          minHeightClass,
          dark
            ? "border-slate-600 bg-slate-950 text-slate-50 ring-[#818cf8]/30"
            : "border-slate-200 bg-white text-slate-900 ring-[#4937db]/30"
        ].join(" ")}
        maxLength={maxLength}
        placeholder={placeholder}
        rows={textareaRows}
        style={textareaStyle}
        value={value}
        onChange={(event) => onUserInput(event.target.value)}
      />

      {showPreview ? (
        <div
          className={[
            "rounded-xl border border-dashed p-4",
            dark ? "border-slate-600 bg-slate-900/80" : "border-slate-300 bg-white"
          ].join(" ")}
        >
          <p className={["text-xs font-black", dark ? "text-slate-500" : "text-slate-500"].join(" ")}>预览</p>
          {value.trim() ? (
            <BoardMarkdownBody className="mt-2" markdown={value} tone={tone === "dark" ? "dark" : "light"} />
          ) : (
            <p className={["mt-2 text-sm font-bold", dark ? "text-slate-500" : "text-slate-400"].join(" ")}>暂无内容</p>
          )}
        </div>
      ) : null}

      <FootnoteInsertModal
        key={footnoteModalKey}
        open={footnoteModalOpen}
        suggestedN={nextFootnoteIndex(value)}
        tone={tone}
        onClose={() => setFootnoteModalOpen(false)}
        onInsert={handleFootnoteInsert}
      />
    </div>
  );
}

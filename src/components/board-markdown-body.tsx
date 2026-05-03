"use client";

import { Children, cloneElement, isValidElement, useMemo } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type BoardMarkdownBodyProps = {
  markdown: string;
  className?: string;
  /** 管理页深色背景用 `dark` */
  tone?: "light" | "dark";
};

function isSafeHref(href: string | undefined): href is string {
  if (!href) {
    return false;
  }

  const trimmed = href.trim();

  return /^(https?:\/\/|mailto:)/i.test(trimmed);
}

function isSafeImgSrc(src: string | undefined): src is string {
  if (!src) {
    return false;
  }

  return /^https:\/\//i.test(src.trim());
}

function buildMarkdownComponents(dark: boolean): Components {
  const h1 = dark ? "text-slate-50" : "text-slate-900";
  const h234 = dark ? "text-slate-50" : "text-slate-900";
  const body = dark ? "text-slate-200" : "text-slate-800";
  const muted = dark ? "text-slate-400" : "text-slate-700";
  const strongC = dark ? "text-white" : "text-slate-900";
  const emC = dark ? "text-slate-300" : "text-slate-800";
  const bqBorder = dark ? "border-slate-600" : "border-slate-300";
  const bqText = dark ? "text-slate-300" : "text-slate-700";
  const inlineCodeBg = dark ? "bg-slate-800 text-slate-100" : "bg-slate-100 text-slate-900";
  const hrBorder = dark ? "border-slate-700" : "border-slate-200";
  const tableBorder = dark ? "border-slate-600" : "border-slate-300";

  return {
    h1: ({ children, ...props }) => (
      <h1 className={`mt-5 text-2xl font-black first:mt-0 ${h1}`} {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 className={`mt-4 text-xl font-black first:mt-0 ${h234}`} {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 className={`mt-3 text-lg font-black first:mt-0 ${h234}`} {...props}>
        {children}
      </h3>
    ),
    h4: ({ children, ...props }) => (
      <h4 className={`mt-3 text-base font-black first:mt-0 ${h234}`} {...props}>
        {children}
      </h4>
    ),
    h5: ({ children, ...props }) => (
      <h5 className={`mt-3 text-sm font-black first:mt-0 ${h234}`} {...props}>
        {children}
      </h5>
    ),
    h6: ({ children, ...props }) => (
      <h6 className={`mt-3 text-sm font-black first:mt-0 ${h234}`} {...props}>
        {children}
      </h6>
    ),
    p: ({ children, ...props }) => (
      <p className={`mt-2 font-bold leading-8 first:mt-0 ${body}`} {...props}>
        {children}
      </p>
    ),
    ul: ({ children, ...props }) => (
      <ul className={`mt-2 list-disc space-y-1 pl-6 font-bold ${body}`} {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className={`mt-2 list-decimal space-y-1 pl-6 font-bold ${body}`} {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className="leading-7" {...props}>
        {children}
      </li>
    ),
    blockquote: ({ children, ...props }) => (
      <blockquote className={`mt-3 border-l-4 pl-4 font-bold italic ${bqBorder} ${bqText}`} {...props}>
        {children}
      </blockquote>
    ),
    strong: ({ children, ...props }) => (
      <strong className={`font-black ${strongC}`} {...props}>
        {children}
      </strong>
    ),
    em: ({ children, ...props }) => (
      <em className={`italic ${emC}`} {...props}>
        {children}
      </em>
    ),
    del: ({ children, ...props }) => (
      <del className={`line-through ${muted}`} {...props}>
        {children}
      </del>
    ),
    code: ({ className, children, ...props }) => {
      const inline = !className;

      if (inline) {
        return (
          <code className={`rounded px-1.5 py-0.5 font-mono text-sm ${inlineCodeBg}`} {...props}>
            {children}
          </code>
        );
      }

      return (
        <code className="block font-mono text-sm leading-relaxed text-slate-100" {...props}>
          {children}
        </code>
      );
    },
    pre: ({ children, ...props }) => (
      <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-3 text-sm" {...props}>
        {children}
      </pre>
    ),
    a: ({ href, children, ...props }) => {
      const propsRecord = props as Record<string, unknown>;

      if (propsRecord["data-footnote-backref"] !== undefined) {
        return (
          <a
            {...props}
            aria-label="返回正文"
            className={`ml-0.5 inline-flex min-h-[1.25rem] min-w-[1.25rem] items-center justify-center align-middle text-base font-black text-slate-500 no-underline hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200`}
            href={href}
          >
            ^
          </a>
        );
      }

      if (propsRecord["data-footnote-ref"] !== undefined) {
        const linkCls = dark
          ? "font-black text-[#818cf8] underline decoration-1 underline-offset-2 hover:text-[#a5b4fc]"
          : "font-black text-[#4937db] underline decoration-1 underline-offset-2 hover:text-[#3b2fc4]";

        return (
          <a {...props} className={linkCls} href={href}>
            {children}
          </a>
        );
      }

      if (!isSafeHref(href)) {
        return <span className={`font-bold ${muted}`}>{children}</span>;
      }

      const linkClass = dark
        ? "font-black text-[#818cf8] underline decoration-2 underline-offset-2 hover:text-[#a5b4fc]"
        : "font-black text-[#4937db] underline decoration-2 underline-offset-2 hover:text-[#3b2fc4]";

      return (
        <a className={linkClass} href={href!.trim()} rel="noopener noreferrer" target="_blank" {...props}>
          {children}
        </a>
      );
    },
    hr: (props) => <hr className={`my-6 ${hrBorder}`} {...props} />,
    img: ({ src, alt, ...props }) => {
      const srcStr = typeof src === "string" ? src : undefined;

      if (!isSafeImgSrc(srcStr)) {
        return (
          <span className={`my-2 inline-block text-sm font-bold ${dark ? "text-amber-400" : "text-amber-700"}`}>
            [图片须使用以 https:// 开头的外链地址]
          </span>
        );
      }

      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={alt ?? ""}
          className="my-3 max-h-[min(480px,70vh)] max-w-full rounded-lg border border-slate-200 object-contain dark:border-slate-600"
          decoding="async"
          loading="lazy"
          src={srcStr.trim()}
          {...props}
        />
      );
    },
    table: ({ children, ...props }) => (
      <div className="my-3 overflow-x-auto">
        <table className={`min-w-full border-collapse border text-left text-sm font-bold ${tableBorder} ${body}`} {...props}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }) => <thead className={dark ? "bg-slate-800/80" : "bg-slate-100"} {...props}>{children}</thead>,
    tbody: ({ children, ...props }) => <tbody {...props}>{children}</tbody>,
    tr: ({ children, ...props }) => <tr {...props}>{children}</tr>,
    th: ({ children, ...props }) => (
      <th className={`border px-2 py-1.5 ${tableBorder} font-black`} {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td className={`border px-2 py-1.5 ${tableBorder}`} {...props}>
        {children}
      </td>
    ),
    sup: ({ children, ...props }) => {
      const arr = Children.toArray(children);
      const link = arr.find((c) => isValidElement(c) && c.type === "a");

      if (link && isValidElement(link)) {
        const href = (link.props as { href?: string }).href;

        if (href?.includes("user-content-fn")) {
          const num = (link.props as { children?: React.ReactNode }).children;
          const linkCls = dark
            ? "font-black text-[#818cf8] underline decoration-1 underline-offset-2 hover:text-[#a5b4fc]"
            : "font-black text-[#4937db] underline decoration-1 underline-offset-2 hover:text-[#3b2fc4]";

          return (
            <sup {...props} className="align-super ml-0.5 inline text-[0.72em] font-black leading-none">
              {cloneElement(link as React.ReactElement<{ className?: string; children?: React.ReactNode }>, {
                className: linkCls,
                children: `[${String(num)}]`
              })}
            </sup>
          );
        }
      }

      return <sup {...props}>{children}</sup>;
    },
    section: ({ className, children, ...props }) => {
      const cn = typeof className === "string" ? className : "";

      if (cn.includes("footnotes")) {
        const filtered = Children.toArray(children).filter((child) => {
          if (!isValidElement(child)) {
            return true;
          }

          if (child.type === "h2" && (child.props as { id?: string }).id === "footnote-label") {
            return false;
          }

          return true;
        });

        return (
          <section {...props} className={`${cn} mt-8 border-t border-slate-200 pt-6 dark:border-slate-700`}>
            <h2 className={`mb-3 text-lg font-black ${dark ? "text-slate-50" : "text-slate-900"}`} id="footnote-label">
              参考
            </h2>
            {filtered}
          </section>
        );
      }

      return (
        <section className={className} {...props}>
          {children}
        </section>
      );
    },
  };
}

export function BoardMarkdownBody({ markdown, className, tone = "light" }: BoardMarkdownBodyProps) {
  const dark = tone === "dark";
  const components = useMemo(() => buildMarkdownComponents(dark), [dark]);

  return (
    <div className={["board-markdown max-w-none", className].filter(Boolean).join(" ")}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}

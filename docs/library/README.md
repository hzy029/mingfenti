# 主题资料库

本目录是面向 AI 检索与程序化抓取的主题化资料库维护入口（**站内不设列表导航**，对外以 `/ai/library-index.json`、各篇 `/library/…` 与 `/library-raw/…` 为主）。`docs/references/` 仍保留为来源档案与样本；**已公开、带统一元数据维护的原文**以本目录 `articles/` 为准。

## 目录结构

- `articles/paper-archive/`：`docs/references/papers/` 批量导入的论文/书摘类 Markdown（中文文件名）。
- `articles/song-ming-finance/本人内容/`：站主原创，自 `docs/references/本人内容/` 导入。
- `articles/song-ming-finance/zhihu/`：知乎搬运整理，自 `docs/references/zhihu/` 导入。
- `library-AI检索索引.md`：由 `npm run generate:library-index` 自动生成。

站点路由为多段路径（中文文件名保留在 URL 中），例如 `/library/paper-archive/题名`、`/library/song-ming-finance/zhihu/题名`。对应静态 raw Markdown 使用**独立前缀** `/library-raw/<与 articles 相同的相对路径>.md`（不能与 `/library/raw` 混用，否则会被 `/library/[...slug]` 动态路由拦截而 404）。生成文件带 UTF-8 BOM；线上由 [`src/app/library-raw/[...path]/route.ts`](src/app/library-raw/[...path]/route.ts) 拦截请求，从 ASSETS 取正文并强制 `Content-Type: text/markdown; charset=utf-8`（Cloudflare 直出静态时 `next.config` 的 headers 往往不生效）。本地无 ASSETS 绑定时回退读磁盘 `public/library-raw/`。

## 维护流程

### 从 references 全量同步（常用）

自 `papers/`、`本人内容/`、`zhihu/` 复制正文（排除 README、`*-AI检索索引.md`、空正文等），并自动补 frontmatter：

```powershell
npm run import:library-from-references
```

覆盖已存在文件时加 `--force`。

### 手工新增或改一篇

1. 将 `.md` 放在上面对应主题目录下，文件名尽量稳定（与线上 URL 最后一段一致）。
2. 补齐或修订文件顶部 YAML（须与**首段文件夹名**一致：`theme` = `paper-archive` 或 `song-ming-finance`）。
3. 运行 `npm run generate:library-index`（仅校验：`npm run generate:library-index:check`）。
4. 提交：`docs/library/articles/`、`src/data/library-generated.ts`、`public/ai/library-index.json`、`public/library-raw/**`、`docs/library/library-AI检索索引.md`。

说明：早期「单段英文 slug + `articles/currency/` 等」种子已废止；当前以主题目录 + 中文文件名为准。

## frontmatter 字段

```yaml
---
id: lib_0123456789abcdef
title: 文章标题（通常与文件名去 .md 一致）
theme: paper-archive
secondaryThemes: []
sourceType: paper
authors: [刘光临]
date: "2009"
summary: 摘要（可手工改）
keywords: [关键词1, 关键词2]
aiUse: 说明 AI 何时优先检索本文。
zhihuUrl: https://www.zhihu.com/people/khg9ng
bilibiliUrl: https://space.bilibili.com/23467654
externalSourceUrl:
public: true
---
```

`sourceType` 取值：`original` | `paper` | `zhihu` | `sample` | `note`。

## 分类 ID（主题）

- `song-ming-finance`：宋进明退论、宋明货币财政、洪武型财政的问题
- `zhu-dreamer`：朱元璋梦男系列（可手工投放；批量导入未使用）
- `paper-archive`：搬运论文合集

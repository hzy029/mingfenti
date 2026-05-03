# 工程与运维交接（当前）

**日期**：2026-05-03（留言板与管理端、顶栏等迭代说明见 §3.3–§3.5、§2）  
**用途**：新会话、新同事、新窗口继续开发时**优先阅读本文**；产品与题库长历史见文末「延伸阅读」中的旧交接文档。

---

## 1. 项目是什么（一页纸）

- 部署目标：**Cloudflare Workers** 上跑 **Next.js**（OpenNext），**D1** 存匿名数据。
- **普通版**：约 111 道题库，每次随机抽 **20** 题（核心 6 + 补充 14），双维度评分，结果页与首页统计。
- **Pro 版**：入口保留为「建设中 / 不可点」，**未实现**题库与页面流程。
- **留言板（知乎式）**：**仅管理员**在 `/admin/board` 发布**主题**（标题 + 可选主题说明）；**用户**只能在主题下发布**回答**（数据表仍为 `board_posts`，语义为回答）、在每条回答下发布**评论**（表 `board_comments`）。回答/评论均可点赞累计热度。首页展示置顶主题 + 最热回答摘要、热门主题轮播。**无登录**。
- 原则：不做逐题答题明细上报；测试完成事件与留言为站点级数据。

---

## 2. 环境与部署（当前真值）

| 项 | 说明 |
| --- | --- |
| 运行时 | Node 与 Next 以仓库 `package.json` 为准；Cloudflare 构建日志曾使用 Node 22.x |
| 绑定 | `wrangler.toml`：`DB` → D1 库名 `mingqing-detector`；`ASSETS` 静态资源 |
| 自定义域 | 曾配置 `mingfen.sbs` 指向 Worker（以 Cloudflare 控制台为准） |

**本地开发**

```powershell
cd E:\java_project\2026\shuan
C:\nvm4w\nodejs\npm.cmd run dev
```

浏览器：`http://localhost:3000`

**留言板管理端（未上云、本机跑通）**

与线上 D1 分离：OpenNext 的 `initOpenNextCloudflareForDev()` 会让 `next dev` 通过 Wrangler 使用**本地** D1（数据在 `.wrangler/state`），须单独建表。

1. 项目根目录创建 **`.env.local`**（已在 `.gitignore`，勿提交），至少一行：  
   `ADMIN_BOARD_SECRET=<任意长随机串>`  
   管理页 `/admin/board` 里「管理密钥」须填**完全相同**的一串（与 [`ADMIN_BOARD_SECRET-配置说明.md`](./ADMIN_BOARD_SECRET-配置说明.md) §4 一致）。
2. 对本地 D1 执行一次迁移（与 `d1:apply:remote` 无关）：  
   `npm run d1:apply:local`（等价于 `wrangler d1 execute mingqing-detector --local --file=./schema.sql`）。
3. 重启 `npm run dev` 后再打开 `http://localhost:3000/admin/board`。

**常用脚本**

```powershell
C:\nvm4w\nodejs\npm.cmd run typecheck
C:\nvm4w\nodejs\npm.cmd run lint
C:\nvm4w\nodejs\npm.cmd run build
```

**D1 迁移与抽查**

```powershell
C:\nvm4w\nodejs\npm.cmd run d1:apply:local
C:\nvm4w\nodejs\npm.cmd run d1:apply:remote
C:\nvm4w\nodejs\npm.cmd run d1:count:remote
```

**Cloudflare 发布**

仓库脚本（与 [`package.json`](../../package.json) 一致）：

```powershell
C:\nvm4w\nodejs\npm.cmd run deploy
```

等价于 `opennextjs-cloudflare build && opennextjs-cloudflare deploy`。亦可手动：`opennextjs-cloudflare build` 后按 Wrangler 文档上传。**部署后**若自定义域与 Workers 子域表现不一致，可对域名清理缓存或核对控制台 Worker 版本。

以下为历史备用写法（若团队仍用手动两步）：

```bash
npx opennextjs-cloudflare build
npx wrangler versions upload
```

---

## 3. 已实现（工程可验收清单）

### 3.1 普通测试：选项乱序

- **目的**：展示时打乱 A/B/C/D **顺序**，避免用户固定点某一格刷分；**计分仍按选项真实 id**（`a`/`b`/`c`/`d`）。
- **实现**：[`src/lib/shuffle-seed.ts`](../../src/lib/shuffle-seed.ts) 按「本场盐值 + 题号」可复现乱序；[`src/app/test/page.tsx`](../../src/app/test/page.tsx) 渲染乱序后的列表，按钮仍提交真实 `option.id`。

### 3.2 匿名测试统计（D1）

- 表：`basic_attempts`（见 [`schema.sql`](../../schema.sql)）。
- 写入：[`src/app/api/basic-attempts/route.ts`](../../src/app/api/basic-attempts/route.ts)；完成耗时**少于 30 秒**的记录为 `too-fast`，**不写库**。
- 读取与聚合：[`src/lib/basic-stats.ts`](../../src/lib/basic-stats.ts)、[`src/app/api/basic-stats/route.ts`](../../src/app/api/basic-stats/route.ts)；首页服务端拉统计。

### 3.3 留言板 + 首页版块 + 顶栏

- **D1 表**（见 [`schema.sql`](../../schema.sql)）：`board_topics`、`board_topic_meta`（主题补充说明）、`board_posts`（**回答**，`topic_id` 外键）、`board_comments`（**评论**，`answer_id` 指向回答）、`board_daily_actions`（每日发帖计数，供匿名限流）、`board_likes`（回答/评论点赞按 IP 哈希去重，与 `heat_score` 联动）、`basic_attempts` 等。
- **公开页面**：`/board` 主题列表含每条主题下**一行最热已发布回答摘要**（无发主题入口）；`/board/[topicId]` 展示主题说明、回答列表、每条回答下的评论区与「写回答」表单。**浏览不校验**测评；**发表回答/评论**须请求体带普通版测评 **`resultId`**，且仅允许 `objective-neutral`、`ming-leaning-moe`、`manchu-loyalist`（见 [`src/lib/board-post-eligibility.ts`](../../src/lib/board-post-eligibility.ts)），否则 **403** `board-post-not-eligible`。同一访客（**UTC 日 + IP 经盐哈希**，见 `CF-Connecting-IP` / `X-Forwarded-For`）**回答 + 评论合计每日最多 20 次**（表 `board_daily_actions`，环境变量 `BOARD_RATE_SALT`、`BOARD_DAILY_POST_LIMIT`），超限 **429** `daily-limit-exceeded`；同 NAT 共享额度。**写入数据库成功即计一次**，与审核结果无关。
- **公开 API**  
  - `GET` [`src/app/api/board/topics/route.ts`](../../src/app/api/board/topics/route.ts) 列表；`POST` 同路径返回 **403**（禁止用户建主题）。  
  - `POST` [`src/app/api/board/topics/[topicId]/posts/route.ts`](../../src/app/api/board/topics/[topicId]/posts/route.ts) 发布回答（鉴权 `resultId` + 日限额 + DeepSeek 审核流程）。  
  - `POST` [`src/app/api/board/posts/[postId]/comments/route.ts`](../../src/app/api/board/posts/[postId]/comments/route.ts) 发布评论（同上）。  
  - `POST` [`src/app/api/board/posts/[postId]/like/route.ts`](../../src/app/api/board/posts/[postId]/like/route.ts)、[`src/app/api/board/comments/[commentId]/like/route.ts`](../../src/app/api/board/comments/[commentId]/like/route.ts) 点赞（同一 IP 哈希对同一回答/评论仅计一次，见 `board_likes`）。
- **首页**：[`src/components/home-message-board.tsx`](../../src/components/home-message-board.tsx) 等；数据 [`src/lib/board-home-data.ts`](../../src/lib/board-home-data.ts)。**首屏两板块**由 [`src/components/home-test-board-carousel.tsx`](../../src/components/home-test-board-carousel.tsx) 以单卡片轮播呈现（默认「留言板」、约 10 秒自动与手动切换「标准鉴定」与「留言板」）。
- **顶栏**：[`src/components/site-header.tsx`](../../src/components/site-header.tsx) 为 **首页 → 普通测试 → 留言板 → 我的B站**；**`lg` 以下**为汉堡菜单展开四项；**不展示** Pro 版入口。

### 3.4 管理端（留言板）

- **页面**：`/admin/board` → [`src/app/admin/board/page.tsx`](../../src/app/admin/board/page.tsx)；**管理主题与回答** → [`src/app/admin/board/topics/page.tsx`](../../src/app/admin/board/topics/page.tsx)。
- **壳布局**：[`src/components/admin-board-shell.tsx`](../../src/components/admin-board-shell.tsx) 左侧固定导航（登录 / 发主题 / 管理主题与回答），右侧为各子页内容。
- **`/admin/board/topics`（主题 + 回答）**  
  - **三栏**：主内容区为 **flex 横向**（`flex-nowrap`）：左 **11rem** 主题列表、中 **15rem** 主题控制、右 `flex-1 min-w-0` 回答区；容器 `overflow-x-auto` 极窄时横向滚动。曾用 `grid-cols-[...minmax(0,1fr)]` 会受 Tailwind 任意类名截断影响，已弃用。  
  - **置顶权值**：支持 **手填整数 +「保存权值」**，以及快捷 **「置顶主题」**（代码内固定大权值，与公开列表排序一致）、**「取消置顶」**（权值 0）。更新成功后输入框与列表会通过 [`AdminBoardProvider`](../../src/components/admin-board-provider.tsx) 同步。  
  - **回答列表**：可点「回答 #…」信息条切换「当前回答」；正文默认限高预览，**右下角固定按钮**展开/收起当前回答全文（编辑时用 Markdown 全屏编辑器）。
- **如何进入**：浏览器直接打开路径 **`/admin/board`**（例如线上 `https://你的域名/admin/board`，本地 `http://localhost:3000/admin/board`）。**顶栏不设入口**，避免把管理地址挂在显眼位置；可与 [`/board` 页脚「站务管理」](../../src/app/board/page.tsx) 一样自行收藏。打开后在页面里填写与 Worker 环境变量 **`ADMIN_BOARD_SECRET`** 完全一致的密钥，点「保存密钥并加载」；也可先点「从 sessionStorage 导入」若本机曾保存过。**生成与部署密钥的逐步说明**：[ADMIN_BOARD_SECRET-配置说明.md](./ADMIN_BOARD_SECRET-配置说明.md)。
- **鉴权**：请求头 `x-admin-board-secret` 必须与环境变量 **`ADMIN_BOARD_SECRET`** 一致（[`src/lib/board-admin-auth.ts`](../../src/lib/board-admin-auth.ts)）。  
  - **未配置** `ADMIN_BOARD_SECRET`：管理 API 返回 **503**，JSON `reason: "admin-not-configured"`，管理页与发布主题表单会提示「服务端未设置…」。  
  - **已配置但密钥填错**：返回 **401**，`reason: "unauthorized"`，提示与服务器密钥不一致（**不会**误报成未配置）。
- **API**（均需请求头；另含 `POST` 创建主题、评论管理）  
  - `GET` / `POST` [`src/app/api/admin/board/topics/route.ts`](../../src/app/api/admin/board/topics/route.ts)（`POST` = 管理员发主题）  
  - `PATCH` [`src/app/api/admin/board/topics/[topicId]/route.ts`](../../src/app/api/admin/board/topics/[topicId]/route.ts)  
  - `GET` / `POST` [`src/app/api/admin/board/topics/[topicId]/posts/route.ts`](../../src/app/api/admin/board/topics/[topicId]/posts/route.ts)（`POST` = 管理员代发回答，**跳过** DeepSeek，直接 `published`）  
  - `PATCH` [`src/app/api/admin/board/posts/[postId]/route.ts`](../../src/app/api/admin/board/posts/[postId]/route.ts)  
  - `GET` [`src/app/api/admin/board/posts/[postId]/comments/route.ts`](../../src/app/api/admin/board/posts/[postId]/comments/route.ts)  
  - `PATCH` [`src/app/api/admin/board/comments/[commentId]/route.ts`](../../src/app/api/admin/board/comments/[commentId]/route.ts)

### 3.5 DeepSeek 留言审核模块（协作必读）

- **代码入口**：[`src/lib/board-review.ts`](../../src/lib/board-review.ts)。环境变量 **`DEEPSEEK_API_KEY`**（必填方可调用云端）、**`DEEPSEEK_MODEL`**（可选，默认 `deepseek-v4-flash`）。配套表结构由 **`ensureBoardReviewSchema`** 与 [`schema.sql`](../../schema.sql) 同步维护。
- **调用链**：用户 **`POST`** 发布回答或评论 → `reviewBoardContent` → 按模型返回的 `verdict` 写入 `board_posts` / `board_comments` 的 `review_status`、`review_provider`（`deepseek` / `fallback`）、`review_reason` 等字段；超时或异常走 **fallback**，多为 **pending** 待人工处理。**管理员代发**（`POST` [`src/app/api/admin/board/topics/[topicId]/posts/route.ts`](../../src/app/api/admin/board/topics/[topicId]/posts/route.ts)）**不调用** `reviewBoardContent`，避免费用与不确定性。
- **协作约定**：改动审核提示词、超时时间、`REVIEW_TIMEOUT_MS`、降级策略前，请 **先 `grep`/搜索仓库引用**；与 Codex 或其他 agent **并行开发时避免同时大改** 同一审核文件；**Schema 变更** 必须同步更新仓库 `schema.sql` 与远程 D1 迁移说明。

### 3.6 明确未实现（避免误解）

- **Pro 版**：题库与完整流程仍**未实现**（与留言板 DeepSeek 审核无关）。

---

## 4. 你要做的（运维 / 配置 / 验收）

### 4.1 常见问题（管理页 / 发主题）

| 现象 | 处理 |
| --- | --- |
| 黄字提示「服务端未设置 ADMIN_BOARD_SECRET」 | Worker 未配置该 Secret，或变量名拼写错误。在 Cloudflare **变量和机密** 中添加后**重新部署**当前 Worker。 |
| 提示密钥不一致（401 / unauthorized） | 浏览器里填的串与 Cloudflare Secret **必须逐字符相同**；不要把生成命令当密钥粘贴。 |
| 本地「加载主题失败」且提示未连接 D1 | `npm run dev` 下通常**没有** D1，属正常；请用**线上域名**打开 `/admin/board`，或本地用带 D1 的 OpenNext 预览。 |
| 「发布主题」数据库写入失败 | 先对远程 D1 执行最新 [`schema.sql`](../../schema.sql)（含 `board_topic_meta`、`board_comments`）。若仅缺 `board_topic_meta`，当前代码仍会尽量创建主题（补充说明可能写不进去，补迁移后可再发带说明的主题）。 |

### 4.2 其余验收

1. **D1**：执行 `npm run d1:apply:remote`，保证表与索引与仓库 `schema.sql` 一致（含 `board_daily_actions`、`board_likes` 等留言板表）。  
2. **密钥**：`ADMIN_BOARD_SECRET` 与 [ADMIN_BOARD_SECRET-配置说明.md](./ADMIN_BOARD_SECRET-配置说明.md)。  
3. **线上**：管理员发主题 → 用户在主题下写回答与评论 → 首页热门与点赞是否正常。  
4. **统计**：完成 ≥30 秒普通测试，确认 `basic_attempts` 与首页分布更新。

---

## 5. 代码地图（继续开发时优先打开）

| 路径 | 职责 |
| --- | --- |
| [`src/app/page.tsx`](../../src/app/page.tsx) | 首页、统计、留言板区块数据注入 |
| [`src/app/test/page.tsx`](../../src/app/test/page.tsx) | 普通测试答题、乱序选项、上报尝试 |
| [`src/app/result/page.tsx`](../../src/app/result/page.tsx) | 结果展示 |
| [`src/app/board/page.tsx`](../../src/app/board/page.tsx) | 留言板主题列表（用户不能在此发主题） |
| [`src/app/board/[topicId]/page.tsx`](../../src/app/board/[topicId]/page.tsx) | 主题详情、回答、评论区、写回答 |
| [`src/lib/basic-scoring.ts`](../../src/lib/basic-scoring.ts) | 普通版计分与结果区间 |
| [`src/lib/basic-stats.ts`](../../src/lib/basic-stats.ts) | 首页五类分布聚合 |
| [`src/lib/board-home-data.ts`](../../src/lib/board-home-data.ts) | 首页留言板置顶与热门数据 |
| [`src/lib/cloudflare-db.ts`](../../src/lib/cloudflare-db.ts) | D1 获取封装 |
| [`src/lib/board-review.ts`](../../src/lib/board-review.ts) | DeepSeek 留言审核与降级 |
| [`src/lib/board-post-eligibility.ts`](../../src/lib/board-post-eligibility.ts) | 发帖允许的 `resultId` 白名单 |
| [`src/lib/board-rate-limit.ts`](../../src/lib/board-rate-limit.ts) | 留言每日次数（IP 哈希 + UTC 日） |
| [`src/lib/board-likes.ts`](../../src/lib/board-likes.ts) | 点赞 IP 去重（`board_likes`） |
| [`src/app/admin/board/topics/page.tsx`](../../src/app/admin/board/topics/page.tsx) | 管理主题与回答（三栏：列表 / 主题控制 / 回答区，置顶权值） |
| [`schema.sql`](../../schema.sql) | 全库表结构（测试记录 + 留言板） |

题库与抽题配置：`src/data/basic-*`、`src/lib/basic-question-selection.ts`；文档版题库索引见 `docs/详细设计/题库.md` 与 `docs/详细设计/题库/` 目录。

---

## 6. 延伸阅读（索引，不替代详细设计）

- [普通版评测标准](../详细设计/basic-evaluation-standard.md)
- [Pro 版评测标准](../详细设计/pro-evaluation-standard.md)
- [资料库说明](../references/README.md)
- [题库主题索引](../references/topic-index.md)
- [Pro 结果设计](../详细设计/pro-result-design.md)
- [需求设计](../架构/sbti-ai-requirements-design.md)

**历史过程与题库演进（长文，可选读）**：[项目交接文档（历史归档）](./handoff.md)

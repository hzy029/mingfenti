# 明清史爱好者检测器：需求设计与项目架构文档

版本：v0.2  
日期：2026-04-30  
参考站点：https://www.sbti.ai/、https://mingfen.fun/  
部署目标：Cloudflare

## 1. 项目概述

本项目是一个面向中文用户的历史圈层趣味测试网站，暂定名称为「XX 检测器」。网站借鉴 SBTI.ai 的轻量测试、结果标签、社交传播结构，同时参考 mingfen.fun 的明清史爱好者测试形态，将主题改造为「明清史爱好者身份检测 / 史观倾向测试 / 历史圈层梗传播工具」。

核心目标不是做严肃学术测评，而是通过有辨识度的问题、结果分层和分享文案制造传播，再在首页弹窗和关键结果页为站主的 B 站、知乎账号引流。

产品定位：

- 类型：历史爱好者趣味测试 / 圈层身份标签 / 社交分享工具
- 目标用户：中文互联网中的明史、清史、明清对比、历史剧、通俗历史内容爱好者
- 核心传播点：测试题有争议、有梗、能表达立场；结果称号适合截图、转发和互相调侃
- 核心转化点：首页弹窗、结果页关注入口、公告页和关于页导流至 B 站与知乎

### 1.1 测验产品线（2026-05 文档真值）

- **普通版**：每次 **20** 题，全部为 **判断题（对 / 错）**，**一维线性**计分，档位标定后映射到与 Pro 相同的 `resultId`（见 [`basic-evaluation-standard.md`](../详细设计/basic-evaluation-standard.md)）。
- **Pro 版**：每次 **20** 题，**四选一**，**双轴**（历史了解程度 × 明朝偏向程度），对应当前工程主线题库与计分实现。
- **两套共用**同一套结果称号与 `resultId`。历史上规划的「四维 Pro」已废止（见 [`pro-evaluation-standard.md`](../详细设计/pro-evaluation-standard.md) 附录）；下文凡出现「四维画像」「四维条形图」等早期表述，均视为历史草稿，**不作为验收依据**。

站主账号：

- B 站：https://space.bilibili.com/23467654
- 知乎：https://www.zhihu.com/people/khg9ng
- 投稿邮箱：p1gpaw@qq.com

首页标语：

> 近代积贫积弱，朱元璋难辞其咎！----- 解雨泽熙

## 2. 命名与品牌

当前名称未定，建议先使用占位名：

- 「XX 检测器」
- 「明清史观检测器」
- 「明粉浓度检测器」
- 「大明精神状态检测器」
- 「明清立场鉴定器」

命名原则：

- 5 到 8 个中文字符优先，便于记忆和传播
- 标题要能直接表达测试主题
- 避免过强攻击性或人身标签，减少传播平台审核风险
- 页面 title 可使用「XX 检测器 - 测测你的明清史观浓度」

## 3. 用户与场景

目标用户：

- 明史、清史、明清对比内容消费者
- B 站、知乎、小红书、贴吧、微博等平台的历史内容受众
- 喜欢 MBTI、人格测试、阵营测试、浓度测试的泛娱乐用户
- 站主账号的潜在关注者

典型场景：

- 用户从社交平台看到测试链接，进入首页后开始测试
- 用户完成 **普通版（判断题）**测试，获得与其他档位一致的称号与分享文案
- 用户需要更细的立场强度区分时，进入 **Pro 版（四选一、双轴）**测试
- 用户截图或复制结果分享到社交平台，引导更多人访问
- 用户在首页弹窗或结果页点击 B 站、知乎账号

## 4. 页面信息架构

```mermaid
flowchart TD
  A["首页 /"] --> B["普通测试 /test 判断题"]
  A --> C["Pro 测试 /pro-test 四选一双轴"]
  A --> D["公告 /announcements"]
  A --> E["关于 /about"]
  A --> F["外链：B 站账号"]
  A --> G["外链：知乎账号"]
  B --> H["普通结果 /result"]
  C --> I["Pro 结果 /pro-result"]
  H --> C
  H --> F
  H --> G
  I --> F
  I --> G
  A --> J["404 /not-found"]
```

## 5. 页面需求

### 5.1 首页

目标：快速说明网站是什么，推动用户开始测试，并向站主账号导流。

功能需求：

- 展示网站名称、短介绍、开始 **普通版（判断）**与 **Pro（四选一）**入口（路径以实现为准）
- 首页展示一行标语：「近代积贫积弱，朱元璋难辞其咎！----- 解雨泽熙」
- 展示「已有 N 人完成测试」和各结果类型数量
- 首页弹窗展示 B 站和知乎账号，可关闭
- 弹窗关闭状态保存在浏览器本地，避免每次刷新都打扰用户
- 展示测试特色，例如「20 题完成」「无需登录」「结果可分享」「Pro 双轴进阶」
- 展示公告入口
- 页脚展示关于页面、免责声明、站主账号链接

首页统计：

- 展示总测试人数
- 展示普通版各档位人数
- 可选展示 Pro 版各档位分布（与数据统计接入一致）
- 统计数据不绑定用户身份，不保存答题明细

### 5.2 普通测试页（判断题）

目标：最低门槛完成 **20** 道 **对 / 错** 题，获得与其他产品线一致的称号（同一套 `resultId`）。

功能需求：

- 默认 **20** 题，题型为 **判断题**（不含四选一梯度）
- 每题单一陈述句；题目初稿由项目生成，站主后续校对
- 主题仍围绕「洪武型财政」「宋进明退」等史观争议点
- 展示当前进度；支持上一题、下一题；未选择时禁止下一题或明确提示
- 完成后本地计算 **一维**得分 \(S\)，映射到档位（算法见 [`basic-evaluation-standard.md`](../详细设计/basic-evaluation-standard.md) §1）；提交匿名统计事件
- 支持重新测试；支持移动端单手操作

普通版算法（摘要）：

- 每题配置标准答案与权重；累计得分 \(S\) 后按标定阈值落入 `basic-results` 各档

### 5.3 Pro 测试页（四选一 · 双轴）

目标：同样 **20** 题，用 **四选一** 保留立场强度，双轴计分与当前工程一致。

功能需求：

- 默认 **20** 题，每题 **4** 个选项；核心 / 补充权值与抽题规则见 [`basic-evaluation-standard.md`](../详细设计/basic-evaluation-standard.md) §2
- 每个选项映射到 **历史了解程度** 与 **明朝偏向程度**（非四维）
- 完成后展示双轴相关结果（展示形式以实现为准）
- 支持从普通结果页进入 Pro 测试
- 支持复制结果文案

Pro 版算法（摘要）：

- 计分、矩形匹配见 [`src/lib/basic-scoring.ts`](../../src/lib/basic-scoring.ts) 与 [`basic-results.ts`](../../src/data/basic-results.ts)

### 5.4 普通结果页

目标：给用户一个强记忆点结果，并推动分享与关注。

功能需求：

- 展示结果称号、（可选）一维分数或正确题数、短评
- 展示适合分享的短文案
- 提供复制结果按钮
- 提供重新测试按钮
- 提供进入 **Pro（四选一）**测试按钮
- 展示 B 站、知乎关注入口
- MVP 不生成结果海报，先提供复制分享文案
- 分享链接不包含完整答题记录，只包含结果类型或短 token

### 5.5 Pro 结果页

目标：展示双轴测验对应档位（与 5.4 共用同一套称号时的视觉与文案可复用）。

功能需求：

- 展示 **双轴**分数或区间（以实现为准）
- 展示综合称号与解释（与 [`basic-results.ts`](../../src/data/basic-results.ts) 一致）
- 展示适合社交传播的结果文案
- 提供复制、重新测试、返回首页、关注账号入口

### 5.6 公告页面

目标：承载站点更新、站主动态、内容说明和导流。

功能需求：

- 展示公告列表
- 公告包含标题、摘要、发布时间、标签、正文
- 支持置顶公告
- 可选支持隐藏公告或需要访问 key 的特殊公告
- 公告内容初期可用 Markdown 文件维护

默认公告内容（历史草案；若与 §1.1 冲突，以 **双轴 Pro + 判断普通版** 为准）：

- 标题：最新公告
- 重点提示：专业鉴定 / Pro 双轴模式（具体文案站主更新）
- 功能说明：
  - **普通版**：20 道判断题，一维计分
  - **Pro 版**：20 道四选一，双轴计分，与正式题库一致
  - 可选增强截图分享的结果展示
- 导流：
  - 关注我的 B 站：https://space.bilibili.com/23467654
  - 关注解雨泽熙的知乎账号：https://www.zhihu.com/people/khg9ng
- 投稿题目：p1gpaw@qq.com
- 免责声明：本项目旨在以讽刺方式提醒人们避免历史认知偏差。保持理性，独立思考！

### 5.7 关于页面

目标：说明网站性质、站主身份和免责声明。

内容建议：

- 网站是娱乐测试，不代表严肃学术结论
- 测试结果不构成任何身份判断
- 说明不收集个人身份信息
- 展示 B 站、知乎账号
- 展示投稿邮箱：p1gpaw@qq.com
- 说明反馈渠道

### 5.8 404 页面

目标：让错误访问也能回到测试路径。

功能需求：

- 展示简短提示
- 提供返回首页、开始测试入口
- 风格与主站一致

## 6. 数据模型

### 6.1 站点配置

```ts
type SiteConfig = {
  name: string;
  slogan: string;
  homepageQuote: string;
  description: string;
  bilibiliUrl: string;
  zhihuUrl: string;
  submissionEmail: string;
  announcement?: string;
};
```

当前账号配置：

```ts
const siteConfig: SiteConfig = {
  name: "XX 检测器",
  slogan: "测测你的明清史观浓度",
  homepageQuote: "近代积贫积弱，朱元璋难辞其咎！----- 解雨泽熙",
  description: "一个面向明清史爱好者的趣味测试网站。",
  bilibiliUrl: "https://space.bilibili.com/23467654",
  zhihuUrl: "https://www.zhihu.com/people/khg9ng",
  submissionEmail: "p1gpaw@qq.com"
};
```

### 6.2 普通测试题

```ts
type BasicQuestion = {
  id: string;
  order: number;
  title: string;
  category: string;
  options: BasicOption[];
};

type BasicOption = {
  id: string;
  label: string;
  score: number;
};
```

### 6.3 普通结果

```ts
type BasicResultTier = {
  id: string;
  minScore: number;
  maxScore: number;
  title: string;
  summary: string;
  shareText: string;
};
```

暂定结果档位：

```ts
const basicResultTiers: BasicResultTier[] = [
  {
    id: "normal",
    minScore: 0,
    maxScore: 39,
    title: "正常人",
    summary: "对明清史观争议保持距离，更接近日常历史爱好者。",
    shareText: "我测出来是正常人，暂时还能从明清史观大战里全身而退。"
  },
  {
    id: "old-ming-fan",
    minScore: 40,
    maxScore: 69,
    title: "旧明粉",
    summary: "对明代叙事有明显好感，但仍会在财政、制度和人物评价上保留余地。",
    shareText: "我测出来是旧明粉，心里有大明，但还没有完全失控。"
  },
  {
    id: "zhu-fan",
    minScore: 70,
    maxScore: 100,
    title: "朱粉",
    summary: "高度认同明代制度辩护、洪武型财政解释和宋进明未退的叙事。",
    shareText: "我测出来是朱粉，洪武型财政与宋进明未退已经刻进 DNA。"
  }
];
```

### 6.4 Pro 测试题（双轴 · 与代码一致）

```ts
type BasicQuestion = {
  id: string;
  order: number;
  category: string;
  bank: "core" | "supplemental";
  weight: 1 | 2;
  title: string;
  options: BasicOption[];
};

type BasicOption = {
  id: string;
  label: string;
  score: {
    historyKnowledge: number;
    mingPreference: number;
  };
};
```

（历史上曾草案四维 `score`，已废止；实现见 `src/data/types.ts`。）

### 6.5 公告

```ts
type Announcement = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  pinned: boolean;
  publishedAt: string;
  content: string;
};
```

默认公告配置：

```ts
const defaultAnnouncement: Announcement = {
  id: "launch-pro-mode",
  slug: "launch-pro-mode",
  title: "最新公告",
  summary: "全新上线：PRO 专业鉴定模式",
  tags: ["公告", "Pro", "投稿"],
  pinned: true,
  publishedAt: "2026-04-30",
  content: "本项目旨在以讽刺方式提醒人们避免历史认知偏差。保持理性，独立思考！"
};
```

### 6.6 匿名统计

```ts
type SiteStats = {
  totalAttempts: number;
  basicTierCounts: Record<string, number>;
  proResultCounts?: Record<string, number>;
  updatedAt: string;
};
```

## 7. 技术架构

### 7.1 推荐方案

推荐使用：

- 前端框架：Next.js
- UI：Tailwind CSS
- 部署：Cloudflare Workers + OpenNext，或静态能力足够时使用 Cloudflare Pages
- 统计存储：Cloudflare KV 或 D1
- 题库与结果配置：本地 JSON / TypeScript 配置文件
- 公告内容：Markdown 文件，后续可迁移到 D1 或 CMS

选择理由：

- 网站主体适合静态生成，SEO 和访问速度好
- 统计人数和结果分布需要轻量动态接口
- 不需要账号系统和完整数据库
- Cloudflare 全球边缘部署适合传播型活动页

Cloudflare 官方文档提示：Next.js 静态导出可以部署到 Pages；如果需要更完整的 Next.js 动态能力，Cloudflare 推荐使用 Workers 部署 Next.js。

### 7.2 架构图

```mermaid
flowchart LR
  U["用户浏览器"] --> CF["Cloudflare"]
  CF --> APP["Next.js 应用"]
  APP --> STATIC["静态页面与资源"]
  APP --> API["API Routes / Workers"]
  API --> KV["Cloudflare KV: 统计计数"]
  APP --> DATA["本地 JSON/TS 配置: 题库、结果、站点配置"]
```

### 7.3 动态接口

建议 API：

- `GET /api/stats`：读取总测试人数和各结果数量
- `POST /api/attempts`：测试完成后递增统计
- `GET /api/announcements`：读取公告列表，可选
- `GET /api/questions/basic`：读取普通版（判断）题库，可选；也可以直接打包到前端
- `GET /api/questions/pro`：读取 Pro（四选一）题库，可选（可与 basic 同源数据划分 bank）

隐私原则：

- 不保存用户 IP
- 不保存完整答题记录
- 不要求登录
- 只保存聚合统计

## 8. 项目目录建议

```txt
src/
  app/
    page.tsx
    test/page.tsx
    pro-test/page.tsx
    result/page.tsx
    pro-result/page.tsx
    announcements/page.tsx
    about/page.tsx
    not-found.tsx
    api/
      stats/route.ts
      attempts/route.ts
  components/
    site-header.tsx
    site-footer.tsx
    follow-modal.tsx
    question-card.tsx
    result-card.tsx
    share-actions.tsx
    stats-strip.tsx
  data/
    site-config.ts
    basic-questions.ts
    basic-results.ts
    pro-questions.ts
    announcements.ts
  lib/
    scoring.ts
    stats.ts
    share.ts
    storage.ts
  styles/
    globals.css
```

## 9. 视觉与交互要求

整体风格：

- 借鉴 mingfen.fun 的直接、轻量、测试感强的结构
- 借鉴 SBTI.ai 的卡片式、结果标签化、适合分享的表达
- 视觉上更偏历史感，但避免厚重博物馆风
- 颜色可使用朱红、墨黑、米白、金色作为点缀，但不要做成单一复古色块

交互要求：

- 首页首屏必须能看到测试入口
- B 站和知乎导流弹窗可关闭
- 测试选项点击后有明确选中态
- 移动端按钮足够大
- 结果页截图时标题、分数、称号、关注入口不能重叠
- 分享文案一键复制

## 10. SEO 与传播

核心关键词：

- 明粉检测器
- 明清史观测试
- 明清历史爱好者测试
- 明史爱好者测试
- 清史评价测试
- 历史立场测试

SEO 要求：

- 首页设置唯一 title 和 meta description
- 公告页可被搜索引擎抓取
- 结果页如使用 query 参数，不建议索引所有组合
- 配置 Open Graph 信息，保证社交平台分享时标题和摘要明确
- 生成 `sitemap.xml` 和 `robots.txt`

传播设计：

- 每个结果档位配独立称号
- 每个结果配一段短文案，适合复制到 B 站评论区、知乎回答、朋友圈
- 结果页提供「我测出了 XXX，你也来试试」格式的默认文案
- Pro 版结果页可突出双轴分数或条形对比，增强截图价值

## 11. 非功能需求

性能：

- 首页首屏加载目标小于 2.5 秒
- 题库和结果配置尽量静态打包
- API 只承担统计递增和读取，不参与复杂计算

稳定性：

- 测试进度保存在浏览器本地状态，刷新后尽量恢复
- 统计接口失败时不影响用户查看结果
- 公告接口失败时展示空状态或静态兜底

编码：

- 所有源码、JSON、Markdown、API 响应统一 UTF-8
- API 响应明确设置 `Content-Type: application/json; charset=utf-8`
- 避免中文内容在 Windows PowerShell、构建环境或接口中出现乱码

合规：

- 明确声明娱乐测试性质
- 不进行个人身份判断
- 不收集可识别个人身份的信息
- 如果接入统计工具，需要在关于页或隐私说明中写明

## 12. MVP 范围

第一版建议只做：

- 首页
- 首页导流弹窗
- 普通测试页
- 普通结果页
- Pro 测试页
- Pro 结果页
- 公告页
- 关于页
- 404 页面
- 匿名统计接口
- Cloudflare 部署

暂不做：

- 用户登录
- 答题历史
- 后台管理
- 数据库保存答题详情
- 结果海报生成
- 复杂 CMS

## 13. 后续版本

V1.1：

- 结果海报生成
- 公告详情页
- 更多结果称号
- 分享链接短 token

V1.2：

- Cloudflare D1 保存公告和统计
- 简单后台管理题库和公告
- A/B 测试不同首页文案
- 分平台追踪 B 站、知乎点击来源

V1.3：

- 多主题检测器复用同一套架构
- 支持「宋明史观检测器」「历史剧鉴赏检测器」等衍生站点
- 题库版本管理

## 14. 仍需确认的信息

为了进入开发，还需要最终确认：

- 网站正式名称
- 域名
- 普通版与 Pro 版共用档位的分数 / 阈值（见 `basic-evaluation-standard.md`、`basic-results.ts`）
- ~~Pro 版四个维度的最终命名和权重~~（四维产品线已废止）
- 题目初稿见 `docs/mingqing-question-draft.md`，后续由站主校对
- 是否需要接入 Cloudflare Web Analytics


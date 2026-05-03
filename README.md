# 明粉检测器

面向中文明清史爱好者的趣味测试网站。项目使用 Next.js、React、TypeScript 和 Tailwind CSS，目标部署到 Cloudflare。

## 当前状态

- **产品文档（真值）**：**普通版** = 20 道**判断题**、一维计分；**Pro 版** = 20 道**四选一**、双轴计分；两套共用同一套 `resultId`（见 `docs/详细设计/basic-evaluation-standard.md`）。原「四维 Pro」已废止（见 `docs/详细设计/pro-evaluation-standard.md` 附录）。
- **工程落地进度**：MVP 当前实现为双轴四选一（与文档中的 Pro 一致）；判断题普通版流程待开发。
- Pro（双轴）题库当前约 111 题文档体量，每次随机抽 20 题：核心题 6 道，补充题 14 道
- 项目已接入 Cloudflare Workers + OpenNext + D1
- D1 表 `basic_attempts` 已创建，用于记录匿名完成测试事件和首页结果分布；留言板表 `board_topics` / `board_posts` 见 `schema.sql`，需对远程库执行迁移后启用
- `mingfen.sbs` 已绑定到 Worker 自定义域；历史 Pages/DNS 源站 522 问题已处理
- `满遗` 保留为 `客观中立` 的 10% 随机彩蛋，并在统计中计入“中立正常”

## 本地开发

```powershell
cd E:\java_project\2026\shuan
C:\nvm4w\nodejs\npm.cmd run dev
```

启动后访问：

```txt
http://localhost:3000
```

## Cloudflare 部署与统计

```powershell
cd E:\java_project\2026\shuan
C:\nvm4w\nodejs\npm.cmd install
C:\nvm4w\nodejs\npm.cmd run d1:apply:remote
C:\nvm4w\nodejs\npm.cmd run d1:count:remote
```

Cloudflare Workers / Pages **构建**（CMD 需指向 **作用域包**，否则会报 `could not determine executable to run`）：

```bash
npm ci
npm run cf:build
```

等价写法：`npm ci && npx @opennextjs/cloudflare build`（**不要**写 `npx opennextjs-cloudflare`，npm 上没有该包名）。

控制台一键部署命令示例：`npm ci && npm run deploy`。

上传版本也可在项目目录安装依赖后使用 Wrangler，详见 `[docs/实现/handoff-工程当前.md](docs/实现/handoff-工程当前.md)` 与 Cloudflare 文档。

当前 D1 绑定在 `wrangler.toml` 中为：

```toml
binding = "DB"
database_name = "mingqing-detector"
```

首页统计来源：

- `POST /api/basic-attempts`：测试完成后写入匿名记录
- `GET /api/basic-stats`：读取总测试次数和五类结果分布
- 少于 30 秒完成的测试不会记录，避免异常快速提交污染统计

## 必读文档

新窗口继续任务时，先读：

- **[工程与运维交接（当前）](docs/实现/handoff-工程当前.md)**（已实现能力、站主待办、代码入口）
- [项目交接文档（历史与题库过程，可选）](docs/实现/handoff.md)
- [普通版评测标准](docs/详细设计/basic-evaluation-standard.md)
- [Pro 版评测标准](docs/详细设计/pro-evaluation-standard.md)
- [资料库说明](docs/references/README.md)
- [题库主题索引](docs/references/topic-index.md)
- [Pro 结果设计](docs/详细设计/pro-result-design.md)
- [需求设计文档](docs/架构/sbti-ai-requirements-design.md)

辅助文档：

- 流程测试用题（v0.1）：`[src/data/basic-questions.ts](src/data/basic-questions.ts)`（导出的 `question-bank-v0.1.md` 未入库）
- [公告文案草案](docs/实现/announcement-draft.md)
- [资料总目录](docs/references/bibliography.md)

## 目录

```txt
src/
  app/              Next.js App Router 页面
  data/             站点配置、题库、结果配置
  components/       复用 UI 组件
  lib/              评分、分享、本地存储等逻辑

docs/
  README.md        文档索引
  架构/
  详细设计/
  实现/
  需求设计/        仅 README，说明已迁移路径
  references/
    papers/
    本人内容/
    zhihu/
    samples/
      正常人/
      已经切割的旧明粉/
      旧明粉/
      新明粉/
      明粉保皇派朱元璋梦男/
      教条主义/
      西方中心主义者/
      史同女性/
  mingqing-question-draft.md
```

## 下一步

产品侧：

- 补充 `docs/references/samples/已经切割的旧明粉/`、`旧明粉/`、`新明粉/` 等样本
- 补充 `docs/references/samples/教条主义/` 中的教材/科班式话术样本
- 补充 `docs/references/samples/西方中心主义者/` 中的西方中心主义典型言论
- 完善 `[basic-evaluation-standard.md](docs/详细设计/basic-evaluation-standard.md)`（普通判断 + Pro 双轴）；判断题题库落地后可再迭代阈值标定
- 再从标准和样本反推正式题库

工程侧：

- 若尚未执行：对远程 D1 跑 `npm run d1:apply:remote`，包含留言板表；配置 `ADMIN_BOARD_SECRET` 后使用 `/admin/board` 管理留言
- 线上完成一次超过 30 秒的测试，确认 `basic_attempts` 从 0 增加到 1
- 确认首页“累计测试次数”和“五类结果分布”能从 D1 更新
- 后续：P1 DeepSeek 发帖审核（未实现）；普通版（全判断题）若尚未接入，补页面与题库数据


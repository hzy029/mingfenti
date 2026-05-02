# XX 检测器

面向中文明清史爱好者的趣味测试网站。项目使用 Next.js、React、TypeScript 和 Tailwind CSS，目标部署到 Cloudflare。

## 当前状态

- Next.js 项目骨架已建立
- 依赖已由用户本机安装成功
- 首页可在 `http://localhost:3000` 打开
- 普通版测试数据已写入代码，但当前题库仅用于流程测试
- 正式题库需要等评测标准和样本库完善后再生成

## 本地开发

```powershell
cd E:\java_project\2026\shuan
C:\nvm4w\nodejs\npm.cmd run dev
```

启动后访问：

```txt
http://localhost:3000
```

## 必读文档

新窗口继续任务时，先读：

- [项目交接文档](docs/实现/handoff.md)
- [普通版评测标准](docs/详细设计/basic-evaluation-standard.md)
- [Pro 版评测标准](docs/详细设计/pro-evaluation-standard.md)
- [资料库说明](docs/references/README.md)
- [题库主题索引](docs/references/topic-index.md)
- [Pro 结果设计](docs/详细设计/pro-result-design.md)
- [需求设计文档](docs/架构/sbti-ai-requirements-design.md)

辅助文档：

- 流程测试用题（v0.1）：[`src/data/basic-questions.ts`](src/data/basic-questions.ts)（导出的 `question-bank-v0.1.md` 未入库）
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
- 优先完善普通版评测标准；Pro 四维暂不修规则，只登记后续素材
- 再从标准和样本反推正式题库

工程侧：

- 先用测试题库跑通普通版流程
- 创建 `src/lib/scoring.ts`
- 创建 `/test` 和 `/result`
- 之后再做 Pro 版流程

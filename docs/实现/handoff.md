# 项目交接文档

> **主交接入口已迁移**  
> 工程现状、已实现能力、站主待办与代码入口，请以 **[工程与运维交接（当前）](./handoff-工程当前.md)** 为准（建议新会话优先阅读，约 10 分钟内可读完）。  
> 本文档保留**历史过程、题库演进与旧决策记录**，可作归档查阅；其中部分小节可能与当前代码不一致，以仓库实际实现与 `handoff-工程当前.md` 为准。

---

日期：2026-05-01  
用途：**历史归档**；当前工程交接请读 [handoff-工程当前.md](./handoff-工程当前.md)
## 1. 项目目标

建设一个部署在 Cloudflare 的中文趣味测试网站，暂定名「XX 检测器」。主题是明清史观检测，借鉴 `sbti.ai` 的测试/结果传播结构，参考 `mingfen.fun` 的公告、统计和测试流程。

核心目标：

- 普通版快速鉴别「理性历史观 / 完全不了解历史 / 轻度偏明萌萌人 / 已经切割的旧明粉 / 旧明粉 / 新明粉 / 朱元璋梦男」，其中「满遗」只是理性历史观的彩蛋显示名
- Pro 版展示四维史观成分
- 通过首页、公告和结果页引流到站主 B 站和知乎
- 不做登录，不保存个人答题记录
- MVP 不做结果海报

## 2. 已确认信息

站主账号：

- B 站：https://space.bilibili.com/23467654
- 知乎：https://www.zhihu.com/people/khg9ng
- 投稿邮箱：p1gpaw@qq.com

首页标语：

> 近代积贫积弱，朱元璋难辞其咎！----- 解雨泽熙

公告免责声明：

> 本项目旨在以讽刺方式提醒人们避免历史认知偏差。保持理性，独立思考！

普通版结果：

- 理性历史观
- 完全不了解历史
- 对历史了解不多，但轻度偏好明朝的萌萌人
- 已经切割的旧明粉
- 旧明粉
- 新明粉
- 朱元璋梦男

普通版结果需要修改成：
- 客观中立
- 萌萌人
- 旧明粉
- 新明粉
- 朱元璋梦男

Pro 四维：

- 西方中心主义
- 教科书教条主义
- 封建主义
- 科学社会主义

Pro 结果：

- 萌萌人
- 西方中心论者
- 教科书主义者
- 朱家太监
- 旧明粉
- 封建遗老
- 正常人

## 3. 当前重要决策

当前 [`src/data/basic-questions.ts`](../../src/data/basic-questions.ts) 中的题目仅为流程测试用题库；原 `question-bank-v0.1.md` 未纳入仓库。正式题库应先从资料库、评测标准和典型言论样本中提取核心特征，再重新生成。

当前优先级：

1. 完善普通版评测标准
2. 完善 Pro 版评测标准
3. 收集典型言论样本
4. 从标准与样本反推正式题库
5. 再把正式题库写入代码

## 4. 必读文档

新窗口建议阅读顺序：

1. `docs/实现/handoff-工程当前.md`（工程与运维主交接）
2. `docs/详细设计/basic-evaluation-standard.md`
3. `docs/详细设计/pro-evaluation-standard.md`
4. `docs/references/README.md`
5. `docs/references/topic-index.md`
6. `docs/详细设计/pro-result-design.md`
7. `docs/架构/sbti-ai-requirements-design.md`

本文档（`handoff.md`）为历史过程与题库演进归档，可选读。

辅助文档：

- [`src/data/basic-questions.ts`](../../src/data/basic-questions.ts)：流程测试用题库（`question-bank-v0.1.md` / `.docx` 未入库）
- `docs/实现/announcement-draft.md`：公告文案
- `docs/references/bibliography.md`：资料总目录

## 5. 资料库结构

```txt
docs/references/
  papers/                  论文、学术资料
  本人内容/                站主个人内容、原创文章、观点稿、读书笔记
  zhihu/                   搬运或整理的其他人知乎回答
  samples/
    正常人/                理性历史观临时参考样本
    已经切割的旧明粉/      从明粉身份退出或反思的样本
    旧明粉/                仍偏明但未系统护航洪武祖制的样本
    新明粉/                更系统维护明代制度的样本
    明粉保皇派朱元璋梦男/  封建保皇派/明粉/朱元璋梦男典型言论
    教条主义/              后续 Pro 教科书教条主义素材
    西方中心主义者/        西方中心主义典型言论
    史同女性/              历史同人女性向、CP 解读、饭圈化史观等言论
  README.md
  bibliography.md
  topic-index.md
```

注意：

- `本人内容/` 放用户自己的内容
- `zhihu/` 放搬运或整理的他人知乎回答
- `samples/教条主义/` 本轮只登记为后续 Pro 素材来源，暂不修订 Pro 四维
- `samples/史同女性/` 放历史同人女性向、CP 解读、梦向表达、饭圈化史观等话术

## 6. 当前开发状态

项目已初始化为 Next.js + TypeScript + Tailwind。

用户本机已经成功安装依赖，并能打开：

```txt
http://localhost:3000
```

当前已存在：

- `package.json`
- `package-lock.json`
- `node_modules/`
- `.next/`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/globals.css`
- `src/data/site-config.ts`
- `src/data/types.ts`
- `src/data/basic-questions.ts`
- `src/data/basic-results.ts`

首页当前能渲染，包含：

- 标语
- 普通测试入口
- Pro 测试入口
- B 站链接
- 知乎链接
- 投稿邮箱
- 公告卡片

## 7. 当前代码状态

已经落地的代码数据：

- `src/data/types.ts`
- `src/data/basic-core-questions.ts`
- `src/data/basic-supplemental-questions.ts`
- `src/data/basic-questions.ts`
- `src/data/basic-results.ts`
- `src/data/basic-test-config.ts`
- `src/lib/basic-question-selection.ts`
- `src/lib/basic-scoring.ts`

但注意：

- 普通版题库已拆为核心题库和其他题库
- 核心题库 20 题，权值 2；其他题库 80 题，权值 1
- 每次答题固定随机抽核心题 4 题、其他题 16 题
- 普通版采用双维度评分：历史了解程度、明朝偏向程度
- 每个维度满分 72 分
- 普通版结果已更新为 7 个基础结果；「满遗」不是独立类别，只是「理性历史观」的 10% 彩蛋显示名
- 当前普通版题库用于流程开发和人工校对，仍不是最终题库
- Pro 数据文件尚未完成
- `src/lib/scoring.ts` 尚未完成
- `/test`、`/result`、`/pro-test`、`/pro-result` 页面尚未完成

## 8. 下一步建议

如果继续产品设计：

1. 往 `docs/references/samples/feudal-royalist/` 放明粉/朱元璋梦男典型言论
2. 往 `docs/references/samples/western-centrism/` 放西方中心主义典型言论
3. 继续完善 `docs/详细设计/basic-evaluation-standard.md`
4. 继续完善 `docs/详细设计/pro-evaluation-standard.md`
5. 根据标准重新生成正式题库

如果继续工程开发：

1. 先保留当前测试题库用于流程验证
2. 继续完善 `src/lib/basic-scoring.ts`
3. 创建 `/test` 和 `/result`
4. 普通版跑通后，再做 Pro 版数据和页面

推荐下一步：

优先继续完善评测标准和样本库，不急着写正式题库。工程侧可以先用当前测试题库做页面流程。

## 9. 本地命令

```powershell
cd E:\java_project\2026\shuan
C:\nvm4w\nodejs\npm.cmd run dev
```

浏览器访问：

```txt
http://localhost:3000
```

## 10. 注意事项

- 所有中文文件保持 UTF-8
- 不要把论文或知乎原文大段搬进前端公开页面
- 题库可以讽刺，但关于页要说明娱乐性质和理性提示
- Pro 结果中的「朱家太监」是用户指定结果名，只作为娱乐测试称号使用
- 当前项目没有 git 仓库，`git diff` 不可用

## 11. 2026-05-01 题库整理进度

本轮已新增三份题库设计文档：

- `docs/详细设计/question-bank-material-map.md`：题库材料总索引，按财政制度、军事制度、行政制度、横向史观整理材料卡片。
- `docs/详细设计/question-bank-blueprint.md`：100 道题题位蓝图，固定 core/supplemental、主分类、子主题、测试意图和材料卡片。
- `docs/详细设计/题库.md`：文档版正式题库草案，已生成 100 道题干和 A/B/C/D 四级选项。

当前人工整理状态：

- 用户正在继续人工完善 `docs/详细设计/题库.md` 的 100 道题。
- 截至本记录，用户已改完约前 20 道题。
- 后续继续任务时，应先读取 `docs/详细设计/题库.md`，对比用户已改内容，不要用旧草案覆盖人工修改。
- 下一步推荐：等用户改完整 100 道后，再由 Codex 做一致性校对、评分方向检查、分类配比检查，最后再考虑写入 `src/data/basic-core-questions.ts` 和 `src/data/basic-supplemental-questions.ts`。

## 12. 2026-05-01 扩展题库 40 题修订计划 v2

本计划覆盖旧版“扩展题库 40 题修订计划”。修订原因：`docs/references/samples/samples-AI检索索引.md` 已完成土木堡材料更新，土木堡不再只是“本地已有材料”，而是可直接按四组话术簇命题。

### 当前状态

- `docs/详细设计/题库.md` 当前为 100 题草案：C001-C020、F001-F030、M001-M018、A001-A020、H001-H012。
- 用户已人工改动前段题目，尤其 C001-F013 不得用旧草案覆盖。
- `F014 银进钱出` 需要删除整题，后续编号不重排。
- 新增题统一追加为 E001-E040，放在文档末尾校对重点之前。
- 完成后题量应为 139：原 100 - F014 + E001-E040。

### 材料入口

- 汉服：以 `samples-AI检索索引.md` 中 `新明粉/宽袍大袖*` 7 文件系列为主，注意无 `...3.md`。
- 土木堡：以已完成索引为主，分四簇使用：正常人算术/地理反阴谋、切割旧明粉实录战史复盘、新明粉第一责任人罗网体、梦男/新明粉“土木堡在德国”欧洲梗与超常距离推演。忽略空文件 `已经切割的旧明粉/明朝“土木堡之变”的第一责任人，应该是谁1.md`。
- 江南奴变：以正常人、新明粉、切割旧明粉、朱元璋梦男四组对照为主，避免把奴仆/佃仆/投靠制简单等同于现代奴隶制。
- 疆域、弃地、左宗棠：本地材料较少，题干不写未经核实的具体数字；优先做史观校准题，必要时再补官方/学术入口。

### 题目分配

- E001-E008 汉服系列：现实文化需求、发明的传统、贵族 cosplay、劳动场景、服饰复兴与制度史混用、剃发易服话术、普通爱好者与皇汉/明粉话术区分。
- E009-E020 土木堡系列：土木堡在德国梗、阴谋论、王振背锅、朱祁镇责任、文官集团阴谋、兵力夸大、水源与扎营、继承人安排、朱棣弃大宁卫、卫所和子粒银。
- E021-E027 明朝疆域与弃地系列：天子守国门、弃大宁卫、安南放弃、辽东/西南经营、法理疆域 vs 实控治理、弃地是否能用不征之国合理化。
- E028-E034 清代疆域与左宗棠系列：清代疆域贡献、新疆、西藏、蒙古、台湾、舆图/驿站治理、左宗棠收复新疆。
- E035-E040 江南奴变系列：奴仆/佃仆/投靠与现代奴隶制区分、阶级叙事 vs 民族叙事、契约奴辩护、南明/顺治纪年甩锅、郑成功以奴弑主法理、综合校准。

### 校验要求

- `F014` 删除后无残留标题。
- 新增 40 题全部包含题目和 A/B/C/D。
- `C001-F013` 未被覆盖。
- 敏感主题保留讽刺，但不把普通汉服爱好者、普通清代研究或普通服饰兴趣直接打成靶子。

## 13. 2026-05-01 扩展题库 40 题修订计划 v3

本节覆盖第 12 节 v2 中“疆域、弃地、左宗棠材料较少”的判断。`docs/references/samples/samples-AI检索索引.md` 已完成明朝弃地与左宗棠收复新疆索引，后续命题不默认依赖外网补充。

### 材料入口修订

- 明朝弃地：使用 `正常人/弃地`、`新明粉/如何评价明朝弃地`、`新明粉/弃地1` 到 `弃地6`；其中 `弃地5` 为空，不作为论据。
- 左宗棠收复新疆：使用 `正常人/如何评价左宗棠*` 3 篇与 `新明粉/左宗棠收复新疆` 对读。
- 土木堡仍按 v2 四簇材料执行：正常人反阴谋、切割旧明粉战史复盘、新明粉责任罗网、梦男/新明粉欧洲梗。

### 题目分配修订

- E021-E027 明朝弃地系列：铁岭卫、中朝边界、山后卫所、大宁/开平内迁、交趾/安南、奴儿干/东北实控、吴三桂“裂地以酬”话术。
- E028-E034 清代疆域与左宗棠系列：清代疆域贡献、新疆实控、海防塞防、伊犁改约、左宗棠功业、给左宗棠“抬明籍”话术、清疆功劳与再征服反诘。

### 执行状态

- 已按 v3 修改 `docs/详细设计/题库.md`：删除 `F014 银进钱出`，追加 E001-E040，校对重点顺延为第 5 节。

## 14. 2026-05-01 题库 C 选项与新 F014 状态

最新题库状态：

- `docs/详细设计/题库.md` 当前为 140 题。
- 旧 `F014 银进钱出` 已删除，不恢复。
- 新 `F014 明朝能否自发工业化` 已插入 `F013` 与 `F015` 之间。
- 新 F014 使用用户指定题干和 A/B/C/D；这是当前 A/B 机械口径之外的例外。
- 新 F014 的 D 选项依据 `docs/references/本人内容/地息率过高导致明朝不可能自发产生工业革命明朝不可能自发工业化，萌芽一辈子都是萌芽，没有任何萌发的可能.md`。
- A/B 选项此前已统一为“拐清朝 / 否定淡化”口径，且题库正文已删除 `强明粉话术：`、`缓和明粉话术：` 前缀。
- C 选项下一步整体改写为“教科书刻板印象 / 一般路人回答”：明清商品经济自然进步、宋朝积贫积弱、地图大即强、明朝弃地缺席、江南奴变缺席、唐宋与元明清断裂缺少解释。
- 只改文档版题库；尚未写入 `src/data/*`。

## 15. 2026-05-01 题库拆分与 A/B 自然化状态

`docs/详细设计/题库.md` 已改为索引文件，正式题库正文按类别拆分到 `docs/详细设计/题库/`：

- `01-core.md`：核心题 C001-C020
- `02-fiscal.md`：财政制度题 F001-F030；其中 F014 保留用户指定 A/B/C/D
- `03-military.md`：军事制度题 M001-M018
- `04-administrative.md`：行政制度题 A001-A020
- `05-horizontal.md`：横向史观题 H001-H012
- `06-extended.md`：扩展题 E001-E040

本轮已逐题手工重写 A/B 选项，目标是提高自然度，避免“清朝在这类问题上更严重”“未必能这样定性”等批量模板。后续校对应按类别文件逐题处理，不要再用脚本批量生成或替换 A/B。

## 16. 2026-05-01 C 选项自然化状态

`docs/详细设计/题库/` 下 6 个拆分题库文件已逐题手工修订 C 选项。C 选项现在不再主要写成“不了解 / 不确定”，而是改为“不完整的一般印象 / 教材式直觉 / 路人摇摆”：

- 财政题偏向常见经济史印象，如明代税低、纸币难管、白银化与商品经济发展。
- 军事题偏向常见战史印象，如王振误国、名将厉害、卫所后期不行。
- 行政题偏向常见古代治理印象，如户籍本来严、乱世需要强人、有册籍像管理清楚。
- 横向与扩展题按主题写路人直觉，不再统一成“我不了解”。

F014 保留用户指定 C 选项原文。C 的评分口径不变，仍为历史了解程度 0、明朝偏向程度 1。

## 17. 2026-05-01 D 选项修订状态

`docs/详细设计/题库/` 下 6 个拆分题库文件已逐题手工修订 D 选项。D 选项仍保持“材料、机制、制度后果分析”的评分功能，但已尽量从判卷式短句或强吐槽改成更自然的分析判断。

本轮只处理 D 选项，没有覆盖用户中途调整过的 A/B/C 文本。F014 仍按用户指定选项保留。

## 18. 2026-05-02 最新题库与前端数据状态

本节覆盖前文旧的 100 题、140 题状态。后续继续任务时，以本节为当前事实。

### 当前题库真实状态

`docs/详细设计/题库/` 下文档版普通题库当前总数为 111 题：

- 核心题 26 题：`01-core.md`，题号 `C001-C026`
- 补充题 85 题：
  - 财政题 19 题：`02-fiscal.md`
  - 军事题 7 题：`03-military.md`
  - 行政题 6 题：`04-administrative.md`
  - 横向史观题 12 题：`05-horizontal.md`
  - 扩展题 41 题：`06-extended.md`

旧 handoff 中关于 100 题、139 题、140 题、C020/F030/M018/A020/E040 的记录仅作为历史过程，不再作为当前实现依据。

### 前端数据同步状态

文档题库已经写入普通版前端数据：

- `src/data/basic-core-questions.ts`：26 题
- `src/data/basic-supplemental-questions.ts`：85 题
- `src/data/basic-questions.ts`：合并导出核心与补充题
- 前端题目 id 使用文档题号小写，例如 `c001`、`f001`、`e041`

### 普通版抽题规则

普通版每次仍答 20 题，但抽题比例已调整：

- 核心题随机抽 6 题
- 补充题随机抽 14 题
- 核心题权重 2
- 补充题权重 1
- 单轴满分 78

对应配置文件：

- `src/data/basic-test-config.ts`
- `src/lib/basic-question-selection.ts`

### 互斥评分口径

普通版评分已经改为“历史了解程度”和“明朝偏向程度”互斥口径。原则：不存在“了解历史且偏向明朝”的高分组合。

当前选项分值：

| 选项 | 历史了解程度 | 明朝偏向程度 | 方向 |
| --- | ---: | ---: | --- |
| A | 0 | 3 | 强明粉 / 朱元璋梦男式判断 |
| B | 1 | 2 | 低了解但高明朝偏向 / 旧明粉式辩护 |
| C | 0 | 1 | 低了解、中等明朝偏向 / 教材式直觉 / 路人摇摆 |
| D | 3 | 0 | 倾向材料、机制和制度后果分析 |

对应实现：

- `src/data/basic-question-factory.ts`
- `docs/详细设计/题库.md`
- `docs/详细设计/题库/01-core.md`

### 结果阈值状态

普通版结果阈值已改为 78 分制：

- 理性历史观：历史了解 53-78，明朝偏向 0-39
- 完全不了解历史：历史了解 0-52，明朝偏向 0-26
- 轻度偏明萌萌人：历史了解 0-52，明朝偏向 27-39
- 被抬旗切割的旧明粉：明朝偏向 40-52
- 新明粉：明朝偏向 53-65
- 朱元璋梦男：明朝偏向 66-78
- `满遗` 仍是 `理性历史观` 的 10% 彩蛋显示名

对应文件：

- `src/data/basic-results.ts`
- `src/lib/basic-scoring.ts`

### 已通过校验

最近一次校验已通过：

```powershell
C:\nvm4w\nodejs\npm.cmd run typecheck
C:\nvm4w\nodejs\npm.cmd run lint
C:\nvm4w\nodejs\npm.cmd run build
```

同时已修复当前 Next 16 下失效的 lint 脚本和 ESLint flat config：

- `package.json` 中 `lint` 改为 `eslint .`
- `eslint.config.mjs` 改为直接使用 `eslint-config-next/core-web-vitals` 与 `eslint-config-next/typescript`

### 下一步推荐

下一步优先做普通版 MVP 页面，而不是 Pro 版：

1. `/test`：普通测试页，随机抽 20 题，核心 6 + 补充 14。
2. `/result`：普通结果页，展示称号、分数、解释、分享文案和 B 站/知乎入口。
3. `/announcements`：公告与免责声明页。
4. 首页文案改成当前真实口径：111 题库，随机抽 20 题。
5. Pro 入口先标记“建设中”或暂不可点。

后续部署目标：优先做 Cloudflare Pages 静态部署，不引入后端；答题记录只存浏览器本地，不上传服务器。

## 19. 2026-05-02 普通版 MVP 页面与首页状态

本节记录普通版 MVP 页面已落地后的当前状态。后续继续任务时，以本节为页面实现依据。

### 已完成页面

当前已新增并可构建的路由：

- `/`：首页
- `/test`：普通测试页
- `/result`：普通结果页
- `/announcements`：公告与免责声明页

普通版 MVP 已形成基本闭环：

1. 首页点击“开始测试”进入 `/test`
2. `/test` 随机抽 20 题，核心 6 + 补充 14
3. 用户逐题选择 A/B/C/D
4. 答完后进入 `/result`
5. `/result` 展示结果称号、历史了解分、明朝偏向分、解释和分享文案

答题 session 存在浏览器 `localStorage`，key 为：

```txt
mingqing-basic-test-session
```

session 类型定义在：

- `src/lib/basic-test-session.ts`

### 首页当前设计状态

首页已按参考图改为深色首屏 + 白色顶部导航：

- 左上角 logo + 站名：`新明粉检测器`
- 顶部导航为白色栏，鼠标 hover 有浅色选中背景
- 右上角“博客”已改为“我的B站”
- 首屏深色背景，主标题：`你是明粉吗?`
- 首屏显示：
  - 免费在线测试 · 无需注册
  - 开始测试
  - PRO 深度鉴定（建设中，不可点）
  - 累计测试次数
  - 道专业题目
  - 种结果类型

顶部/首屏标语当前为：

```txt
大明有好皇帝,却无好百姓!
```

首页底部已增加五种结果展示：

- 中立正常
- 萌萌人
- 旧明粉
- 新明粉
- 朱元璋梦男

注意：虽然内部普通版结果仍有更细分称号和 `满遗` 彩蛋，但首页展示按用户要求只展示五种大类。

### 首页统计状态

用户指出当前还没有人公开测试过，因此不能虚构累计测试人数。

当前首页统计已经归零：

- 总测试次数：0
- 五种结果分布：所有 count = 0，percent = 0
- 甜甜圈图在 0 数据时显示灰色占位

后续若要真实统计，需要另做 Cloudflare KV / D1 / 后端 API。当前 MVP 不做真实全站统计。

### 首页公告弹窗状态

首页进入时默认弹出“最新公告”弹窗。

弹窗可通过两种方式关闭：

- 点击右上角 `X`
- 点击底部 `我知道了`

当前要求是“进入首页默认跳出”，因此不要使用 sessionStorage 阻止刷新后再次弹出。

弹窗顶部内容已改为：

```txt
“大明有好皇帝,却无好百姓!”
------ 朱元璋梦男
```

弹窗说明包含：

- 111 道普通版题库，每次随机抽取 20 题
- 核心题 6 道，补充题 14 道
- 本地评分，不登录，不上传答题记录
- PRO 专业鉴定模式仍在建设中

账号链接状态：

- 关注我的B站：
  - `@契科夫的变色龙` → `https://space.bilibili.com/23467654`
  - `@解雨泽熙` → `https://space.bilibili.com/3690998957869718`
- 关注我的知乎账号：
  - `@解雨泽熙` → `https://www.zhihu.com/people/khg9ng`
- 投稿邮箱：
  - `p1gpaw@qq.com`

相关文件：

- `src/components/home-announcement-modal.tsx`
- `src/data/site-config.ts`

### 测试页状态与已修复 bug

`/test` 已删除“重新抽题”按钮。

用户要求：如果想重做，回到首页重新点进来。

已修复 bug：

- 之前未答满 20 题时，位于第 20 题会因为“查看结果”按钮 disabled 而无法继续，也无法查看结果。
- 当前修复为：“查看结果”按钮始终可点；如果仍有未答题，会自动跳到第一道未答题，并显示提示。

相关文件：

- `src/app/test/page.tsx`

### B 站与知乎链接配置

`src/data/site-config.ts` 当前有：

- `bilibiliChekhovUrl`: `https://space.bilibili.com/23467654`
- `bilibiliXieUrl`: `https://space.bilibili.com/3690998957869718`
- `bilibiliUrl`: 当前默认指向 `https://space.bilibili.com/3690998957869718`
- `zhihuUrl`: `https://www.zhihu.com/people/khg9ng`

后续如果某个按钮要链接“契科夫的变色龙”，应显式使用 `bilibiliChekhovUrl`。

### 最近校验状态

本轮页面开发中已多次通过：

```powershell
C:\nvm4w\nodejs\npm.cmd run typecheck
C:\nvm4w\nodejs\npm.cmd run lint
C:\nvm4w\nodejs\npm.cmd run build
```

最近一次完整状态：

- `typecheck` 已通过
- `lint` 已通过
- `build` 已在最新首页和测试页修复后通过

### 下一步待做

1. 用浏览器手动检查首页：
   - 白色顶部导航
   - hover 选中效果
   - 左上角 `新明粉检测器`
   - 公告默认弹出
   - B 站/知乎链接正确
   - 总测试人数为 0
   - 底部五种结果展示
2. 手动测试 `/test`：
   - 故意漏答前面题目，跳到第 20 题点“查看结果”
   - 应自动跳回第一道未答题，而不是卡死
3. 后续再进入 Cloudflare Pages 静态部署准备。

## 20. 2026-05-02 Cloudflare Workers、D1 与自定义域最新状态

本节覆盖前文关于“Cloudflare Pages 静态部署”“当前 MVP 不做真实全站统计”的旧记录。后续继续任务时，以本节为部署和统计实现依据。

### 当前部署状态

项目已从“纯静态 Pages”方案调整为：

- Cloudflare Workers + OpenNext 部署 Next.js
- Cloudflare D1 保存匿名测试完成记录
- GitHub 仓库：`https://github.com/hzy029/mingfenti`
- Cloudflare 项目名：`mingfenti`
- Worker 预览域：`mingfenti.h1148899753.workers.dev`
- 自定义域：`mingfen.sbs` 已添加到 Worker 的“域和路由”

Cloudflare 构建日志已确认：

- Node.js 22.16.0
- `npx opennextjs-cloudflare build` 构建成功
- Worker 成功生成 `.open-next/worker.js`
- Worker binding 中已有 `env.DB (mingqing-detector)` 和 `env.ASSETS`

此前 `mingfen.sbs` 访问出现 522，是因为根域名 DNS 仍指向旧 Pages/源站记录。已通过删除旧 `CNAME mingfen.sbs -> mingfen.pages.dev` 并给 Worker 添加自定义域处理。

### D1 数据库状态

D1 数据库已创建：

```txt
database_name = mingqing-detector
database_id = b4efd9c5-e0e4-4b84-b8d9-70a89671bb5d
binding = DB
```

对应配置文件：

- `wrangler.toml`

表结构文件：

- `schema.sql`

已执行远程建表，并验证：

```powershell
C:\nvm4w\nodejs\npm.cmd run d1:count:remote
```

返回 `count = 0` 时代表表已存在但尚无记录，不是异常。

### 当前统计实现

当前匿名统计不保存逐题答题明细，只保存一次完成测试事件：

- `result_id`
- `result_title`
- `history_knowledge`
- `ming_preference`
- `started_at`
- `completed_at`
- `duration_seconds`
- `is_recorded`
- `created_at`

相关文件：

- `src/app/api/basic-attempts/route.ts`：写入 D1
- `src/app/api/basic-stats/route.ts`：读取首页统计
- `src/lib/cloudflare-db.ts`：通过 `getCloudflareContext({ async: true }).env.DB` 获取 D1
- `src/lib/basic-stats.ts`：聚合五类分布
- `src/app/page.tsx`：首页服务端动态读取统计

统计映射：

```txt
objective-neutral + manchu-loyalist -> 中立正常
ming-leaning-moe -> 萌萌人
old-ming-fan -> 旧明粉
new-ming-fan -> 新明粉
zhu-yuanzhang-dreamer -> 朱元璋梦男
```

注意：

- `满遗` 保留为 `客观中立` 的 10% 随机彩蛋，首页统计中归入“中立正常”
- 少于 30 秒完成的测试会返回 `too-fast`，不会写入统计
- 首页统计接口失败或 D1 不可用时会回落为 0 数据，不影响页面打开

### 当前脚本

```powershell
C:\nvm4w\nodejs\npm.cmd run dev
C:\nvm4w\nodejs\npm.cmd run typecheck
C:\nvm4w\nodejs\npm.cmd run lint
C:\nvm4w\nodejs\npm.cmd run build
C:\nvm4w\nodejs\npm.cmd run d1:apply:remote
C:\nvm4w\nodejs\npm.cmd run d1:count:remote
```

Cloudflare 构建命令：

```bash
npx opennextjs-cloudflare build
```

Cloudflare 当前实际部署命令：

```bash
npx wrangler versions upload
```

### 明天建议继续检查

1. 打开 `https://mingfen.sbs/`，确认首页稳定访问。
2. 完成一次超过 30 秒的普通测试。
3. 执行 `d1:count:remote`，确认 `basic_attempts` 记录数增加。
4. 刷新首页，确认“累计测试次数”和五类结果分布更新。
5. 若统计不更新，优先检查 `/api/basic-attempts` 是否返回 `too-fast`、`database-not-configured` 或 `database-write-failed`。

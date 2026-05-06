# 普通版测试接入文档题库（20 题按比例抽取）— 实现说明

## 抽题比例（与文档题量对齐）

当前文档题量以生成脚本输出为准（约 `46 + 26 + 15 + 13`）。每次测验 **20** 题，按比例取整（最大余数法）：

| 池 | 题量（约） | 抽题数 | 权重（与 Pro 核心/补充对齐） |
| --- | --- | --- | --- |
| 核心极端 `E###` | 46 | **10** | `bank: core`, `weight: 2` |
| 核心理性 `R###` | 26 | **4** | `bank: core`, `weight: 2` |
| 普通极端 `OE###` | 15 | **3** | `bank: supplemental`, `weight: 1` |
| 普通理性 `OR###` | 13 | **3** | `bank: supplemental`, `weight: 1` |

抽完后将 **20 题整体再洗牌** 一次，避免题型总按块出现。

## 实现步骤

1. **类型**（`src/data/types.ts`）：为 `TfQuestion` 增加可选字段 `liteScoring?: { mode: "extreme" \| "rational"; lean: "support" \| "oppose" }`。`statement` 直接使用文档**题干**全文；`correctTrue` 可固定为 `false`（判分走 `liteScoring` 分支）。

2. **生成数据**（推荐）：[`scripts/generate-lite-bank-data.ts`](../../../scripts/generate-lite-bank-data.ts) 用 `fs.readFileSync` 读取  
   `docs/详细设计/题库/lite/01-core-extreme.md`、  
   `02-core-rational.md`、  
   `ordinary/01-ordinary-extreme.md`、  
   `ordinary/02-ordinary-rational.md`，  
   用正则 `^## (E|R|OE|OR)(\d{3})\s*$` 分块，解析 `题干：` 与 `明粉倾向：` / `理性倾向：`（须为「支持」或「反对」），输出 **`src/data/lite-bank-data.ts`**（提交到仓库）。

   - 写入生成结果：`npm run generate:lite-bank`
   - 仅校验解析与题量是否满足抽题下限（不写文件）：`npm run generate:lite-bank:check`
   - 打印各池题数：`npx tsx scripts/generate-lite-bank-data.ts --verbose`

   生成脚本内 `MIN_POOL` 须与 [`src/lib/lite-question-selection.ts`](../../../src/lib/lite-question-selection.ts) 的 `LITE_DRAW` 一致；若某池题量不足会抛错。

3. **抽题**（`src/lib/lite-question-selection.ts`）：  
   - `import` 四个 `LITE_BANK_*` 常量；  
   - 对各池 `shuffle` 后 `slice` 取上表数量；  
   - 映射为 `TfQuestion`：`id` 建议 `lite-${entry.id}-${order}`，`sourceQuestionId` 可用 `lite-bank-${entry.id}`（与旧逻辑区分），`category` 用「核心极端 / 核心理性 / 普通极端 / 普通理性」，`variant` 可固定 `"support"` 或交替仅作 UI 标签。

4. **判分**（`src/lib/lite-scoring.ts`）：若存在 `tf.liteScoring`，则**不再**查 `basicQuestions`：  
   - `userSupport === true` 表示用户点击「支持」（认同题干）。  
   - **极端题**：`mingAligned = (userSupport === (lean === "support"))`；若 `mingAligned` 则 `mingPreference += 3 * weight`，否则 `historyKnowledge += 3 * weight`。  
   - **理性题**：`rationalAligned = (userSupport === (lean === "support"))`；若 `rationalAligned` 则 `historyKnowledge += 3 * weight`，否则 `mingPreference += 2 * weight` 且 `historyKnowledge += 1 * weight`（扣明粉、略抬了解分，可按试测再调）。  
   - 无 `liteScoring` 时保留原 `basicQuestions` 回退路径，兼容旧 session。

5. **答题页**（`src/app/test/play/page.tsx`）：进度条分母用 `questions.length`（已为 20）；「反向题/正向题」若与文档题不一致，可改为展示 `liteScoring.mode` 或隐藏该徽标。

6. **校验**：`npm run generate:lite-bank:check`（或全量生成后）`npm run typecheck`。

## 与 README 的关系

在仓库根目录 [`README.md`](../../../README.md) 中有「普通版判断题题库」小节：实现侧以 `generate:lite-bank` 生成数据为准，修改 Markdown 后需重新生成并提交 `lite-bank-data.ts`。

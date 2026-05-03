# Pro 版评测标准（双轴四选一）

版本：v0.2  
用途：描述 **Pro 版** 在双轴计分、抽题和结果匹配上的标准；与实现代码、[`basic-evaluation-standard.md`](./basic-evaluation-standard.md) 配合阅读。  
状态：待人工补充与校对

---

## 1. Pro 版定位

- **Pro 版** = 每次 **20** 题、**四选一**、**双维度**（历史了解程度 × 明朝偏向程度）的测验；即工程当前已实现的计分与题库形态（原「普通版双轴」在文档中改称 Pro）。
- 结果与 **普通版（判断题）** 共用同一套 `resultId` 与展示文案，见 [`basic-evaluation-standard.md`](./basic-evaluation-standard.md) §3。
- Pro 不输出独立「四维画像」；历史上曾规划的四维产品线已**废止**（见本文附录 A）。

---

## 2. 计分与匹配（与代码一致）

| 项目 | 说明 |
| --- | --- |
| 计分函数 | [`src/lib/basic-scoring.ts`](../../src/lib/basic-scoring.ts)：`scoreBasicAnswers` 对选中选项的 `historyKnowledge` / `mingPreference` 按题权值累加 |
| 结果矩形 | [`src/data/basic-results.ts`](../../src/data/basic-results.ts)：`basicResultTiers` 中各档 `min`/`max`（**78 分制**） |
| 匹配顺序 | `objective-neutral` → `ming-leaning-moe` → `old-ming-fan` → `new-ming-fan` → `zhu-yuanzhang-dreamer`；首个落入矩形者为基底档 |
| 展示变体 | `manchu-loyalist`：`objective-neutral` 同源，`displayChance` 随机展示「满遗」 |

选项分值表、抽题规则（6 核心 + 14 补充）、满分 78 的推导见 [`basic-evaluation-standard.md`](./basic-evaluation-standard.md) §2。

---

## 3. 出题与校准原则

- 单题优先命中一条清晰史观立场；选项梯度覆盖「强辩护—摇摆—制度分析」。
- 核心题权值更高，应锚定最能区分 **明朝偏向度** 的争议点。
- 上线后根据各档人数分布、用户反馈调整题干表述或阈值（阈值变更须同步改 `basic-results.ts` 并回归测试）。

---

## 附录 A：原「四维 Pro」方案状态说明（废止）

曾计划在独立产品线中输出四维成分（如西方中心主义、教科书教条主义、封建主义、科学社会主义）及另一套称号。**该产品方向已取消**，不再维护四维阈值、主结果优先级或与 [`pro-result-design.md`](./pro-result-design.md) 中四维示意图对应的落地路线；样本目录仍可作选题素材参考，但不承诺与任何在线算法一致。

若将来重新引入多维度画像，应另起需求评审与版本号，避免与本文 **Pro = 双轴 20 题** 定义混淆。

---

## 附录 B：相关文档

- [评测标准（含普通版判断 + Pro 双轴总览）](./basic-evaluation-standard.md)
- [正式题库索引](./题库.md)
- [Pro 结果设计（历史稿，四维向）](./pro-result-design.md)（仅作归档参考，**非**当前产品真值）

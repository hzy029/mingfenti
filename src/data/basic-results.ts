import type { BasicResultTier } from "./types";

/**
 * 普通版结果矩形区间与 `basic-evaluation-standard.md` §6 一致，
 * 数值为 78 分制（6×core×2 + 14×supp×1，每维每题最高 3×权值）。
 * 匹配顺序见 `basic-scoring.ts`。
 */
export const basicResultTiers: BasicResultTier[] = [
  {
    id: "objective-neutral",
    historyKnowledge: { min: 0, max: 78 },
    mingPreference: { min: 0, max: 26 },
    title: "客观中立",
    summary:
      "你对明清史的判断整体不太被朝代身份牵着走，对明代的财政、货币、户籍、海禁和宋进明退等理论有较为深刻的认识。",
    shareText: "我测出来是客观中立——先看材料和制度后果，再谈朝代滤镜。"
  },
  {
    id: "manchu-loyalist",
    sourceResultId: "objective-neutral",
    displayChance: 0.1,
    historyKnowledge: { min: 0, max: 78 },
    mingPreference: { min: 0, max: 26 },
    title: "满遗",
    summary:
      "你对明朝的黑点了如指掌，一看就是满遗，八旗自己选个旗吧。",
    shareText: "我测出来是满遗，系统说这是客观中立的 10% 抬旗彩蛋。"
  },
  {
    id: "ming-leaning-moe",
    historyKnowledge: { min: 0, max: 78 },
    mingPreference: { min: 27, max: 39 },
    title: "萌萌人",
    summary:
      "对明朝有朴素好感，多来自教科书或自媒体，遇到细节如明朝的货币财政管理理解的还不够深刻，建议多读论文，多了解洪武型财政的弊端。",
    shareText: "我测出来是萌萌人，大明滤镜有一点，系统论证还没点满。"
  },
  {
    id: "old-ming-fan",
    historyKnowledge: { min: 0, max: 78 },
    mingPreference: { min: 40, max: 52 },
    title: "旧明粉",
    summary:
      "对明代有明确情感偏向，会辩护但仍会承认部分制度代价；通常还愿意为袁崇焕、于谦、张居正等辩护，不愿意与伪史论、健康的裹脚等逆天言论合流。这也导致你们在当下的舆论场里容易被抬旗。少部分人甚至愿意公开与现在的新明粉切割。",
    shareText: "我测出来是旧明粉，心向大明，但还没把大脑托管给祖制.exe。"
  },
  {
    id: "new-ming-fan",
    historyKnowledge: { min: 0, max: 78 },
    mingPreference: { min: 53, max: 65 },
    title: "新明粉",
    summary:
      "大明有好皇帝缺无好百姓，好大臣，但是有好太监。",
    shareText: "我测出来是新明粉，祖制护航 patch 已经装上了。"
  },
  {
    id: "zhu-yuanzhang-dreamer",
    historyKnowledge: { min: 0, max: 78 },
    mingPreference: { min: 66, max: 78 },
    title: "朱元璋梦男",
    summary:
      "判断力很准确，不会被明黑的话术迷惑，快去留言榜（待更新）分享自己的经验。",
    shareText: "我测出来是朱元璋梦男，洪武祖制已经写进 DNA。"
  }
];

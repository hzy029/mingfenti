import type { ReferenceTopic, SampleCategory } from "./types";

export const referenceTopics: ReferenceTopic[] = [
  {
    id: "hongwu-finance",
    title: "洪武型财政与货币秩序",
    purpose: "普通版主轴题、Pro 版封建主义维度",
    dataPath: "docs/references/topic-index.md#洪武型财政与货币秩序",
    questionDirections: [
      "禁钱、禁银、宝钞失败与货币秩序",
      "明初去货币化与市场萎缩",
      "铜钱流通范围、银进钱出、钱法管理能力",
      "洪武型财政是否属于制度倒退"
    ]
  },
  {
    id: "song-ming-comparison",
    title: "宋明比较与宋进明退论",
    purpose: "普通版主轴题、Pro 版科学社会主义和封建主义维度",
    dataPath: "docs/references/topic-index.md#宋明比较与宋进明退论",
    questionDirections: [
      "宋代商业、财政、城市、文化是否能推出明代全面倒退",
      "宋朝迁徙制度、户籍管理与社会流动",
      "南宋会子问题与宋代财政货币制度的复杂性",
      "用 GDP、国民收入、货币存量比较宋明的风险"
    ]
  },
  {
    id: "early-ming-social-control",
    title: "明初封建主义与社会控制",
    purpose: "Pro 版封建主义维度",
    dataPath: "docs/references/topic-index.md#明初封建主义与社会控制",
    questionDirections: [
      "重典治国、基层控制、户籍与赋役绑定",
      "洪武朝南方各族反抗与社会治理成本",
      "对强皇权、高压秩序和国家控制的接受程度"
    ]
  },
  {
    id: "maritime-ban",
    title: "航海、海禁与海外开拓",
    purpose: "Pro 版科学社会主义维度、普通版补充题",
    dataPath: "docs/references/topic-index.md#航海海禁与海外开拓",
    questionDirections: [
      "郑和下西洋、朝贡制度和海禁政策",
      "民间航海业、造船基础与水手储备",
      "明初海外政策是否破坏长期海洋开拓"
    ]
  },
  {
    id: "public-history",
    title: "学术史、史观批判与公共历史传播",
    purpose: "公告、关于页、AI 锐评语气、题目讽刺表达",
    dataPath: "docs/references/topic-index.md#学术史史观批判与公共历史传播",
    questionDirections: [
      "对权威叙事、学历崇拜、学术话术的态度",
      "公共历史讨论中的断章取义和概念滥用",
      "题目解释和结果页锐评的语气素材"
    ]
  }
];

export const sampleCategories: SampleCategory[] = [
  {
    id: "feudal-royalist",
    title: "封建保皇派样本",
    dataPath: "docs/references/samples/feudal-royalist/",
    scope: [
      "朱元璋梦男言论",
      "洪武祖制辩护",
      "强皇权、重典治国、户籍束缚辩护",
      "大明宝钞成功论",
      "明史被篡改、满清抹黑等祖制护航话术"
    ],
    suggestedTags: [
      "洪武财政辩护",
      "宝钞成功论",
      "禁钱合理化",
      "强皇权辩护",
      "户籍束缚合理化",
      "海禁合理化",
      "史料阴谋论",
      "祖制护航"
    ]
  },
  {
    id: "western-centrism",
    title: "西方中心主义样本",
    dataPath: "docs/references/samples/western-centrism/",
    scope: [
      "用欧洲近代化路径直接套中国史",
      "用资本主义萌芽解释宋明差异",
      "把海外贸易、市场经济、城市商业作为单一评价标尺",
      "把复杂制度问题简化成所谓思维问题"
    ],
    suggestedTags: [
      "欧洲近代化模板",
      "资本主义萌芽中心论",
      "海洋扩张崇拜",
      "市场经济单一尺度",
      "城市商业单一尺度",
      "西方史观套用"
    ]
  },
  {
    id: "historical-fandom-women",
    title: "史同女性样本",
    dataPath: "docs/references/samples/史同女性/",
    scope: [
      "历史同人女性向创作中的典型角色投射",
      "对历史人物关系、人格、情感和权力结构的二创式解读",
      "将历史讨论转化为 CP、梦向、嬷向、饭圈化表达的话术",
      "用情感偏好替代制度、财政、社会结构分析的言论"
    ],
    suggestedTags: [
      "历史同人",
      "女性向二创",
      "CP 解读",
      "梦向表达",
      "饭圈化史观",
      "情感投射",
      "人物厨",
      "史观争论参与"
    ]
  }
];

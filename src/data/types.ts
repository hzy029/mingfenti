export type BasicScoreAxis = "historyKnowledge" | "mingPreference";

export type BasicOptionScore = Record<BasicScoreAxis, number>;

export type BasicOption = {
  id: string;
  label: string;
  score: BasicOptionScore;
};

export type BasicQuestion = {
  id: string;
  order: number;
  category: string;
  bank: "core" | "supplemental";
  weight: 1 | 2;
  title: string;
  tags?: string[];
  referenceTopicIds?: ReferenceTopicId[];
  sampleCategoryIds?: SampleCategoryId[];
  options: BasicOption[];
};

export type BasicResultId =
  | "objective-neutral"
  | "manchu-loyalist"
  | "ming-leaning-moe"
  | "old-ming-fan"
  | "new-ming-fan"
  | "zhu-yuanzhang-dreamer";

export type BasicResultTier = {
  id: BasicResultId;
  historyKnowledge: {
    min: number;
    max: number;
  };
  mingPreference: {
    min: number;
    max: number;
  };
  title: string;
  summary: string;
  shareText: string;
  displayChance?: number;
  sourceResultId?: BasicResultId;
};

export type ReferenceTopicId =
  | "hongwu-finance"
  | "song-ming-comparison"
  | "early-ming-social-control"
  | "maritime-ban"
  | "public-history";

export type SampleCategoryId =
  | "feudal-royalist"
  | "western-centrism"
  | "historical-fandom-women";

export type ReferenceTopic = {
  id: ReferenceTopicId;
  title: string;
  purpose: string;
  dataPath: string;
  questionDirections: string[];
};

export type SampleCategory = {
  id: SampleCategoryId;
  title: string;
  dataPath: string;
  scope: string[];
  suggestedTags: string[];
};

export type ProDimensionKey =
  | "westernCentrism"
  | "textbookDogmatism"
  | "feudalism"
  | "scientificSocialism";

export type ProScore = Record<ProDimensionKey, number>;

export type ProOption = {
  id: string;
  label: string;
  score: Partial<ProScore>;
};

export type ProQuestion = {
  id: string;
  order: number;
  category: string;
  title: string;
  options: ProOption[];
};

export type ProDimensionStrength = "none" | "weak" | "strong";

export type ProResultTitle =
  | "萌萌人"
  | "西方中心论者"
  | "教科书主义者"
  | "朱家太监"
  | "旧明粉"
  | "封建遗老"
  | "正常人";

export type ProResultProfile = {
  title: ProResultTitle;
  summary: string;
  shareText: string;
};

export type ProResult = {
  title: ProResultTitle;
  dominantDimension?: ProDimensionKey;
  strengths: Record<ProDimensionKey, ProDimensionStrength>;
  rawScores: ProScore;
  normalizedScores: ProScore;
  profile: ProResultProfile;
};

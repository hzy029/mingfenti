import { getD1Database } from "@/lib/cloudflare-db";

export type BasicStatsDistributionItem = {
  label: string;
  count: number;
  percent: number;
  color: string;
  tone: string;
  image: string;
};

export type BasicStats = {
  totalTests: number;
  questionCount: number;
  resultTypes: number;
  distribution: BasicStatsDistributionItem[];
};

type BasicAttemptCountRow = {
  result_id: string;
  count: number;
};

const RESULT_DISTRIBUTION_TEMPLATE = [
  { key: "neutral", label: "中立正常", color: "#18c48f", tone: "理性客观", image: "/icons/大笑奶龙.png" },
  { key: "moe", label: "萌萌人", color: "#f59e0b", tone: "纯路人", image: "/icons/萌萌人.png" },
  { key: "old", label: "旧明粉", color: "#94a3b8", tone: "已被抬旗", image: "/icons/旧明粉.png" },
  { key: "new", label: "新明粉", color: "#6366f1", tone: "汉服鹿角妈妈窝", image: "/icons/新明粉.png" },
  {
    key: "dreamer",
    label: "朱元璋梦男",
    color: "#ef233c",
    tone: "所有心理问题都是性压抑",
    image: "/icons/朱元璋梦男.png"
  }
] as const;

const RESULT_ID_TO_DISTRIBUTION_KEY: Record<string, (typeof RESULT_DISTRIBUTION_TEMPLATE)[number]["key"]> = {
  "objective-neutral": "neutral",
  "manchu-loyalist": "neutral",
  "ming-leaning-moe": "moe",
  "old-ming-fan": "old",
  "new-ming-fan": "new",
  "zhu-yuanzhang-dreamer": "dreamer"
};

function buildStats(countByKey: Record<string, number>): BasicStats {
  const totalTests = Object.values(countByKey).reduce((sum, count) => sum + count, 0);

  return {
    totalTests,
    questionCount: 20,
    resultTypes: RESULT_DISTRIBUTION_TEMPLATE.length,
    distribution: RESULT_DISTRIBUTION_TEMPLATE.map((item) => {
      const count = countByKey[item.key] ?? 0;

      return {
        label: item.label,
        count,
        percent: totalTests > 0 ? (count / totalTests) * 100 : 0,
        color: item.color,
        tone: item.tone,
        image: item.image
      };
    })
  };
}

export function getEmptyBasicStats(): BasicStats {
  return buildStats({});
}

export async function getBasicStats(): Promise<BasicStats> {
  const db = await getD1Database();

  if (!db) {
    return getEmptyBasicStats();
  }

  try {
    const queryResult = await db
      .prepare(
        `SELECT result_id, COUNT(*) AS count
        FROM basic_attempts
        WHERE is_recorded = 1
        GROUP BY result_id`
      )
      .all<BasicAttemptCountRow>();

    const countByKey: Record<string, number> = {};

    for (const row of queryResult.results ?? []) {
      const key = RESULT_ID_TO_DISTRIBUTION_KEY[row.result_id];

      if (key) {
        countByKey[key] = (countByKey[key] ?? 0) + Number(row.count);
      }
    }

    return buildStats(countByKey);
  } catch {
    return getEmptyBasicStats();
  }
}

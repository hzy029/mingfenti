import { getD1Database } from "@/lib/cloudflare-db";
import { previewBoardBody, stripMarkdownForPreview } from "@/lib/board-text";
import { ensureBoardReviewSchema } from "@/lib/board-review";

export type BoardHomeSlide = {
  topicId: number;
  topicTitle: string;
  pinWeight: number;
  topPostId: number | null;
  topPostPreview: string | null;
  topPostHeat: number;
};

type TopicRow = {
  id: number;
  title: string;
  pin_weight: number;
};

type TopicAggRow = {
  topic_id: number;
  topic_title: string;
  pin_weight: number;
  max_heat: number;
  reply_count: number;
};

type PostRow = {
  id: number;
  body: string;
  heat_score: number;
};

async function fetchTopPostForTopic(topicId: number): Promise<PostRow | undefined> {
  const db = await getD1Database();

  if (!db) {
    return undefined;
  }

  await ensureBoardReviewSchema(db);

  const { results } = await db
    .prepare(
      `SELECT id, body, heat_score
      FROM board_posts
      WHERE topic_id = ? AND hidden = 0 AND review_status = 'published'
      ORDER BY heat_score DESC, id DESC
      LIMIT 1`
    )
    .bind(topicId)
    .all<PostRow>();

  return results?.[0];
}

function toSlide(topic: TopicRow, post: PostRow | undefined): BoardHomeSlide {
  return {
    topicId: topic.id,
    topicTitle: topic.title,
    pinWeight: topic.pin_weight,
    topPostId: post?.id ?? null,
    topPostPreview: post ? previewBoardBody(stripMarkdownForPreview(post.body)) : null,
    topPostHeat: post?.heat_score ?? 0
  };
}

export async function getBoardHomeSlides(): Promise<{ pin: BoardHomeSlide | null; hotTen: BoardHomeSlide[] }> {
  const db = await getD1Database();

  if (!db) {
    return { pin: null, hotTen: [] };
  }

  try {
    await ensureBoardReviewSchema(db);
    const pinResult = await db
      .prepare(
        `SELECT id, title, pin_weight
        FROM board_topics
        WHERE hidden = 0
        ORDER BY pin_weight DESC, id DESC
        LIMIT 1`
      )
      .all<TopicRow>();

    const pinTopic = pinResult.results?.[0];
    let pin: BoardHomeSlide | null = null;

    if (pinTopic) {
      const topPost = await fetchTopPostForTopic(pinTopic.id);
      pin = toSlide(pinTopic, topPost);
    }

    const hotResult = await db
      .prepare(
        `SELECT
          t.id AS topic_id,
          t.title AS topic_title,
          t.pin_weight AS pin_weight,
          COALESCE(MAX(p.heat_score), 0) AS max_heat,
          COUNT(p.id) AS reply_count
        FROM board_topics t
        LEFT JOIN board_posts p ON p.topic_id = t.id AND p.hidden = 0 AND p.review_status = 'published'
        WHERE t.hidden = 0
        GROUP BY t.id
        ORDER BY max_heat DESC, reply_count DESC, t.id DESC
        LIMIT 10`
      )
      .all<TopicAggRow>();

    const hotTen: BoardHomeSlide[] = [];

    for (const row of hotResult.results ?? []) {
      const topic: TopicRow = {
        id: row.topic_id,
        title: row.topic_title,
        pin_weight: row.pin_weight
      };
      const topPost = await fetchTopPostForTopic(topic.id);
      hotTen.push(toSlide(topic, topPost));
    }

    return { pin, hotTen };
  } catch {
    return { pin: null, hotTen: [] };
  }
}

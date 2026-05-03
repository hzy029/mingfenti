import { unstable_cache } from "next/cache";
import { getD1Database } from "@/lib/cloudflare-db";
import { previewBoardBody, stripMarkdownForPreview } from "@/lib/board-text";
import { ensureBoardReviewSchema } from "@/lib/board-review";

export type BoardHomeSlide = {
  topicId: number;
  topicTitle: string;
  pinWeight: number;
  topPostId: number | null;
  topPostPreview: string | null;
};

type TopicRow = {
  id: number;
  title: string;
  pin_weight: number;
};

type HomeTopicRow = TopicRow & {
  top_post_id: number | null;
  top_post_body: string | null;
};

function toSlide(row: HomeTopicRow): BoardHomeSlide {
  return {
    topicId: row.id,
    topicTitle: row.title,
    pinWeight: row.pin_weight,
    topPostId: row.top_post_id,
    topPostPreview: row.top_post_body ? previewBoardBody(stripMarkdownForPreview(row.top_post_body)) : null
  };
}

async function loadBoardHomeSlides(): Promise<{ pin: BoardHomeSlide | null; hotTen: BoardHomeSlide[] }> {
  const db = await getD1Database();

  if (!db) {
    return { pin: null, hotTen: [] };
  }

  try {
    await ensureBoardReviewSchema(db);
    const result = await db
      .prepare(
        `SELECT
          t.id,
          t.title,
          t.pin_weight,
          (
            SELECT p.id
            FROM board_posts p
            WHERE p.topic_id = t.id AND p.hidden = 0 AND p.review_status = 'published'
            ORDER BY p.published_at DESC, p.id DESC
            LIMIT 1
          ) AS top_post_id,
          (
            SELECT p.body
            FROM board_posts p
            WHERE p.topic_id = t.id AND p.hidden = 0 AND p.review_status = 'published'
            ORDER BY p.published_at DESC, p.id DESC
            LIMIT 1
          ) AS top_post_body
        FROM board_topics t
        WHERE t.hidden = 0
        ORDER BY t.pin_weight DESC, t.id DESC
        LIMIT 1`
      )
      .all<HomeTopicRow>();

    const row = result.results?.[0];

    return { pin: row ? toSlide(row) : null, hotTen: [] };
  } catch {
    return { pin: null, hotTen: [] };
  }
}

export const getBoardHomeSlides = unstable_cache(loadBoardHomeSlides, ["board-home-slides"], {
  revalidate: 600
});

CREATE TABLE IF NOT EXISTS basic_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  result_id TEXT NOT NULL,
  result_title TEXT NOT NULL,
  history_knowledge INTEGER NOT NULL,
  ming_preference INTEGER NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  is_recorded INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_basic_attempts_result_id
  ON basic_attempts (result_id);

CREATE INDEX IF NOT EXISTS idx_basic_attempts_created_at
  ON basic_attempts (created_at);

CREATE TABLE IF NOT EXISTS board_topics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  pin_weight INTEGER NOT NULL DEFAULT 0,
  hidden INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_board_topics_pin_weight
  ON board_topics (pin_weight);

CREATE TABLE IF NOT EXISTS board_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id INTEGER NOT NULL,
  author_display TEXT,
  body TEXT NOT NULL,
  heat_score INTEGER NOT NULL DEFAULT 0,
  hidden INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (topic_id) REFERENCES board_topics(id)
);

CREATE INDEX IF NOT EXISTS idx_board_posts_topic_id
  ON board_posts (topic_id);

CREATE INDEX IF NOT EXISTS idx_board_posts_topic_heat
  ON board_posts (topic_id, heat_score);

CREATE TABLE IF NOT EXISTS board_topic_meta (
  topic_id INTEGER PRIMARY KEY,
  description TEXT,
  FOREIGN KEY (topic_id) REFERENCES board_topics(id)
);

CREATE TABLE IF NOT EXISTS board_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  answer_id INTEGER NOT NULL,
  author_display TEXT,
  body TEXT NOT NULL,
  heat_score INTEGER NOT NULL DEFAULT 0,
  hidden INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (answer_id) REFERENCES board_posts(id)
);

CREATE INDEX IF NOT EXISTS idx_board_comments_answer_id
  ON board_comments (answer_id);

CREATE INDEX IF NOT EXISTS idx_board_comments_answer_heat
  ON board_comments (answer_id, heat_score);

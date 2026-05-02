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

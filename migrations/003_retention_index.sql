CREATE INDEX IF NOT EXISTS app_streaks__streak_logs_retention_idx
  ON app_streaks__streak_logs (created_at, id);

-- Speeds up the active-streaks load query (WHERE archived_at IS NULL)
-- as retired streaks accumulate over time.
CREATE INDEX IF NOT EXISTS streaks_archived_at_idx
  ON app_streaks__streaks (archived_at);

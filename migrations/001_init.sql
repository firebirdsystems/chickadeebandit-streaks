CREATE TABLE IF NOT EXISTS app_streaks__streaks (
  id           TEXT    NOT NULL,
  owner_id     TEXT    NOT NULL,
  title        TEXT    NOT NULL,
  emoji        TEXT    NOT NULL DEFAULT '🔥',
  -- 'private' = only owner sees it
  -- 'adults'  = owner + all adults
  -- 'everyone' = whole household
  visibility   TEXT    NOT NULL DEFAULT 'private',
  is_group     INTEGER NOT NULL DEFAULT 0,   -- 1 = any visible member can log
  created_at   TEXT    NOT NULL,
  archived_at  TEXT,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS app_streaks__streak_logs (
  id           TEXT NOT NULL,
  streak_id    TEXT NOT NULL,
  logged_by    TEXT NOT NULL,   -- member_id who checked it off
  logged_date  TEXT NOT NULL,   -- YYYY-MM-DD local date
  created_at   TEXT NOT NULL,
  PRIMARY KEY (id)
);

-- Prevent duplicate logs for the same streak on the same day
CREATE UNIQUE INDEX IF NOT EXISTS streak_logs_unique_day
  ON app_streaks__streak_logs (streak_id, logged_date);

-- Visibility filtering is enforced in application queries using hub-injected
-- session context. This index improves performance for the visibility-filtered
-- streak query.
CREATE INDEX IF NOT EXISTS streaks_visibility_idx
  ON app_streaks__streaks (owner_id, visibility);

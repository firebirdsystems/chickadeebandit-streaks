CREATE TABLE IF NOT EXISTS streaks (
  household_id UUID    NOT NULL DEFAULT current_setting('app.household_id', true)::uuid,
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
  PRIMARY KEY (household_id, id)
);

CREATE TABLE IF NOT EXISTS streak_logs (
  household_id UUID NOT NULL DEFAULT current_setting('app.household_id', true)::uuid,
  id           TEXT NOT NULL,
  streak_id    TEXT NOT NULL,
  logged_by    TEXT NOT NULL,   -- member_id who checked it off
  logged_date  TEXT NOT NULL,   -- YYYY-MM-DD local date
  created_at   TEXT NOT NULL,
  PRIMARY KEY (household_id, id)
);

-- Prevent duplicate logs for the same streak on the same day
CREATE UNIQUE INDEX IF NOT EXISTS streak_logs_unique_day
  ON streak_logs (household_id, streak_id, logged_date);

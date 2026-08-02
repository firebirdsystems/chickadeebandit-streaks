-- Automation support for the `start_streak` action.
--
-- `source_event_id` records which app event produced the row. The dispatcher's
-- dedupe guard matches on it (SELECT 1 FROM ... WHERE source_event_id = ?
-- LIMIT 1), so a retried or replayed delivery finds the existing row and skips
-- instead of starting a second copy of the same streak.
--
-- Nullable on purpose: streaks a member starts in the UI have no source event,
-- and the guard only ever looks for a specific non-null id.
ALTER TABLE app_streaks__streaks ADD COLUMN source_event_id TEXT;

CREATE INDEX IF NOT EXISTS app_streaks__idx_streaks_source_event_id
  ON app_streaks__streaks(source_event_id);

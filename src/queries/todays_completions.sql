SELECT
  sl.id,
  sl.streak_id,
  sl.logged_by,
  sl.logged_date,
  s.title  AS streak_title,
  s.emoji  AS streak_emoji
FROM streak_logs sl
JOIN streaks s
  ON s.id           = sl.streak_id
  AND s.household_id = sl.household_id
WHERE sl.household_id = current_setting('app.household_id', true)::uuid
  AND sl.logged_date  = CURRENT_DATE::text
  AND s.archived_at   IS NULL
ORDER BY sl.created_at DESC
LIMIT 100

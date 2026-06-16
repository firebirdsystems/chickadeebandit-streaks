SELECT
  sl.id,
  sl.streak_id,
  sl.logged_by,
  sl.logged_date,
  s.title  AS streak_title,
  s.emoji  AS streak_emoji
FROM app_streaks__streak_logs sl
JOIN app_streaks__streaks s
  ON s.id           = sl.streak_id
WHERE sl.logged_date  = CURRENT_DATE
  AND s.archived_at   IS NULL
ORDER BY sl.created_at DESC
LIMIT 100

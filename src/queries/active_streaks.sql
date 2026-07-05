SELECT
  s.id,
  s.owner_id,
  s.title,
  s.emoji,
  s.visibility,
  s.is_group,
  s.created_at,
  COUNT(sl.id)   AS total_logs,
  MAX(sl.logged_date) AS last_logged_date
FROM app_streaks__streaks s
LEFT JOIN app_streaks__streak_logs sl
  ON sl.streak_id    = s.id
WHERE s.archived_at  IS NULL
  AND s.visibility   IN ('adults', 'everyone')
GROUP BY s.id, s.owner_id, s.title, s.emoji, s.visibility, s.is_group, s.created_at
ORDER BY (last_logged_date IS NULL), last_logged_date DESC, s.title
LIMIT 100

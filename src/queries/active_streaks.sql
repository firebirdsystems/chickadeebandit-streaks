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
FROM streaks s
LEFT JOIN streak_logs sl
  ON sl.streak_id    = s.id
  AND sl.household_id = s.household_id
WHERE s.household_id = current_setting('app.household_id', true)::uuid
  AND s.archived_at  IS NULL
  AND s.visibility   IN ('adults', 'everyone')
GROUP BY s.id, s.owner_id, s.title, s.emoji, s.visibility, s.is_group, s.created_at
ORDER BY last_logged_date DESC NULLS LAST, s.title
LIMIT 100

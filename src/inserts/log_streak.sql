INSERT INTO app_streaks__streak_logs (
  id,
  streak_id,
  logged_by,
  logged_date,
  created_at
) VALUES (
  lower(hex(randomblob(16))),
  $1,
  'ai',
  COALESCE($2, CURRENT_DATE),
  datetime('now')
)
ON CONFLICT (streak_id, logged_date) DO NOTHING

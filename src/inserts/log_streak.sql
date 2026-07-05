INSERT INTO app_streaks__streak_logs (
  id,
  streak_id,
  logged_date,
  logged_by,
  created_at
) VALUES (
  lower(hex(randomblob(16))),
  $1,
  COALESCE($2, CURRENT_DATE),
  $3,
  datetime('now')
)
ON CONFLICT (streak_id, logged_date) DO NOTHING

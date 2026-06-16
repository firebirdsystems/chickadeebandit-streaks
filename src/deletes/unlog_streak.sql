DELETE FROM app_streaks__streak_logs
WHERE streak_id    = $1
  AND logged_date  = COALESCE($2, CURRENT_DATE)

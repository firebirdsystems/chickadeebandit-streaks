DELETE FROM streak_logs
WHERE streak_id    = $1
  AND household_id = current_setting('app.household_id', true)::uuid
  AND logged_date  = COALESCE($2, CURRENT_DATE::text)

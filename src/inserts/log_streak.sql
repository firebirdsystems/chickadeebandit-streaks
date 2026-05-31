INSERT INTO streak_logs (
  id,
  household_id,
  streak_id,
  logged_by,
  logged_date,
  created_at
) VALUES (
  gen_random_uuid()::text,
  current_setting('app.household_id', true)::uuid,
  $1,
  'ai',
  COALESCE($2, CURRENT_DATE::text),
  NOW()::text
)
ON CONFLICT (household_id, streak_id, logged_date) DO NOTHING

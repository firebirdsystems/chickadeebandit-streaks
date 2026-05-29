-- Enforce streak visibility controls at the DB layer so children cannot see
-- 'adults' or 'private' streaks by crafting direct SQL queries.
--
-- Children see: their own streaks (any visibility) OR streaks marked 'everyone'.
-- Adults see: all streaks (unrestricted).
-- streak_logs: children see only their own log entries.

DROP POLICY IF EXISTS member_access ON streaks;
CREATE POLICY member_access ON streaks
  AS RESTRICTIVE FOR ALL TO hub_app_executor
  USING (
    current_setting('app.member_id', true) = ''
    OR current_setting('app.member_role', true) != 'child'
    OR owner_id = current_setting('app.member_id', true)
    OR visibility = 'everyone'
  );

DROP POLICY IF EXISTS member_access ON streak_logs;
CREATE POLICY member_access ON streak_logs
  AS RESTRICTIVE FOR ALL TO hub_app_executor
  USING (
    current_setting('app.member_id', true) = ''
    OR current_setting('app.member_role', true) != 'child'
    OR logged_by = current_setting('app.member_id', true)
  );

-- Visibility filtering is enforced in application queries using hub-injected
-- session variables (app.member_id, app.member_role). CREATE POLICY is managed
-- by the hub and is not available to app migrations.
-- This index improves performance for the visibility-filtered streak query.
CREATE INDEX IF NOT EXISTS streaks_visibility_idx
  ON streaks (household_id, owner_id, visibility);

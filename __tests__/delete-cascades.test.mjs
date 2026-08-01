/**
 * Streaks previously had no delete at all — the 🗑 was an archive, and an
 * archived streak (plus its logs, until the 365-day expiry) was invisible but
 * kept forever. A real delete couldn't be written as client statements:
 * streak_logs is inherit_visibility with a writer column, so on a group streak
 * another member's logs were unreachable by app SQL — the owner included —
 * once the parent row was gone. manifest delete_cascades removes them inside
 * the parent delete's transactional batch; only the owner can issue that
 * delete (write_owner_only), which is the same authority that gates the
 * cascade.
 */
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { describe, it, expect } from "vitest";

const __dirname = dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(readFileSync(join(__dirname, "../manifest.json"), "utf-8"));
const schema = readFileSync(join(__dirname, "../migrations/001_init.sql"), "utf-8");
const client = readFileSync(join(__dirname, "../src/index.html"), "utf-8");

describe("delete_cascades", () => {
  it("declares the streak's logs", () => {
    expect(manifest.delete_cascades).toEqual({
      streaks: [{ table: "streak_logs", foreign_key: "streak_id" }],
    });
  });

  it("the declared table and foreign key exist in the migrations", () => {
    expect(schema).toMatch(/CREATE TABLE IF NOT EXISTS app_streaks__streak_logs\s*\(/);
    expect(schema).toMatch(/\bstreak_id\b/);
  });

  it("covers the child the row policy puts out of reach", () => {
    expect(manifest.row_policies.streak_logs.kind).toBe("inherit_visibility");
    expect(manifest.row_policies.streak_logs.writer_column).toBe("logged_by");
    expect(manifest.row_policies.streaks.write_owner_only).toBe(true);
  });

  it("the client deletes the parent as a single statement and never cascades the logs itself", () => {
    expect(client).toMatch(/DELETE FROM app_streaks__streaks WHERE id = \?/);
    // The single-day unlog (streak_id + logged_date + logged_by) is legitimate
    // and stays; a whole-streak log wipe must not exist client-side.
    const logDeletes = client.match(/DELETE FROM app_streaks__streak_logs[^`"]*/g) ?? [];
    for (const stmt of logDeletes) {
      expect(stmt).toMatch(/logged_date/);
      expect(stmt).toMatch(/logged_by/);
    }
  });

  it("offers both archive and delete, separately confirmed", () => {
    expect(client).toMatch(/window\.archiveStreak/);
    expect(client).toMatch(/window\.deleteStreak/);
    expect(client).toMatch(/This can't be undone\./);
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  todayDate,
  yesterdayDate,
  lastNDays,
  computeStreaks,
  loggedToday,
  milestoneReached,
  MILESTONES,
} from "../src/logic.js";

// Helper: offset today by N days (negative = past)
function dateOffset(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

describe("lastNDays", () => {
  it("returns 7 entries by default", () => {
    expect(lastNDays()).toHaveLength(7);
  });

  it("returns N entries when N is specified", () => {
    expect(lastNDays(3)).toHaveLength(3);
  });

  it("last entry is today", () => {
    const days = lastNDays();
    expect(days[days.length - 1]).toBe(todayDate());
  });

  it("first entry is 6 days ago", () => {
    const days = lastNDays();
    expect(days[0]).toBe(dateOffset(-6));
  });

  it("entries are in ascending order", () => {
    const days = lastNDays(7);
    for (let i = 1; i < days.length; i++) {
      expect(days[i] > days[i - 1]).toBe(true);
    }
  });

  it("all entries match YYYY-MM-DD format", () => {
    for (const d of lastNDays(7)) {
      expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe("todayDate / yesterdayDate", () => {
  it("todayDate matches new Date() local date", () => {
    const d = new Date();
    const expected = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    expect(todayDate()).toBe(expected);
  });

  it("yesterdayDate is one day before todayDate", () => {
    const t = new Date(todayDate() + "T00:00:00");
    t.setDate(t.getDate() - 1);
    const expected = `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`;
    expect(yesterdayDate()).toBe(expected);
  });
});

describe("computeStreaks — empty / no logs", () => {
  it("returns zeros for empty array", () => {
    expect(computeStreaks([])).toEqual({ current: 0, best: 0, loggedToday: false });
  });

  it("returns zeros for null", () => {
    expect(computeStreaks(null)).toEqual({ current: 0, best: 0, loggedToday: false });
  });
});

describe("computeStreaks — current streak", () => {
  it("streak of 1 when only today is logged", () => {
    const result = computeStreaks([dateOffset(0)]);
    expect(result.current).toBe(1);
    expect(result.loggedToday).toBe(true);
  });

  it("streak continues from yesterday (not broken yet today)", () => {
    const dates = [dateOffset(-2), dateOffset(-1)];
    const result = computeStreaks(dates);
    expect(result.current).toBe(2);
    expect(result.loggedToday).toBe(false);
  });

  it("streak of 0 when last log was 2+ days ago", () => {
    const dates = [dateOffset(-5), dateOffset(-4), dateOffset(-3)];
    const result = computeStreaks(dates);
    expect(result.current).toBe(0);
  });

  it("7-day streak ending today", () => {
    const dates = Array.from({ length: 7 }, (_, i) => dateOffset(-(6 - i)));
    const result = computeStreaks(dates);
    expect(result.current).toBe(7);
    expect(result.loggedToday).toBe(true);
  });

  it("streak resets after a gap", () => {
    const dates = [
      dateOffset(-10), dateOffset(-9), dateOffset(-8),
      // gap at -7
      dateOffset(-6), dateOffset(-5), dateOffset(-4), dateOffset(-3), dateOffset(-2), dateOffset(-1),
    ];
    const result = computeStreaks(dates);
    expect(result.current).toBe(6); // 6-day run ending yesterday
    expect(result.best).toBe(6);
  });
});

describe("computeStreaks — best streak", () => {
  it("best equals current when only one run", () => {
    const dates = [dateOffset(-2), dateOffset(-1), dateOffset(0)];
    const result = computeStreaks(dates);
    expect(result.best).toBe(3);
    expect(result.current).toBe(3);
  });

  it("best reflects an older longer run", () => {
    const dates = [
      // old 5-day run
      "2024-01-01", "2024-01-02", "2024-01-03", "2024-01-04", "2024-01-05",
      // recent 2-day run ending yesterday
      dateOffset(-1), dateOffset(0),
    ];
    const result = computeStreaks(dates);
    expect(result.best).toBe(5);
    expect(result.current).toBe(2);
  });

  it("deduplicates dates before computing", () => {
    const dates = [dateOffset(-1), dateOffset(-1), dateOffset(0), dateOffset(0)];
    const result = computeStreaks(dates);
    expect(result.current).toBe(2);
    expect(result.best).toBe(2);
  });
});

describe("loggedToday", () => {
  it("returns true when today is in the list", () => {
    expect(loggedToday([dateOffset(-1), dateOffset(0)])).toBe(true);
  });

  it("returns false when today is not in the list", () => {
    expect(loggedToday([dateOffset(-2), dateOffset(-1)])).toBe(false);
  });

  it("returns false for empty array", () => {
    expect(loggedToday([])).toBe(false);
  });
});

describe("milestoneReached", () => {
  it("recognises all defined milestones", () => {
    for (const m of MILESTONES) {
      expect(milestoneReached(m)).toBe(true);
    }
  });

  it("returns false for non-milestone values", () => {
    expect(milestoneReached(1)).toBe(false);
    expect(milestoneReached(5)).toBe(false);
    expect(milestoneReached(50)).toBe(false);
  });
});

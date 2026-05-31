/**
 * Returns today's date as YYYY-MM-DD in local time.
 */
export function todayDate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Returns the last N days (including today) as YYYY-MM-DD strings,
 * oldest first. Defaults to 7.
 */
export function lastNDays(n = 7) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    days.push(`${y}-${m}-${day}`);
  }
  return days;
}

/**
 * Returns yesterday's date as YYYY-MM-DD in local time.
 */
export function yesterdayDate() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Given an array of YYYY-MM-DD log dates, returns:
 *   { current, best, loggedToday }
 *
 * current: consecutive days ending today or yesterday (streak is alive if last log was yesterday)
 * best: longest consecutive run ever recorded
 * loggedToday: whether today's date appears in logDates
 */
export function computeStreaks(logDates) {
  if (!logDates || logDates.length === 0) {
    return { current: 0, best: 0, loggedToday: false };
  }

  const today = todayDate();
  const yesterday = yesterdayDate();

  // Deduplicate and sort ascending
  const unique = [...new Set(logDates)].sort();
  const loggedToday = unique.includes(today);

  // Walk sorted dates to find all consecutive runs
  let best = 1;
  let runLen = 1;
  const runs = []; // each { end, length }

  for (let i = 1; i < unique.length; i++) {
    const prev = new Date(unique[i - 1] + "T00:00:00");
    const curr = new Date(unique[i] + "T00:00:00");
    const diffDays = Math.round((curr - prev) / 86400000);
    if (diffDays === 1) {
      runLen++;
    } else {
      runs.push({ end: unique[i - 1], length: runLen });
      if (runLen > best) best = runLen;
      runLen = 1;
    }
  }
  runs.push({ end: unique[unique.length - 1], length: runLen });
  if (runLen > best) best = runLen;

  // Current streak: the run whose end is today or yesterday
  const lastRun = runs[runs.length - 1];
  let current = 0;
  if (lastRun.end === today || lastRun.end === yesterday) {
    current = lastRun.length;
  }

  return { current, best, loggedToday };
}

/**
 * Returns true if today's date appears in logDates.
 */
export function loggedToday(logDates) {
  return computeStreaks(logDates).loggedToday;
}

/**
 * Returns milestone thresholds crossed by going from (days-1) to days.
 * Used to decide whether to publish a streak.milestone event.
 */
export const MILESTONES = [3, 7, 14, 30, 60, 100, 200, 365];

export function milestoneReached(days) {
  return MILESTONES.includes(days);
}

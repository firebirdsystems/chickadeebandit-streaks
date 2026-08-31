/**
 * Today on the DEVICE's calendar. This is the fallback, not the answer: the
 * browser passes the household's day (hub-sdk `hubToday()`) into everything
 * below, because `logged_date` is STORED — a streak logged from another
 * timezone must land on the day the household is having, or the kitchen
 * tablet's grid will never count it. This default exists so these functions
 * stay pure and runnable under Node in tests.
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
export function lastNDays(n = 7, today = todayDate()) {
  const days = [];
  // Stepped in UTC off the anchor date, so the walk is calendar arithmetic and
  // never re-reads the device clock partway down the list.
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

/**
 * Returns yesterday's date as YYYY-MM-DD in local time.
 */
export function yesterdayDate(today = todayDate()) {
  const d = new Date(today + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Given an array of YYYY-MM-DD log dates, returns:
 *   { current, best, loggedToday }
 *
 * current: consecutive days ending today or yesterday (streak is alive if last log was yesterday)
 * best: longest consecutive run ever recorded
 * loggedToday: whether today's date appears in logDates
 */
export function computeStreaks(logDates, today = todayDate()) {
  if (!logDates || logDates.length === 0) {
    return { current: 0, best: 0, loggedToday: false };
  }

  const yesterday = yesterdayDate(today);

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
export function loggedToday(logDates, today = todayDate()) {
  return computeStreaks(logDates, today).loggedToday;
}

/**
 * Returns milestone thresholds crossed by going from (days-1) to days.
 * Used to decide whether to publish a streak.milestone event.
 */
export const MILESTONES = [3, 7, 14, 30, 60, 100, 200, 365];

export function milestoneReached(days) {
  return MILESTONES.includes(days);
}

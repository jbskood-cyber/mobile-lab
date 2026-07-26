export type CalendarTapState = { day: number; at: number } | null;

export type CalendarTapDecision = {
  action: 'select' | 'open';
  next: CalendarTapState;
};

export const CALENDAR_DOUBLE_TAP_MS = 420;

export function resolveCalendarTap(
  previous: CalendarTapState,
  day: number,
  now: number,
  thresholdMs = CALENDAR_DOUBLE_TAP_MS,
): CalendarTapDecision {
  const sameDay = previous?.day === day;
  const elapsed = previous ? now - previous.at : Number.POSITIVE_INFINITY;

  if (sameDay && elapsed >= 0 && elapsed <= thresholdMs) {
    return { action: 'open', next: null };
  }

  return { action: 'select', next: { day, at: now } };
}

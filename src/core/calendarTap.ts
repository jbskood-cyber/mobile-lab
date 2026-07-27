export type CalendarTapState = { day: number; at: number } | null;

export const CALENDAR_DOUBLE_TAP_MS = 450;

export function registerCalendarTap(
  previous: CalendarTapState,
  day: number,
  at: number,
  windowMs = CALENDAR_DOUBLE_TAP_MS,
): { next: CalendarTapState; openDay: boolean } {
  const isDoubleTap = previous !== null
    && previous.day === day
    && at >= previous.at
    && at - previous.at <= windowMs;

  return isDoubleTap
    ? { next: null, openDay: true }
    : { next: { day, at }, openDay: false };
}

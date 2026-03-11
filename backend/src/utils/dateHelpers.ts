import { format, subDays, startOfDay, parseISO, differenceInCalendarDays, eachDayOfInterval } from 'date-fns';

export function toDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function subDaysFromNow(days: number): Date {
  return subDays(new Date(), days);
}

export function startOfToday(): Date {
  return startOfDay(new Date());
}

export function fillDateGaps<T extends { date: string }>(
  data: T[],
  start: Date,
  end: Date,
  defaultValue: Omit<T, 'date'>
): T[] {
  const days = eachDayOfInterval({ start, end });
  const map = new Map(data.map(d => [d.date, d]));
  return days.map(day => {
    const key = toDateKey(day);
    return map.get(key) ?? ({ date: key, ...defaultValue } as T);
  });
}

export function daysBetween(a: string, b: string): number {
  return differenceInCalendarDays(parseISO(a), parseISO(b));
}

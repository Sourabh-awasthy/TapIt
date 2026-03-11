'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { parseISO, getDay, format, startOfWeek, addDays, subWeeks, eachDayOfInterval } from 'date-fns';
import type { HeatmapPoint } from '@/types/models';

interface Props {
  data: HeatmapPoint[];
  isLoading?: boolean;
  weeks?: number;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

function countToIntensity(count: number) {
  if (count === 0) return 'bg-slate-100';
  if (count === 1) return 'bg-indigo-200';
  if (count <= 3) return 'bg-indigo-400';
  return 'bg-indigo-600';
}

export default function AttendanceHeatmap({ data, isLoading, weeks = 10 }: Props) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
        <CardContent><Skeleton className="h-28 w-full rounded-lg" /></CardContent>
      </Card>
    );
  }

  const dataMap = new Map(data.map(d => [d.dayKey, d]));
  const today = new Date();
  const gridStart = startOfWeek(subWeeks(today, weeks - 1), { weekStartsOn: 1 });
  const all = eachDayOfInterval({ start: gridStart, end: today });

  // Build weeks array: array of arrays (each inner = Mon-Fri)
  const weekBuckets: Date[][] = [];
  let current: Date[] = [];
  for (const d of all) {
    const dow = getDay(d); // 0=Sun, 1=Mon... 5=Fri, 6=Sat
    if (dow === 0 || dow === 6) continue; // skip weekends
    if (dow === 1 && current.length > 0) {
      weekBuckets.push(current);
      current = [];
    }
    current.push(d);
  }
  if (current.length > 0) weekBuckets.push(current);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Attendance Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {/* Day labels */}
          <div className="flex flex-col gap-1.5 justify-around pt-6 pr-2">
            {DAY_LABELS.map(d => (
              <span key={d} className="text-xs text-slate-400 w-7">{d}</span>
            ))}
          </div>

          {/* Week columns */}
          {weekBuckets.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1.5">
              <span className="text-xs text-slate-400 text-center mb-0.5 h-4">
                {wi % 2 === 0 ? format(week[0], 'MMM d') : ''}
              </span>
              {/* Pad if week is short */}
              {Array.from({ length: 5 }).map((_, di) => {
                const day = week[di];
                if (!day) return <div key={di} className="w-4 h-4 rounded-sm" />;
                const key = format(day, 'yyyy-MM-dd');
                const point = dataMap.get(key);
                const count = point?.count ?? 0;
                const hasCls = point?.hasClassroom ?? false;
                return (
                  <div
                    key={di}
                    title={`${format(day, 'EEE MMM d')}: ${count} tap${count !== 1 ? 's' : ''}`}
                    className={cn(
                      'w-4 h-4 rounded-sm transition-colors cursor-default',
                      countToIntensity(count),
                      hasCls && 'ring-1 ring-indigo-500 ring-offset-1'
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-slate-100" /> None
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-indigo-200" /> Low
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-indigo-400" /> Medium
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-indigo-600" /> High
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            <div className="w-3 h-3 rounded-sm bg-indigo-200 ring-1 ring-indigo-500 ring-offset-1" /> Class tap
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

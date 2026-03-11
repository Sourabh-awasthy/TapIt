'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Flame, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LeaderboardEntry } from '@/types/models';

interface Props {
  entries: LeaderboardEntry[];
  currentStudentRef?: string;
  isLoading?: boolean;
  title?: string;
}

const MEDAL_COLORS = ['text-yellow-500', 'text-slate-400', 'text-amber-600'];

export default function LeaderboardTable({ entries, currentStudentRef, isLoading, title = 'Leaderboard' }: Props) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
        <CardContent>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="flex-1 h-4" />
              <Skeleton className="w-16 h-4" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {entries.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">No data yet</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {entries.map((entry) => {
              const isCurrent = entry.studentRef === currentStudentRef;
              return (
                <div
                  key={entry.studentRef}
                  className={cn(
                    'flex items-center gap-3 px-6 py-3 transition-colors',
                    isCurrent ? 'bg-brand-50 ring-1 ring-inset ring-brand-200' : 'hover:bg-slate-50'
                  )}
                >
                  {/* Rank */}
                  <div className="w-6 flex items-center justify-center flex-shrink-0">
                    {entry.rank <= 3 ? (
                      <Medal className={cn('w-5 h-5', MEDAL_COLORS[entry.rank - 1])} />
                    ) : (
                      <span className="text-sm font-semibold text-slate-400">{entry.rank}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-indigo-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {entry.firstName[0]}{entry.lastName[0]}
                  </div>

                  {/* Name + group */}
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-medium truncate', isCurrent ? 'text-brand-700' : 'text-slate-800')}>
                      {entry.firstName} {entry.lastName}
                      {isCurrent && <span className="ml-1.5 text-xs text-brand-500">(you)</span>}
                    </p>
                    <p className="text-xs text-slate-400">{entry.classGroup}</p>
                  </div>

                  {/* Score */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-slate-800">{entry.engagementScore}</p>
                    <div className="flex items-center justify-end gap-1 text-xs text-orange-500">
                      <Flame className="w-3 h-3" />
                      {entry.attendanceStreak}d
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

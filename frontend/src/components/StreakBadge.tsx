import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakBadgeProps {
  streak: number;
  longestStreak?: number;
  isLoading?: boolean;
  className?: string;
}

export default function StreakBadge({ streak, longestStreak, isLoading, className }: StreakBadgeProps) {
  if (isLoading) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardContent className="p-6">
          <Skeleton className="h-4 w-24 mb-3" />
          <Skeleton className="h-16 w-32" />
        </CardContent>
      </Card>
    );
  }

  const streakLevel = streak >= 30 ? 'legendary' : streak >= 14 ? 'hot' : streak >= 7 ? 'warm' : 'cool';
  const flameColor = {
    legendary: 'text-purple-500',
    hot: 'text-red-500',
    warm: 'text-orange-500',
    cool: 'text-slate-400',
  }[streakLevel];

  const bgColor = {
    legendary: 'from-purple-50 to-pink-50',
    hot: 'from-red-50 to-orange-50',
    warm: 'from-orange-50 to-amber-50',
    cool: 'from-slate-50 to-slate-100',
  }[streakLevel];

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className={cn('p-6 bg-gradient-to-br', bgColor)}>
        <p className="text-sm font-medium text-slate-500 mb-3">Attendance Streak</p>
        <div className="flex items-end gap-3">
          <Flame className={cn('w-12 h-12', flameColor)} strokeWidth={1.5} />
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-slate-900">{streak}</span>
              <span className="text-lg font-semibold text-slate-500">days</span>
            </div>
            {longestStreak !== undefined && longestStreak > 0 && (
              <p className="text-xs text-slate-500 mt-1">Best: {longestStreak} days</p>
            )}
          </div>
        </div>
        {streak === 0 && (
          <p className="text-xs text-slate-500 mt-3 italic">No active streak — tap in today to start one!</p>
        )}
      </CardContent>
    </Card>
  );
}

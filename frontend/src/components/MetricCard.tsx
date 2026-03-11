import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
  accentColor?: string;
}

export default function MetricCard({
  title, value, unit, trend, trendLabel, icon, isLoading, className, accentColor = 'bg-brand-600',
}: MetricCardProps) {
  if (isLoading) {
    return (
      <Card className={cn('p-6', className)}>
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-10 w-32 mb-2" />
        <Skeleton className="h-3 w-20" />
      </Card>
    );
  }

  const TrendIcon = trend === undefined || trend === 0 ? Minus : trend > 0 ? TrendingUp : TrendingDown;
  const trendColor = trend === undefined || trend === 0 ? 'text-slate-400' : trend > 0 ? 'text-emerald-600' : 'text-red-500';

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-slate-900">{value}</span>
              {unit && <span className="text-sm text-slate-500">{unit}</span>}
            </div>
            {(trend !== undefined && trendLabel) && (
              <div className={cn('flex items-center gap-1 mt-2 text-xs font-medium', trendColor)}>
                <TrendIcon className="w-3.5 h-3.5" />
                {Math.abs(trend)}% {trendLabel}
              </div>
            )}
          </div>
          {icon && (
            <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-white', accentColor)}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

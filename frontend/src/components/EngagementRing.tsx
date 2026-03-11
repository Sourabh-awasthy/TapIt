'use client';

import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface EngagementRingProps {
  score: number;
  isLoading?: boolean;
  className?: string;
}

function scoreToColor(s: number) {
  if (s >= 70) return '#10b981'; // emerald
  if (s >= 40) return '#f59e0b'; // amber
  return '#ef4444'; // red
}

function scoreLabel(s: number) {
  if (s >= 80) return 'Excellent';
  if (s >= 60) return 'Good';
  if (s >= 40) return 'Fair';
  return 'Needs work';
}

export default function EngagementRing({ score, isLoading, className }: EngagementRingProps) {
  if (isLoading) {
    return (
      <Card className={cn('', className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Engagement Score</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Skeleton className="w-40 h-40 rounded-full" />
        </CardContent>
      </Card>
    );
  }

  const color = scoreToColor(score);
  const data = [{ value: score, fill: color }];

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Engagement Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-44">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              data={data}
              startAngle={90}
              endAngle={-270}
              innerRadius="65%"
              outerRadius="90%"
            >
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar
                dataKey="value"
                angleAxisId={0}
                background={{ fill: '#e2e8f0' }}
                cornerRadius={8}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-black" style={{ color }}>{score}</span>
            <span className="text-xs text-slate-500">/ 100</span>
            <span className="text-xs font-semibold mt-1" style={{ color }}>{scoreLabel(score)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

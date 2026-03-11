'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import type { Tap } from '@/types/models';

const LOCATION_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  classroom: { label: 'Classroom', color: 'text-indigo-600',  bg: 'bg-indigo-100' },
  library:   { label: 'Library',   color: 'text-emerald-600', bg: 'bg-emerald-100' },
  gym:       { label: 'Gym',       color: 'text-amber-600',   bg: 'bg-amber-100' },
  club:      { label: 'Club',      color: 'text-pink-600',    bg: 'bg-pink-100' },
};

interface TapFeedProps {
  taps: Tap[];
  isLoading?: boolean;
}

export default function TapFeed({ taps, isLoading }: TapFeedProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-24 mb-1.5" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : taps.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {taps.map(tap => {
              const cfg = LOCATION_CONFIG[tap.locationCode] ?? LOCATION_CONFIG.classroom;
              return (
                <div key={tap._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                    <MapPin className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-700">{cfg.label}</span>
                      {tap.isLate && <Badge variant="warning" className="text-xs py-0">Late</Badge>}
                    </div>
                    <p className="text-xs text-slate-400">
                      {formatDistanceToNow(parseISO(tap.tappedAt), { addSuffix: true })}
                    </p>
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

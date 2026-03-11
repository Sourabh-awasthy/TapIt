'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { LocationBreakdown } from '@/types/models';

interface Props {
  breakdown: LocationBreakdown;
  isLoading?: boolean;
}

const LOCATION_CONFIG = [
  { key: 'classroom', label: 'Classroom', color: '#6366f1' },
  { key: 'library',   label: 'Library',   color: '#10b981' },
  { key: 'gym',       label: 'Gym',        color: '#f59e0b' },
  { key: 'club',      label: 'Club',       color: '#ec4899' },
];

export default function LocationBreakdownBarChart({ breakdown, isLoading }: Props) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
        <CardContent><Skeleton className="h-48 w-full rounded-lg" /></CardContent>
      </Card>
    );
  }

  const data = LOCATION_CONFIG.map(({ key, label, color }) => ({
    label,
    count: breakdown[key as keyof LocationBreakdown],
    color,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Location Breakdown</CardTitle>
        <CardDescription>Tap counts per location (last 30 days)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
              cursor={{ fill: '#f8fafc' }}
            />
            <Bar dataKey="count" name="Taps" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

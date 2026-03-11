'use client';

import { useState } from 'react';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useStudents } from '@/hooks/useStudents';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Trophy, Medal, Flame, TrendingUp, Users, Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts';

const MEDAL_COLORS = ['text-yellow-500', 'text-slate-400', 'text-amber-600'];
const MEDAL_BG    = ['bg-yellow-50 border-yellow-200', 'bg-slate-50 border-slate-200', 'bg-amber-50 border-amber-200'];

function scoreColor(n: number) {
  if (n >= 70) return '#10b981';
  if (n >= 40) return '#f59e0b';
  return '#ef4444';
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [classGroup, setClassGroup] = useState<string>('all');
  const [limitVal, setLimitVal] = useState(20);

  const { data: allStudents } = useStudents({ limit: 100 });
  const classGroups = [...new Set((allStudents?.students ?? []).map(s => s.classGroup))].sort();

  const { data: entries, isLoading } = useLeaderboard(
    classGroup === 'all' ? undefined : classGroup,
    limitVal
  );

  const top3    = entries?.slice(0, 3) ?? [];
  const rest    = entries?.slice(3)    ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="w-7 h-7 text-yellow-500" />
            Leaderboard
          </h1>
          <p className="text-slate-500 mt-1">Ranked by engagement score (last 30 days)</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={classGroup} onValueChange={setClassGroup}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All groups" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All groups</SelectItem>
              {classGroups.map(g => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={String(limitVal)} onValueChange={v => setLimitVal(Number(v))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">Top 10</SelectItem>
              <SelectItem value="20">Top 20</SelectItem>
              <SelectItem value="50">Top 50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Podium — top 3 */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      ) : top3.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Reorder for podium: 2nd • 1st • 3rd */}
          {[top3[1], top3[0], top3[2]].map((entry, podiumIdx) => {
            if (!entry) return <div key={podiumIdx} />;
            const rank = podiumIdx === 1 ? 1 : podiumIdx === 0 ? 2 : 3;
            const realEntry = top3[rank - 1];
            return (
              <Card
                key={realEntry.studentRef}
                className={cn(
                  'border-2 text-center relative overflow-hidden',
                  MEDAL_BG[rank - 1],
                  rank === 1 && 'sm:-mt-4 shadow-lg'
                )}
              >
                <CardContent className="pt-6 pb-4">
                  {/* Crown / medal */}
                  <div className="flex justify-center mb-3">
                    <Medal className={cn('w-8 h-8', MEDAL_COLORS[rank - 1])} />
                  </div>

                  {/* Avatar */}
                  <div className={cn(
                    'w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-black mx-auto mb-3',
                    'bg-gradient-to-br from-brand-600 to-indigo-400'
                  )}>
                    {realEntry.firstName[0]}{realEntry.lastName[0]}
                  </div>

                  <p className="font-bold text-slate-900 text-base">
                    {realEntry.firstName} {realEntry.lastName}
                  </p>
                  <p className="text-xs text-slate-500 mb-3">{realEntry.classGroup}</p>

                  {/* Score ring area */}
                  <div className="text-3xl font-black" style={{ color: scoreColor(realEntry.engagementScore) }}>
                    {realEntry.engagementScore}
                  </div>
                  <p className="text-xs text-slate-500 mb-2">engagement</p>

                  <div className="flex items-center justify-center gap-1 text-orange-500 text-sm font-semibold">
                    <Flame className="w-4 h-4" />
                    {realEntry.attendanceStreak}d streak
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Chart — score distribution */}
      {!isLoading && entries && entries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Score Distribution</CardTitle>
            <CardDescription>Engagement scores across all ranked students</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={entries.slice(0, 20).map(e => ({
                  name: `${e.firstName[0]}. ${e.lastName}`,
                  score: e.engagementScore,
                  color: scoreColor(e.engagementScore),
                }))}
                margin={{ top: 4, right: 8, left: -16, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                  formatter={(val: number) => [`${val}`, 'Engagement']}
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {entries.slice(0, 20).map((entry, i) => (
                    <Cell key={i} fill={scoreColor(entry.engagementScore)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Full ranked table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4" />
            Full Rankings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-3 border-b border-slate-100">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="flex-1 h-4" />
                <Skeleton className="w-20 h-4" />
              </div>
            ))
          ) : !entries || entries.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-10">No data available yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {/* Header row */}
              <div className="grid grid-cols-[2rem_1fr_6rem_5rem_5rem_5rem] gap-3 px-6 py-2 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <span>#</span>
                <span>Student</span>
                <span>Group</span>
                <span className="text-right">Score</span>
                <span className="text-right">Streak</span>
                <span className="text-right">Grade</span>
              </div>

              {entries.map(entry => {
                const isCurrent = entry.studentRef === user?.studentRef;
                const grade =
                  entry.engagementScore >= 80 ? 'A' :
                  entry.engagementScore >= 65 ? 'B' :
                  entry.engagementScore >= 50 ? 'C' :
                  entry.engagementScore >= 35 ? 'D' : 'F';

                const gradeColor =
                  grade === 'A' ? 'text-emerald-600 bg-emerald-50' :
                  grade === 'B' ? 'text-blue-600 bg-blue-50' :
                  grade === 'C' ? 'text-amber-600 bg-amber-50' :
                  grade === 'D' ? 'text-orange-600 bg-orange-50' :
                  'text-red-600 bg-red-50';

                return (
                  <div
                    key={entry.studentRef}
                    className={cn(
                      'grid grid-cols-[2rem_1fr_6rem_5rem_5rem_5rem] gap-3 items-center px-6 py-3 transition-colors',
                      isCurrent ? 'bg-brand-50 ring-1 ring-inset ring-brand-200' : 'hover:bg-slate-50'
                    )}
                  >
                    {/* Rank */}
                    <div className="flex items-center justify-center">
                      {entry.rank <= 3 ? (
                        <Medal className={cn('w-4 h-4', MEDAL_COLORS[entry.rank - 1])} />
                      ) : (
                        <span className="text-sm font-semibold text-slate-400">{entry.rank}</span>
                      )}
                    </div>

                    {/* Name */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-indigo-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {entry.firstName[0]}{entry.lastName[0]}
                      </div>
                      <div className="min-w-0">
                        <p className={cn('text-sm font-medium truncate', isCurrent ? 'text-brand-700' : 'text-slate-800')}>
                          {entry.firstName} {entry.lastName}
                          {isCurrent && <span className="ml-1 text-xs text-brand-400">(you)</span>}
                        </p>
                        <p className="text-xs text-slate-400 font-mono">{entry.studentId}</p>
                      </div>
                    </div>

                    {/* Group */}
                    <div>
                      <Badge variant="secondary" className="text-xs">{entry.classGroup}</Badge>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <div
                          className="h-1.5 w-16 rounded-full bg-slate-200 overflow-hidden"
                        >
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${entry.engagementScore}%`,
                              backgroundColor: scoreColor(entry.engagementScore),
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold w-8 text-right" style={{ color: scoreColor(entry.engagementScore) }}>
                          {entry.engagementScore}
                        </span>
                      </div>
                    </div>

                    {/* Streak */}
                    <div className="text-right">
                      <span className="flex items-center justify-end gap-1 text-orange-500 text-sm font-semibold">
                        <Flame className="w-3.5 h-3.5" />
                        {entry.attendanceStreak}d
                      </span>
                    </div>

                    {/* Grade */}
                    <div className="text-right">
                      <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', gradeColor)}>
                        {grade}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats summary */}
      {!isLoading && entries && entries.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: 'Top Score',
              value: entries[0]?.engagementScore ?? 0,
              icon: <Star className="w-5 h-5" />,
              color: 'bg-yellow-500',
            },
            {
              label: 'Avg Score',
              value: Math.round(entries.reduce((s, e) => s + e.engagementScore, 0) / entries.length),
              icon: <TrendingUp className="w-5 h-5" />,
              color: 'bg-brand-600',
            },
            {
              label: 'Top Streak',
              value: `${Math.max(...entries.map(e => e.attendanceStreak))}d`,
              icon: <Flame className="w-5 h-5" />,
              color: 'bg-orange-500',
            },
            {
              label: 'Students',
              value: entries.length,
              icon: <Users className="w-5 h-5" />,
              color: 'bg-emerald-600',
            },
          ].map(stat => (
            <Card key={stat.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0', stat.color)}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                  <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

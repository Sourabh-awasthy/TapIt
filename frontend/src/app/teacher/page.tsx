'use client';

import { useState } from 'react';
import { useStudents } from '@/hooks/useStudents';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import MetricCard from '@/components/MetricCard';
import LeaderboardTable from '@/components/LeaderboardTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, TrendingUp, Flame, Search } from 'lucide-react';

export default function TeacherPage() {
  const [search, setSearch] = useState('');

  const { data: studentsData, isLoading: studentsLoading } = useStudents({ search, limit: 50 });
  const { data: leaderboard, isLoading: lbLoading } = useLeaderboard(undefined, 10);

  const students = studentsData?.students ?? [];

  const withScores = students.filter(s => s.score);
  const avgEngagement = withScores.length
    ? Math.round(withScores.reduce((sum, s) => sum + (s.score?.engagementScore ?? 0), 0) / withScores.length)
    : 0;
  const avgStreak = withScores.length
    ? Math.round(withScores.reduce((sum, s) => sum + (s.score?.attendanceStreak ?? 0), 0) / withScores.length)
    : 0;

  const bottomPerformers = [...withScores]
    .sort((a, b) => (a.score?.engagementScore ?? 0) - (b.score?.engagementScore ?? 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Class Overview</h1>
        <p className="text-slate-500 mt-1">Monitor your students&apos; performance and engagement</p>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Students"
          value={studentsData?.total ?? 0}
          icon={<Users className="w-6 h-6" />}
          isLoading={studentsLoading}
          accentColor="bg-brand-600"
        />
        <MetricCard
          title="Avg Engagement"
          value={avgEngagement}
          unit="/ 100"
          icon={<TrendingUp className="w-6 h-6" />}
          isLoading={studentsLoading}
          accentColor="bg-emerald-600"
        />
        <MetricCard
          title="Avg Streak"
          value={avgStreak}
          unit="days"
          icon={<Flame className="w-6 h-6" />}
          isLoading={studentsLoading}
          accentColor="bg-amber-500"
        />
      </div>

      {/* Leaderboard + Needs Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LeaderboardTable entries={leaderboard ?? []} isLoading={lbLoading} title="Top Performers" />

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-red-600">Needs Attention</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {studentsLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-6 py-3 border-b border-slate-100">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="flex-1 h-4" />
                  <Skeleton className="w-12 h-4" />
                </div>
              ))
            ) : (
              <div className="divide-y divide-slate-100">
                {bottomPerformers.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">No data yet</p>
                ) : bottomPerformers.map(s => (
                  <div key={s._id} className="flex items-center gap-3 px-6 py-3 hover:bg-slate-50">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-xs font-bold flex-shrink-0">
                      {s.firstName[0]}{s.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{s.firstName} {s.lastName}</p>
                      <p className="text-xs text-slate-400">{s.classGroup}</p>
                    </div>
                    <Badge variant="destructive">
                      {s.score?.engagementScore ?? 0}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Full student table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <CardTitle className="text-base">All Students</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search students..."
              className="pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Student</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">ID</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Group</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Engagement</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Streak</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Punctuality</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentsLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : students.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-slate-500">No students found</td></tr>
                ) : (
                  students.map(s => {
                    const score = s.score;
                    const engColor = !score
                      ? 'text-slate-400'
                      : score.engagementScore >= 70
                      ? 'text-emerald-600'
                      : score.engagementScore >= 40
                      ? 'text-amber-600'
                      : 'text-red-600';
                    return (
                      <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-indigo-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {s.firstName[0]}{s.lastName[0]}
                            </div>
                            <span className="font-medium text-slate-800">{s.firstName} {s.lastName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-mono text-xs">{s.studentId}</td>
                        <td className="px-4 py-3"><Badge variant="secondary">{s.classGroup}</Badge></td>
                        <td className={`px-4 py-3 text-right font-bold ${engColor}`}>
                          {score?.engagementScore ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="flex items-center justify-end gap-1 text-orange-500">
                            <Flame className="w-3.5 h-3.5" />
                            {score?.attendanceStreak ?? 0}d
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600">
                          {score?.punctualityRate != null
                            ? `${Math.round(score.punctualityRate * 100)}%`
                            : '—'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useAuth } from '@/context/AuthContext';
import { useMetrics } from '@/hooks/useMetrics';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import MetricCard from '@/components/MetricCard';
import StreakBadge from '@/components/StreakBadge';
import EngagementRing from '@/components/EngagementRing';
import DailyTapsLineChart from '@/components/DailyTapsLineChart';
import LocationBreakdownBarChart from '@/components/LocationBreakdownBarChart';
import TapFeed from '@/components/TapFeed';
import AttendanceHeatmap from '@/components/AttendanceHeatmap';
import LeaderboardTable from '@/components/LeaderboardTable';
import { Target, Clock } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const studentId = user?.studentRef;

  const { data: metrics, isLoading: metricsLoading } = useMetrics(studentId);
  const { data: leaderboard, isLoading: lbLoading } = useLeaderboard(undefined, 10);

  const scores = metrics?.scores;
  const charts = metrics?.charts;

  const totalTaps30d = scores?.locationBreakdown
    ? Object.values(scores.locationBreakdown).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back{metrics?.student?.firstName ? `, ${metrics.student.firstName}` : ''}
        </h1>
        <p className="text-slate-500 mt-1">
          {metrics?.student?.classGroup && <span className="font-medium text-slate-700">{metrics.student.classGroup}</span>}
          {metrics?.student?.studentId && <span className="text-slate-400"> · {metrics.student.studentId}</span>}
        </p>
      </div>

      {/* Top metrics row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StreakBadge
          streak={scores?.attendanceStreak ?? 0}
          longestStreak={scores?.longestStreak}
          isLoading={metricsLoading}
        />

        <EngagementRing
          score={scores?.engagementScore ?? 0}
          isLoading={metricsLoading}
        />

        <MetricCard
          title="Punctuality Rate"
          value={scores?.punctualityRate != null ? `${Math.round(scores.punctualityRate * 100)}%` : 'N/A'}
          icon={<Clock className="w-6 h-6" />}
          accentColor="bg-emerald-600"
          isLoading={metricsLoading}
        />

        <MetricCard
          title="Total Taps (30d)"
          value={totalTaps30d}
          unit="taps"
          icon={<Target className="w-6 h-6" />}
          accentColor="bg-amber-500"
          isLoading={metricsLoading}
        />
      </div>

      {/* Daily activity chart */}
      <DailyTapsLineChart
        data={charts?.dailyTaps ?? []}
        isLoading={metricsLoading}
      />

      {/* Location breakdown + Tap feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LocationBreakdownBarChart
          breakdown={scores?.locationBreakdown ?? { classroom: 0, library: 0, gym: 0, club: 0 }}
          isLoading={metricsLoading}
        />
        <TapFeed
          taps={charts?.recentTaps ?? []}
          isLoading={metricsLoading}
        />
      </div>

      {/* Heatmap */}
      <AttendanceHeatmap
        data={charts?.weeklyHeatmap ?? []}
        isLoading={metricsLoading}
        weeks={10}
      />

      {/* Leaderboard */}
      <LeaderboardTable
        entries={leaderboard ?? []}
        currentStudentRef={user?.studentRef}
        isLoading={lbLoading}
        title="Class Leaderboard"
      />
    </div>
  );
}

import useSWR from 'swr';
import { apiFetch } from '@/lib/api';
import type { LeaderboardEntry } from '@/types/models';

export function useLeaderboard(classGroup?: string, limit = 10) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (classGroup) params.set('classGroup', classGroup);
  const key = `/api/leaderboard?${params.toString()}`;
  return useSWR<LeaderboardEntry[]>(key, (url: string) => apiFetch<LeaderboardEntry[]>(url));
}

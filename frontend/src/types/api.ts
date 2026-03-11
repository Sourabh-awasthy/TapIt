import type { StudentWithScore, StudentMetrics, LeaderboardEntry, Location } from './models';

export interface PaginatedStudents {
  students: StudentWithScore[];
  total: number;
  page: number;
  pages: number;
}

export type MetricsResponse = StudentMetrics;
export type LeaderboardResponse = LeaderboardEntry[];
export type LocationsResponse = Location[];

export type Role = 'student' | 'teacher' | 'admin';
export type LocationCode = 'classroom' | 'library' | 'gym' | 'club';

export interface User {
  _id: string;
  email: string;
  role: Role;
  studentRef?: string;
}

export interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  studentId: string;
  rfidCardId?: string;
  classGroup: string;
  teacherRef?: string;
  enrolledAt: string;
  isActive: boolean;
}

export interface StudentWithScore extends Student {
  score: StudentScore | null;
}

export interface Tap {
  _id: string;
  locationCode: LocationCode;
  tappedAt: string;
  isLate: boolean;
  dayKey: string;
}

export interface LocationBreakdown {
  classroom: number;
  library: number;
  gym: number;
  club: number;
}

export interface StudentScore {
  engagementScore: number;
  attendanceStreak: number;
  longestStreak: number;
  punctualityRate: number | null;
  locationBreakdown: LocationBreakdown;
  lastTapAt: string | null;
  computedAt: string;
}

export interface DailyTapPoint {
  date: string;
  total: number;
  classroom: number;
  library: number;
  gym: number;
  club: number;
}

export interface HeatmapPoint {
  dayKey: string;
  count: number;
  hasClassroom: boolean;
}

export interface StudentMetrics {
  student: Pick<Student, '_id' | 'firstName' | 'lastName' | 'studentId' | 'classGroup' | 'rfidCardId'>;
  scores: StudentScore | null;
  charts: {
    dailyTaps: DailyTapPoint[];
    weeklyHeatmap: HeatmapPoint[];
    recentTaps: Tap[];
  };
}

export interface LeaderboardEntry {
  rank: number;
  studentRef: string;
  firstName: string;
  lastName: string;
  studentId: string;
  classGroup: string;
  engagementScore: number;
  attendanceStreak: number;
}

export interface LocationSession {
  label: string;
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
}

export interface Location {
  _id: string;
  code: LocationCode;
  label: string;
  weight: number;
  sessions: LocationSession[];
  isActive: boolean;
}

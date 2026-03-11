import useSWR from 'swr';
import { apiFetch } from '@/lib/api';
import type { StudentMetrics } from '@/types/models';

export function useMetrics(studentId: string | undefined) {
  return useSWR<StudentMetrics>(
    studentId ? `/api/students/${studentId}/metrics` : null,
    (url: string) => apiFetch<StudentMetrics>(url),
    { refreshInterval: 30000 }
  );
}

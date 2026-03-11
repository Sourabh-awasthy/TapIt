import useSWR from 'swr';
import { apiFetch } from '@/lib/api';
import type { PaginatedStudents } from '@/types/api';

interface Options { classGroup?: string; search?: string; page?: number; limit?: number; }

export function useStudents(opts: Options = {}) {
  const params = new URLSearchParams();
  if (opts.classGroup) params.set('classGroup', opts.classGroup);
  if (opts.search) params.set('search', opts.search);
  if (opts.page) params.set('page', String(opts.page));
  if (opts.limit) params.set('limit', String(opts.limit));

  const key = `/api/students?${params.toString()}`;
  return useSWR<PaginatedStudents>(key, (url: string) => apiFetch<PaginatedStudents>(url));
}

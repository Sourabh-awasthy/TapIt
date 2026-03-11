import useSWR from 'swr';
import { apiFetch } from '@/lib/api';
import type { Location } from '@/types/models';

export function useLocations() {
  return useSWR<Location[]>('/api/locations', (url: string) => apiFetch<Location[]>(url));
}

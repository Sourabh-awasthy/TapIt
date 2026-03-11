export const LOCATION_DEFAULTS = [
  { code: 'classroom', label: 'Classroom', weight: 0.4, sessions: [{ label: 'Morning', startTime: '09:00', endTime: '12:00', daysOfWeek: [1,2,3,4,5] }, { label: 'Afternoon', startTime: '13:00', endTime: '17:00', daysOfWeek: [1,2,3,4,5] }] },
  { code: 'library',   label: 'Library',   weight: 0.3, sessions: [] },
  { code: 'gym',       label: 'Gym',        weight: 0.2, sessions: [] },
  { code: 'club',      label: 'Club/Society', weight: 0.1, sessions: [] },
] as const;

export const LOCATION_CODES = ['classroom', 'library', 'gym', 'club'] as const;
export type LocationCode = typeof LOCATION_CODES[number];

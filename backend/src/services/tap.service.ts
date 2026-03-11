import { Location } from '../models/Location';

export async function computeIsLate(tappedAt: Date, locationCode: string): Promise<boolean> {
  const location = await Location.findOne({ code: locationCode });
  if (!location || location.sessions.length === 0) return false;

  const dayOfWeek = tappedAt.getDay();
  const timeStr = tappedAt.toTimeString().slice(0, 5); // "HH:MM"

  const activeSession = location.sessions.find(s =>
    s.daysOfWeek.includes(dayOfWeek) && timeStr <= s.endTime
  );

  if (!activeSession) return false;
  return timeStr > activeSession.startTime;
}

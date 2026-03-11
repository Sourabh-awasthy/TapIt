import { Types } from 'mongoose';
import { Tap } from '../models/Tap';
import { Location } from '../models/Location';
import { StudentScore } from '../models/StudentScore';
import { env } from '../config/env';
import { toDateKey, subDaysFromNow } from '../utils/dateHelpers';
import { parseISO } from 'date-fns';

export async function computeEngagementScore(studentId: Types.ObjectId): Promise<number> {
  const windowDays = parseInt(env.ENGAGEMENT_WINDOW_DAYS);
  const MAX = parseInt(env.ENGAGEMENT_MAX_TAPS_PER_LOCATION);
  const windowStart = subDaysFromNow(windowDays);

  const tapCounts = await Tap.aggregate([
    { $match: { studentRef: studentId, tappedAt: { $gte: windowStart } } },
    { $group: { _id: '$locationCode', count: { $sum: 1 } } },
  ]);

  const counts: Record<string, number> = { classroom: 0, library: 0, gym: 0, club: 0 };
  tapCounts.forEach(({ _id, count }: { _id: string; count: number }) => { counts[_id] = count; });

  const locations = await Location.find({ isActive: true });
  const totalWeight = locations.reduce((sum, l) => sum + l.weight, 0) || 1;

  let raw = 0;
  for (const loc of locations) {
    const normalized = Math.min(counts[loc.code] / MAX, 1.0);
    raw += normalized * (loc.weight / totalWeight);
  }

  return Math.round(raw * 1000) / 10;
}

export async function computeAttendanceStreak(studentId: Types.ObjectId): Promise<number> {
  const days = await Tap.distinct('dayKey', { studentRef: studentId, locationCode: 'classroom' });
  if (days.length === 0) return 0;

  days.sort((a: string, b: string) => b.localeCompare(a));

  const todayKey = toDateKey(new Date());
  const yesterdayKey = toDateKey(new Date(Date.now() - 86400000));

  if (days[0] !== todayKey && days[0] !== yesterdayKey) return 0;

  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = parseISO(days[i - 1]);
    const curr = parseISO(days[i]);
    const diff = Math.round((prev.getTime() - curr.getTime()) / 86400000);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

export async function computeLongestStreak(studentId: Types.ObjectId): Promise<number> {
  const days = await Tap.distinct('dayKey', { studentRef: studentId, locationCode: 'classroom' });
  if (days.length === 0) return 0;

  days.sort((a: string, b: string) => a.localeCompare(b));

  let maxStreak = 1;
  let current = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = parseISO(days[i - 1]);
    const curr = parseISO(days[i]);
    const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diff === 1) {
      current++;
      maxStreak = Math.max(maxStreak, current);
    } else {
      current = 1;
    }
  }
  return maxStreak;
}

export async function computePunctualityRate(studentId: Types.ObjectId): Promise<number | null> {
  const taps = await Tap.find({ studentRef: studentId, locationCode: 'classroom' }).select('isLate');
  if (taps.length === 0) return null;
  const onTime = taps.filter(t => !t.isLate).length;
  return Math.round((onTime / taps.length) * 1000) / 1000;
}

export async function computeLocationBreakdown(studentId: Types.ObjectId, windowDays = 30) {
  const windowStart = subDaysFromNow(windowDays);
  const tapCounts = await Tap.aggregate([
    { $match: { studentRef: studentId, tappedAt: { $gte: windowStart } } },
    { $group: { _id: '$locationCode', count: { $sum: 1 } } },
  ]);
  const breakdown = { classroom: 0, library: 0, gym: 0, club: 0 };
  tapCounts.forEach(({ _id, count }: { _id: string; count: number }) => {
    if (_id in breakdown) (breakdown as Record<string, number>)[_id] = count;
  });
  return breakdown;
}

export async function refreshStudentScore(studentId: Types.ObjectId) {
  const [engagementScore, attendanceStreak, longestStreak, punctualityRate, locationBreakdown] =
    await Promise.all([
      computeEngagementScore(studentId),
      computeAttendanceStreak(studentId),
      computeLongestStreak(studentId),
      computePunctualityRate(studentId),
      computeLocationBreakdown(studentId),
    ]);

  const existing = await StudentScore.findOne({ studentRef: studentId });
  const finalLongest = Math.max(longestStreak, existing?.longestStreak ?? 0, attendanceStreak);

  const lastTap = await Tap.findOne({ studentRef: studentId }).sort({ tappedAt: -1 }).select('tappedAt');

  await StudentScore.findOneAndUpdate(
    { studentRef: studentId },
    {
      engagementScore,
      attendanceStreak,
      longestStreak: finalLongest,
      punctualityRate,
      locationBreakdown,
      lastTapAt: lastTap?.tappedAt ?? null,
      computedAt: new Date(),
    },
    { upsert: true, new: true }
  );
}

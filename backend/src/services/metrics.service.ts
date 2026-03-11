import { Types } from 'mongoose';
import { Tap } from '../models/Tap';
import { toDateKey, subDaysFromNow, fillDateGaps } from '../utils/dateHelpers';
import { startOfDay } from 'date-fns';

export async function buildDailyTapSeries(studentId: Types.ObjectId, days = 30) {
  const windowStart = startOfDay(subDaysFromNow(days));

  const result = await Tap.aggregate([
    { $match: { studentRef: studentId, tappedAt: { $gte: windowStart } } },
    {
      $group: {
        _id: '$dayKey',
        total:     { $sum: 1 },
        classroom: { $sum: { $cond: [{ $eq: ['$locationCode', 'classroom'] }, 1, 0] } },
        library:   { $sum: { $cond: [{ $eq: ['$locationCode', 'library']   }, 1, 0] } },
        gym:       { $sum: { $cond: [{ $eq: ['$locationCode', 'gym']       }, 1, 0] } },
        club:      { $sum: { $cond: [{ $eq: ['$locationCode', 'club']      }, 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const shaped = result.map(r => ({
    date: r._id as string,
    total: r.total as number,
    classroom: r.classroom as number,
    library: r.library as number,
    gym: r.gym as number,
    club: r.club as number,
  }));

  return fillDateGaps(shaped, windowStart, new Date(), {
    total: 0, classroom: 0, library: 0, gym: 0, club: 0,
  });
}

export async function buildWeeklyHeatmap(studentId: Types.ObjectId, weeks = 10) {
  const windowStart = startOfDay(subDaysFromNow(weeks * 7));

  const result = await Tap.aggregate([
    { $match: { studentRef: studentId, tappedAt: { $gte: windowStart } } },
    {
      $group: {
        _id: '$dayKey',
        count:        { $sum: 1 },
        hasClassroom: { $max: { $cond: [{ $eq: ['$locationCode', 'classroom'] }, 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return result.map(r => ({
    dayKey:       r._id as string,
    count:        r.count as number,
    hasClassroom: r.hasClassroom === 1,
  }));
}

export async function getRecentTaps(studentId: Types.ObjectId, limit = 10) {
  return Tap.find({ studentRef: studentId })
    .sort({ tappedAt: -1 })
    .limit(limit)
    .select('locationCode tappedAt isLate dayKey');
}

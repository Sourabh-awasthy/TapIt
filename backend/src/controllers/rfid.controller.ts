import { Request, Response, NextFunction } from 'express';
import { Student } from '../models/Student';
import { Tap } from '../models/Tap';
import { StudentScore } from '../models/StudentScore';
import { computeIsLate } from '../services/tap.service';
import { refreshStudentScore } from '../services/scoring.service';
import { toDateKey } from '../utils/dateHelpers';
import { ok, fail } from '../utils/apiResponse';

export async function handleTap(req: Request, res: Response, next: NextFunction) {
  try {
    const { rfidCardId, locationCode, readerDeviceId } = req.body;
    if (!rfidCardId || !locationCode) return fail(res, 'rfidCardId and locationCode required');

    const student = await Student.findOne({ rfidCardId, isActive: true });
    if (!student) return fail(res, 'RFID card not registered', 404);

    const tappedAt = new Date();
    const isLate = await computeIsLate(tappedAt, locationCode);
    const dayKey = toDateKey(tappedAt);

    const tap = await Tap.create({ rfidCardId, studentRef: student._id, locationCode, readerDeviceId, tappedAt, dayKey, isLate });

    // Refresh scores asynchronously — do not block hardware response
    setImmediate(() => refreshStudentScore(student._id).catch(console.error));

    const scores = await StudentScore.findOne({ studentRef: student._id });

    return ok(res, {
      tapId: tap._id,
      studentName: `${student.firstName} ${student.lastName}`,
      locationCode,
      tappedAt,
      isLate,
      newEngagementScore: scores?.engagementScore ?? 0,
      attendanceStreak: scores?.attendanceStreak ?? 0,
    });
  } catch (err) { next(err); }
}

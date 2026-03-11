import { Request, Response, NextFunction } from 'express';
import { StudentScore } from '../models/StudentScore';
import { Student } from '../models/Student';
import { ok } from '../utils/apiResponse';

export async function getLeaderboard(req: Request, res: Response, next: NextFunction) {
  try {
    const { classGroup, limit = '10' } = req.query as Record<string, string>;
    const limitNum = Math.min(parseInt(limit), 50);

    let studentFilter: Record<string, unknown> = { isActive: true };
    if (classGroup) studentFilter.classGroup = classGroup;
    const students = await Student.find(studentFilter).select('_id firstName lastName studentId classGroup');
    const studentIds = students.map(s => s._id);
    const studentMap = new Map(students.map(s => [s._id.toString(), s]));

    const scores = await StudentScore.find({ studentRef: { $in: studentIds } })
      .sort({ engagementScore: -1 })
      .limit(limitNum);

    const result = scores.map((sc, i) => {
      const s = studentMap.get(sc.studentRef.toString());
      return {
        rank: i + 1,
        studentRef: sc.studentRef,
        firstName: s?.firstName ?? '',
        lastName: s?.lastName ?? '',
        studentId: s?.studentId ?? '',
        classGroup: s?.classGroup ?? '',
        engagementScore: sc.engagementScore,
        attendanceStreak: sc.attendanceStreak,
      };
    });

    return ok(res, result);
  } catch (err) { next(err); }
}

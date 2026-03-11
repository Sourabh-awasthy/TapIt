import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { Student } from '../models/Student';
import { User } from '../models/User';
import { StudentScore } from '../models/StudentScore';
import { ok, fail } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/authenticate';
import { buildDailyTapSeries, buildWeeklyHeatmap, getRecentTaps } from '../services/metrics.service';
import { Types } from 'mongoose';

export async function listStudents(req: Request, res: Response, next: NextFunction) {
  try {
    const { classGroup, search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = { isActive: true };
    if (classGroup) filter.classGroup = classGroup;
    if (search) filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName:  { $regex: search, $options: 'i' } },
      { studentId: { $regex: search, $options: 'i' } },
    ];

    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 100);
    const skip = (pageNum - 1) * limitNum;

    const [students, total] = await Promise.all([
      Student.find(filter).skip(skip).limit(limitNum).sort({ lastName: 1 }),
      Student.countDocuments(filter),
    ]);

    const studentIds = students.map(s => s._id);
    const scores = await StudentScore.find({ studentRef: { $in: studentIds } });
    const scoreMap = new Map(scores.map(s => [s.studentRef.toString(), s]));

    const data = students.map(s => ({
      ...s.toObject(),
      score: scoreMap.get(s._id.toString()) ?? null,
    }));

    return ok(res, { students: data, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) { next(err); }
}

export async function getStudent(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const { id } = req.params;

    if (authReq.user.role === 'student' && authReq.user.studentRef !== id) {
      return fail(res, 'Forbidden', 403);
    }

    const student = await Student.findById(id);
    if (!student) return fail(res, 'Student not found', 404);
    return ok(res, student);
  } catch (err) { next(err); }
}

export async function getStudentMetrics(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthRequest;
    const { id } = req.params;

    if (authReq.user.role === 'student' && authReq.user.studentRef !== id) {
      return fail(res, 'Forbidden', 403);
    }

    const student = await Student.findById(id);
    if (!student) return fail(res, 'Student not found', 404);

    const oid = new Types.ObjectId(id);
    const [scores, dailyTaps, weeklyHeatmap, recentTaps] = await Promise.all([
      StudentScore.findOne({ studentRef: id }),
      buildDailyTapSeries(oid),
      buildWeeklyHeatmap(oid),
      getRecentTaps(oid),
    ]);

    return ok(res, {
      student: {
        _id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        studentId: student.studentId,
        classGroup: student.classGroup,
        rfidCardId: student.rfidCardId,
      },
      scores,
      charts: { dailyTaps, weeklyHeatmap, recentTaps },
    });
  } catch (err) { next(err); }
}

export async function createStudent(req: Request, res: Response, next: NextFunction) {
  try {
    const { firstName, lastName, studentId, rfidCardId, classGroup, teacherRef, email, password } = req.body;

    const student = await Student.create({ firstName, lastName, studentId, rfidCardId, classGroup, teacherRef });

    if (email && password) {
      const hash = await bcrypt.hash(password, 10);
      await User.create({ email, password: hash, role: 'student', studentRef: student._id });
    }

    return ok(res, student, 201);
  } catch (err: any) {
    if (err.code === 11000) return fail(res, 'Duplicate studentId or rfidCardId', 409);
    next(err);
  }
}

export async function updateStudent(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const student = await Student.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!student) return fail(res, 'Student not found', 404);
    return ok(res, student);
  } catch (err) { next(err); }
}

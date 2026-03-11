import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { signToken } from '../utils/jwt';
import { ok, fail } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/authenticate';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return fail(res, 'Email and password required');

    const user = await User.findOne({ email }).select('+password');
    if (!user) return fail(res, 'Invalid credentials', 401);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return fail(res, 'Invalid credentials', 401);

    const token = signToken({ userId: user._id.toString(), role: user.role, studentRef: user.studentRef?.toString() });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    return ok(res, {
      user: { _id: user._id, email: user.email, role: user.role },
      studentRef: user.studentRef,
    });
  } catch (err) { next(err); }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = (req as AuthRequest).user;
    const user = await User.findById(userId).select('-password');
    if (!user) return fail(res, 'User not found', 404);
    return ok(res, user);
  } catch (err) { next(err); }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie('token', { path: '/' });
  return ok(res, { message: 'Logged out' });
}

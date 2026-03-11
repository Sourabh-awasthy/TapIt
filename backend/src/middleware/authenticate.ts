import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt';
import { fail } from '../utils/apiResponse';

export interface AuthRequest extends Request {
  user: JWTPayload;
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  if (!token) return fail(res, 'Unauthorized', 401);
  try {
    (req as AuthRequest).user = verifyToken(token);
    next();
  } catch {
    return fail(res, 'Invalid or expired token', 401);
  }
}

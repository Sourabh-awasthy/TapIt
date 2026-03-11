import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AuthRequest } from './authenticate';
import { Role } from '../models/User';
import { fail } from '../utils/apiResponse';

export function authorize(...roles: Role[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes((req as AuthRequest).user.role)) return fail(res, 'Forbidden', 403);
    next();
  };
}

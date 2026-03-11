import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { fail } from '../utils/apiResponse';

export function hardwareKey(req: Request, res: Response, next: NextFunction) {
  if (!env.HARDWARE_API_KEY) return next(); // key not configured → open
  const key = req.headers['x-hardware-key'];
  if (key !== env.HARDWARE_API_KEY) return fail(res, 'Invalid hardware key', 401);
  next();
}

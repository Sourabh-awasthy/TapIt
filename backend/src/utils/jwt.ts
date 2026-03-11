import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import type { Role } from '../models/User';

export interface JWTPayload {
  userId: string;
  role: Role;
  studentRef?: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
}

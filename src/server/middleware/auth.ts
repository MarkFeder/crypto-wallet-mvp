import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { strings } from '../locales/strings';

// Note: Express Request type is augmented in ../types/express.d.ts

interface JwtPayload {
  id: number;
  username: string;
}

// Security: Require JWT_SECRET from environment - no fallback
export const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set');
}

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
};

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  // Read token from HttpOnly cookie instead of Authorization header
  const token = req.cookies?.auth_token;

  if (!token) {
    res.status(401).json({ error: strings.auth.accessTokenRequired });
    return;
  }

  jwt.verify(token, JWT_SECRET as string, (err: Error | null, decoded: unknown) => {
    if (err) {
      res.status(403).json({ error: strings.auth.invalidToken });
      return;
    }
    req.user = decoded as JwtPayload;
    next();
  });
};

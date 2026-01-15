import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db';
import { JWT_SECRET, COOKIE_OPTIONS } from '../middleware/auth';
import queries from '../queries';
import { sendSuccess, badRequest, unauthorized, serverError } from '../utils/apiResponse';
import { HTTP_STATUS } from '../../common/constants/server';
import { strings } from '../locales/strings';

interface UserRow {
  id: number;
  username: string;
  email: string;
  password_hash: string;
}

interface DbError extends Error {
  code?: string;
}

export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return badRequest(res, strings.auth.allFieldsRequired);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query<UserRow>(queries.auth.createUser, [
      username,
      email,
      hashedPassword,
    ]);

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET as string);

    // Set HttpOnly cookie instead of returning token in response body
    res.cookie('auth_token', token, COOKIE_OPTIONS);

    return sendSuccess(res, { user }, HTTP_STATUS.CREATED);
  } catch (error) {
    const dbError = error as DbError;
    if (dbError.code === '23505') {
      return badRequest(res, strings.auth.usernameOrEmailExists);
    }
    return serverError(res, strings.auth.registrationFailed, error as Error);
  }
};

export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;

    const result = await db.query<UserRow>(queries.auth.findUserByEmail, [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return unauthorized(res, strings.auth.invalidCredentials);
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET as string);

    // Set HttpOnly cookie instead of returning token in response body
    res.cookie('auth_token', token, COOKIE_OPTIONS);

    return sendSuccess(res, {
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    return serverError(res, strings.auth.loginFailed, error as Error);
  }
};

export const logout = async (req: Request, res: Response): Promise<Response> => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  return sendSuccess(res, { message: strings.auth.loggedOutSuccessfully });
};

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET, COOKIE_OPTIONS } = require('../middleware/auth');
const queries = require('../queries');
const { sendSuccess, badRequest, unauthorized, serverError } = require('../utils/apiResponse');
const { HTTP_STATUS } = require('../../common/constants');
const { strings } = require('../locales/strings');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return badRequest(res, strings.auth.allFieldsRequired);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(queries.auth.createUser, [username, email, hashedPassword]);

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);

    // Set HttpOnly cookie instead of returning token in response body
    res.cookie('auth_token', token, COOKIE_OPTIONS);

    return sendSuccess(res, { user }, HTTP_STATUS.CREATED);
  } catch (error) {
    if (error.code === '23505') {
      return badRequest(res, strings.auth.usernameOrEmailExists);
    }
    return serverError(res, strings.auth.registrationFailed, error);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await db.query(queries.auth.findUserByEmail, [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return unauthorized(res, strings.auth.invalidCredentials);
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);

    // Set HttpOnly cookie instead of returning token in response body
    res.cookie('auth_token', token, COOKIE_OPTIONS);

    return sendSuccess(res, {
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    return serverError(res, strings.auth.loginFailed, error);
  }
};

const logout = async (req, res) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  return sendSuccess(res, { message: strings.auth.loggedOutSuccessfully });
};

module.exports = { register, login, logout };

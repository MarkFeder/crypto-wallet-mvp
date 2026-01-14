const bcrypt = require('bcryptjs');
const Joi = require('joi');
const db = require('../_lib/db');
const { generateToken, createAuthCookie } = require('../_lib/auth');
const { setCorsHeaders } = require('../_lib/cors');
const { validateBody } = require('../_lib/validate');

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

const findUserByEmail = `SELECT * FROM users WHERE email = $1`;

module.exports = async function handler(req, res) {
  // Handle CORS
  if (setCorsHeaders(req, res)) return;

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate request body
    const validation = validateBody(loginSchema, req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const { email, password } = validation.value;

    // Find user
    const result = await db.query(findUserByEmail, [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token and set cookie
    const token = generateToken(user);

    res.setHeader('Set-Cookie', createAuthCookie(token));
    return res.status(200).json({
      success: true,
      data: {
        user: { id: user.id, username: user.username, email: user.email },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
};

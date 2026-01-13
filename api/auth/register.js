const bcrypt = require('bcryptjs');
const Joi = require('joi');
const db = require('../_lib/db');
const { generateToken, createAuthCookie } = require('../_lib/auth');
const { setCorsHeaders } = require('../_lib/cors');
const { validateBody } = require('../_lib/validate');

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required().messages({
    'string.min': 'Username must be at least 3 characters',
    'string.max': 'Username must be at most 30 characters',
    'string.alphanum': 'Username must only contain alphanumeric characters',
    'any.required': 'Username is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required',
    }),
});

const createUser = `
  INSERT INTO users (username, email, password_hash)
  VALUES ($1, $2, $3)
  RETURNING id, username, email
`;

module.exports = async function handler(req, res) {
  // Handle CORS
  if (setCorsHeaders(req, res)) return;

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate request body
    const validation = validateBody(registerSchema, req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const { username, email, password } = validation.value;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await db.query(createUser, [username, email, hashedPassword]);
    const user = result.rows[0];

    // Generate token and set cookie
    const token = generateToken(user);

    res.setHeader('Set-Cookie', createAuthCookie(token));
    return res.status(201).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
};

/**
 * Authentication-related database queries
 */

const authQueries = {
  // Create a new user
  createUser: `
    INSERT INTO users (username, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, username, email
  `,

  // Find user by email
  findUserByEmail: `
    SELECT *
    FROM users
    WHERE email = $1
  `,

  // Find user by ID
  findUserById: `
    SELECT id, username, email, created_at
    FROM users
    WHERE id = $1
  `,

  // Find user by username
  findUserByUsername: `
    SELECT id, username, email, created_at
    FROM users
    WHERE username = $1
  `,
};

module.exports = authQueries;

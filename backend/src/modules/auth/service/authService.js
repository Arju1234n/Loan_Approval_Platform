const jwt = require('jsonwebtoken');
const { createUser, findUserByEmail } = require('../repository/authRepository');

const generateToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  );

const registerUser = async ({ name, email, password, role = 'user' }) => {
  const exists = await findUserByEmail(email);
  if (exists) {
    const error = new Error('Email already registered.');
    error.statusCode = 409;
    throw error;
  }

  const user = await createUser({ name, email, password, role });
  return { user: user.toJSON(), token: generateToken(user) };
};

const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email);
  if (!user || !(await user.comparePassword(password))) {
    const error = new Error('Invalid credentials.');
    error.statusCode = 401;
    throw error;
  }

  return { user: user.toJSON(), token: generateToken(user) };
};

module.exports = { registerUser, loginUser };

const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const store    = require('../models/store');

const authRouter = express.Router();

// POST /auth/register
authRouter.post('/register', async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email, and password are required' });
    }

    if (store.users.find(u => u.email === email)) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = {
      id: store.nextId.user++,
      username,
      email,
      password: hashed,
      // Only allow 'admin' role if explicitly set AND we have an admin secret
      role: (role === 'admin' && req.headers['x-admin-key'] === process.env.ADMIN_SECRET)
        ? 'admin'
        : 'reporter',
      createdAt: new Date(),
    };

    store.users.push(user);

    const token = signToken(user);
    res.status(201).json({ message: 'User registered', token, role: user.role });
  } catch (err) {
    next(err);
  }
});

// POST /auth/login
authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = store.users.find(u => u.email === email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken(user);
    res.json({ token, username: user.username, role: user.role });
  } catch (err) {
    next(err);
  }
});

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set — check your .env file');
  return jwt.sign(
    { userId: user.id, username: user.username, role: user.role },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
}

module.exports = { authRouter };

import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail } from '../models/User.js';
import { signToken } from '../middleware/auth.js';

const SALT_ROUNDS = 10;

/**
 * POST /register
 * Body: { email, password, role, fullName?, walletAddress? }
 */
export async function register(req, res) {
  try {
    const { email, password, role, fullName, walletAddress } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'email, password, and role are required' });
    }
    if (!['customer', 'driver', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'role must be customer, driver, or admin' });
    }
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await createUser({
      email,
      passwordHash,
      role,
      fullName,
      walletAddress,
    });
    const token = signToken(user.id);
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        wallet_address: user.wallet_address,
      },
      token,
    });
  } catch (e) {
    console.error('Register error:', e);
    res.status(500).json({ error: 'Registration failed' });
  }
}

/**
 * POST /login
 * Body: { email, password }
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = signToken(user.id);
    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        wallet_address: user.wallet_address,
      },
      token,
    });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: 'Login failed' });
  }
}

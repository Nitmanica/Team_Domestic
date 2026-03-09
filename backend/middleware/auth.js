import jwt from 'jsonwebtoken';
import { findUserById } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'trustroute-jwt-secret-change-in-production';

/**
 * Optional auth: sets req.user if token present, does not reject.
 */
export function optionalAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return next();
  const token = auth.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    findUserById(decoded.userId).then((user) => {
      req.user = user;
      next();
    }).catch(() => next());
  } catch {
    next();
  }
}

/**
 * Require auth: 401 if no valid token.
 */
export function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const token = auth.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    findUserById(decoded.userId).then((user) => {
      if (!user) return res.status(401).json({ error: 'User not found' });
      req.user = user;
      next();
    }).catch(() => res.status(401).json({ error: 'Authentication failed' }));
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * Require admin role.
 */
export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

export function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

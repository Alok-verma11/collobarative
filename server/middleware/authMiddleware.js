import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'kanban_jwt_secret_dev_key_2026';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ error: 'User not found or revoked' });
      }

      return next();
    } catch (error) {
      console.error('JWT Verification error:', error.message);
      return res.status(401).json({ error: 'Not authorized, token invalid or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token provided' });
  }
};

export const generateToken = (id, email) => {
  return jwt.sign({ id, email }, JWT_SECRET, {
    expiresIn: '30d'
  });
};

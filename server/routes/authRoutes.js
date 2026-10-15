import express from 'express';
import User from '../models/User.js';
import Board from '../models/Board.js';
import { protect, generateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Preset avatar generators if avatar is not provided
const getDicebearAvatar = (name) => {
  const seed = encodeURIComponent(name.trim());
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
};

// Preset colors for new users
const AVATAR_COLORS = ['#6366f1', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

// POST /api/auth/register - Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, avatar, color } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
    }

    const assignedAvatar = avatar && avatar.trim() !== '' ? avatar.trim() : getDicebearAvatar(name);
    const assignedColor = color || AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    const assignedRole = role && role.trim() !== '' ? role.trim() : 'Full Stack Dev';

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: assignedRole,
      avatar: assignedAvatar,
      color: assignedColor
    });

    const userPayload = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      color: user.color
    };

    // Auto-add new user to existing boards as a member so they can immediately participate
    try {
      const boards = await Board.find();
      for (const board of boards) {
        const alreadyMember = board.members.some(
          (m) => m.email.toLowerCase() === normalizedEmail || m.id === user._id.toString()
        );
        if (!alreadyMember) {
          board.members.push(userPayload);
          await board.save();

          // Notify live socket clients if io is available
          const io = req.app.get('io');
          if (io) {
            io.to(board._id.toString()).emit('member_invited', { member: userPayload });
          }
        }
      }
    } catch (boardErr) {
      console.warn('Note: Could not auto-add member to boards:', boardErr.message);
    }

    const token = generateToken(user._id, user.email);

    res.status(201).json({
      success: true,
      token,
      user: userPayload,
      message: 'Account created successfully!'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Server error during registration' });
  }
});

// POST /api/auth/login - Log in existing user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide both email and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password. Please check your credentials.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password. Please check your credentials.' });
    }

    const token = generateToken(user._id, user.email);

    res.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        color: user.color
      },
      message: 'Logged in successfully!'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Server error during login' });
  }
});

// GET /api/auth/me - Get current logged-in user details
router.get('/me', protect, async (req, res) => {
  try {
    const user = req.user;
    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        color: user.color
      }
    });
  } catch (error) {
    console.error('Fetch me error:', error);
    res.status(500).json({ error: error.message || 'Server error fetching user profile' });
  }
});

// GET /api/auth/demo-users - List demo users for 1-click test login
router.get('/demo-users', async (req, res) => {
  try {
    const users = await User.find({
      email: { $in: ['alex@company.io', 'sarah@company.io', 'vikram@company.io', 'priya@company.io'] }
    }).select('-password');

    res.json(users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      avatar: u.avatar,
      color: u.color
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

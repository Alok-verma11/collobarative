import express from 'express';
import Board from '../models/Board.js';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';

const router = express.Router();

// Helper to log board activity
export const logActivity = async (boardId, user, action, details, taskId = null, io = null) => {
  try {
    const activity = await Activity.create({
      boardId,
      user: {
        id: user?.id || 'sys',
        name: user?.name || 'System',
        avatar: user?.avatar || ''
      },
      action,
      details,
      taskId
    });

    if (io) {
      io.to(boardId.toString()).emit('activity_added', activity);
    }
    return activity;
  } catch (err) {
    console.error('Failed to log activity:', err.message);
  }
};

// GET /api/boards - List all boards
router.get('/', async (req, res) => {
  try {
    const boards = await Board.find().sort({ updatedAt: -1 });
    res.json(boards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/boards - Create board
router.post('/', async (req, res) => {
  try {
    const { title, createdBy, members } = req.body;
    const defaultCreator = createdBy || {
      id: 'usr_alex',
      name: 'Alex Rivera',
      email: 'alex@company.io',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    };

    const initialMembers = members && members.length > 0 ? members : [
      defaultCreator,
      {
        id: 'usr_sarah',
        name: 'Sarah Chen',
        email: 'sarah@company.io',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
        role: 'Product Lead',
        color: '#ec4899'
      },
      {
        id: 'usr_vikram',
        name: 'Vikram Patel',
        email: 'vikram@company.io',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        role: 'Full Stack Dev',
        color: '#3b82f6'
      },
      {
        id: 'usr_priya',
        name: 'Priya Sharma',
        email: 'priya@company.io',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
        role: 'QA Engineer',
        color: '#10b981'
      }
    ];

    const newBoard = await Board.create({
      title: title || 'Sprint Kanban Board',
      createdBy: defaultCreator,
      members: initialMembers
    });

    const io = req.app.get('io');
    await logActivity(newBoard._id, defaultCreator, 'BOARD_CREATED', `Board "${newBoard.title}" created.`, null, io);

    res.status(201).json(newBoard);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/boards/:id - Get board data with all tasks & activities
router.get('/:id', async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const tasks = await Task.find({ boardId: board._id }).sort({ position: 1 });
    const activities = await Activity.find({ boardId: board._id }).sort({ timestamp: -1 }).limit(50);

    res.json({
      board,
      tasks,
      activities
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/boards/:id/tasks - Create task on board
router.post('/:id/tasks', async (req, res) => {
  try {
    const { title, description, priority, dueDate, assignedTo, status, user } = req.body;
    const boardId = req.params.id;

    if (!title) {
      return res.status(400).json({ error: 'Task title is required.' });
    }

    const taskStatus = status || 'Todo';

    // Find highest position in current column to place task at bottom
    const lastTask = await Task.findOne({ boardId, status: taskStatus }).sort({ position: -1 });
    const position = lastTask ? lastTask.position + 1 : 0;

    const newTask = await Task.create({
      boardId,
      title: title.trim(),
      description: description || '',
      priority: priority || 'Medium',
      dueDate: dueDate || null,
      assignedTo: assignedTo || null,
      status: taskStatus,
      position
    });

    const io = req.app.get('io');
    const actor = user || { id: 'usr_actor', name: 'Board Member' };
    await logActivity(boardId, actor, 'TASK_CREATED', `Created task "${newTask.title}" in ${taskStatus}`, newTask._id, io);

    if (io) {
      io.to(boardId.toString()).emit('task_created', {
        task: newTask,
        actor
      });
    }

    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/boards/:id/members - Invite/add member
router.post('/:id/members', async (req, res) => {

  try {
    const { name, email, role, avatar, color } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Check if email already added
    const existing = board.members.find(m => m.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'Member with this email is already on the board.' });
    }

    const newMember = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role: role || 'Member',
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      color: color || '#8b5cf6'
    };

    board.members.push(newMember);
    await board.save();

    const io = req.app.get('io');
    const inviter = req.body.invitedBy || board.createdBy;
    await logActivity(board._id, inviter, 'MEMBER_INVITED', `Invited ${name} (${email}) as ${newMember.role}`, null, io);

    // Real-time broadcast
    if (io) {
      io.to(board._id.toString()).emit('member_invited', {
        boardId: board._id,
        member: newMember
      });
    }

    res.status(201).json(board);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/boards/:id/analytics - Analytics metrics (Bonus)
router.get('/:id/analytics', async (req, res) => {
  try {
    const tasks = await Task.find({ boardId: req.params.id });
    const totalTasks = tasks.length;

    const statusCounts = {
      'Todo': 0,
      'In Progress': 0,
      'Review': 0,
      'Done': 0
    };

    const priorityCounts = {
      'Low': 0,
      'Medium': 0,
      'High': 0,
      'Urgent': 0
    };

    let overdueCount = 0;
    const now = new Date();

    const memberTaskCounts = {};

    tasks.forEach(task => {
      if (statusCounts[task.status] !== undefined) {
        statusCounts[task.status]++;
      }
      if (priorityCounts[task.priority] !== undefined) {
        priorityCounts[task.priority]++;
      }
      if (task.dueDate && new Date(task.dueDate) < now && task.status !== 'Done') {
        overdueCount++;
      }
      const memberName = task.assignedTo?.name || 'Unassigned';
      memberTaskCounts[memberName] = (memberTaskCounts[memberName] || 0) + 1;
    });

    const completionRate = totalTasks > 0 ? Math.round((statusCounts['Done'] / totalTasks) * 100) : 0;

    res.json({
      totalTasks,
      statusCounts,
      priorityCounts,
      overdueCount,
      completionRate,
      memberTaskCounts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/boards/:id/activities - Activity timeline (Bonus)
router.get('/:id/activities', async (req, res) => {
  try {
    const activities = await Activity.find({ boardId: req.params.id }).sort({ timestamp: -1 }).limit(100);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

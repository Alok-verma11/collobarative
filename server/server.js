import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import boardRoutes from './routes/boardRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { setupSocketHandlers } from './socket/socketHandler.js';
import Board from './models/Board.js';
import Task from './models/Task.js';
import Activity from './models/Activity.js';
import User from './models/User.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// CORS configuration for both dev and prod
const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'];

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Provide io instance to Express routes
app.set('io', io);

// Setup socket event listeners
setupSocketHandlers(io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/tasks', taskRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    service: 'Kanban Real-Time Backend API'
  });
});

// Seed default sample board and tasks if database is empty
const seedInitialDataIfNeeded = async () => {
  try {
    // 1. Seed demo users if not present
    const demoUsers = [
      {
        name: 'Alex Rivera',
        email: 'alex@company.io',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        role: 'Tech Lead',
        color: '#6366f1'
      },
      {
        name: 'Sarah Chen',
        email: 'sarah@company.io',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
        role: 'Product Lead',
        color: '#ec4899'
      },
      {
        name: 'Vikram Patel',
        email: 'vikram@company.io',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        role: 'Full Stack Dev',
        color: '#3b82f6'
      },
      {
        name: 'Priya Sharma',
        email: 'priya@company.io',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
        role: 'QA Engineer',
        color: '#10b981'
      }
    ];

    for (const demoUser of demoUsers) {
      const exists = await User.findOne({ email: demoUser.email });
      if (!exists) {
        await User.create(demoUser);
        console.log(`👤 Seeded demo user: ${demoUser.name} (${demoUser.email})`);
      }
    }

    const existingBoard = await Board.findOne();
    if (!existingBoard) {
      console.log('🌱 No board found. Initializing seed board and sample tasks...');

      const defaultCreator = {
        id: 'usr_alex',
        name: 'Alex Rivera',
        email: 'alex@company.io',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        role: 'Tech Lead',
        color: '#6366f1'
      };

      const members = [
        defaultCreator,
        {
          id: 'usr_sarah',
          name: 'Sarah Chen',
          email: 'sarah@company.io',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
          role: 'Product Lead',
          color: '#ec4899'
        },
        {
          id: 'usr_vikram',
          name: 'Vikram Patel',
          email: 'vikram@company.io',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
          role: 'Full Stack Dev',
          color: '#3b82f6'
        },
        {
          id: 'usr_priya',
          name: 'Priya Sharma',
          email: 'priya@company.io',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
          role: 'QA Engineer',
          color: '#10b981'
        }
      ];

      const board = await Board.create({
        title: 'Cloud Platform Sprint 42',
        createdBy: defaultCreator,
        members
      });

      const sampleTasks = [
        {
          boardId: board._id,
          title: 'Architect Real-Time WebSocket Channel',
          description: 'Implement low-latency bi-directional sync with conflict-free reordering for multi-user boards.',
          priority: 'Urgent',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          assignedTo: members[0],
          status: 'Todo',
          position: 0,
          comments: [
            {
              id: 'c1',
              user: members[1],
              text: 'Ensure socket reconnection handlers gracefully resync board state.',
              createdAt: new Date(Date.now() - 3600000)
            }
          ],
          attachments: [
            {
              id: 'a1',
              name: 'socket-architecture-v2.pdf',
              size: 245000,
              type: 'application/pdf',
              url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
              uploadedBy: 'Alex Rivera'
            }
          ]
        },
        {
          boardId: board._id,
          title: 'Design Glassmorphism Dashboard UI',
          description: 'Craft high-contrast dark theme, fluid card dragging animations, and responsive column layouts.',
          priority: 'High',
          dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          assignedTo: members[1],
          status: 'Todo',
          position: 1,
          comments: []
        },
        {
          boardId: board._id,
          title: 'MongoDB BulkWrite Index Optimization',
          description: 'Benchmark column reorder queries with compound indexes on (boardId, status, position).',
          priority: 'High',
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          assignedTo: members[2],
          status: 'In Progress',
          position: 0,
          comments: [
            {
              id: 'c2',
              user: members[2],
              text: 'Bulk ops currently running in under 4ms on local benchmarks.',
              createdAt: new Date(Date.now() - 1800000)
            }
          ]
        },
        {
          boardId: board._id,
          title: 'Implement Active User Presence Avatars',
          description: 'Broadcast active socket user joins and leaves with colored glow status badges.',
          priority: 'Medium',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          assignedTo: members[0],
          status: 'In Progress',
          position: 1,
          comments: []
        },
        {
          boardId: board._id,
          title: 'Multi-User Drag and Drop Concurrency Test',
          description: 'Verify behavior when two users simultaneously drag adjacent cards into different slots.',
          priority: 'Urgent',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          assignedTo: members[3],
          status: 'Review',
          position: 0,
          comments: [
            {
              id: 'c3',
              user: members[3],
              text: 'Tested 2 clients simultaneously; state settles cleanly without duplicating indices.',
              createdAt: new Date(Date.now() - 7200000)
            }
          ]
        },
        {
          boardId: board._id,
          title: 'Setup Production Docker Container & Environment',
          description: 'Configured node cluster and environment variables for cloud deployment.',
          priority: 'Low',
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          assignedTo: members[2],
          status: 'Done',
          position: 0,
          comments: []
        }
      ];

      await Task.insertMany(sampleTasks);

      await Activity.create({
        boardId: board._id,
        user: defaultCreator,
        action: 'BOARD_CREATED',
        details: `Board "${board.title}" initialized with sample tasks.`
      });

      console.log('✨ Seed board and tasks successfully populated!');
    }
  } catch (err) {
    console.error('Error during data seeding:', err.message);
  }
};

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await seedInitialDataIfNeeded();

  server.listen(PORT, () => {
    console.log(`🚀 Real-Time Kanban Server running on http://localhost:${PORT}`);
  });
};

startServer();

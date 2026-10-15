import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const BoardContext = createContext(null);

export const DEFAULT_USERS = [
  {
    id: 'usr_alex',
    name: 'Alex Rivera',
    email: 'alex@company.io',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    role: 'Tech Lead',
    color: '#6366f1'
  },
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

export const BoardProvider = ({ children }) => {
  const { user: authUser, logout: authLogout, switchAccount } = useAuth();

  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [onlineMembers, setOnlineMembers] = useState([]);
  const [remoteTyping, setRemoteTyping] = useState({});
  const [remoteDragging, setRemoteDragging] = useState({});

  // Active persona synced with auth
  const [currentUser, setCurrentUser] = useState(() => {
    return authUser || DEFAULT_USERS[0];
  });

  useEffect(() => {
    if (authUser) {
      setCurrentUser(authUser);
    }
  }, [authUser]);

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    priority: 'all',
    member: 'all',
    date: 'all'
  });

  // Active modal states
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] = useState('Todo');
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Theme
  const [theme, setTheme] = useState(() => localStorage.getItem('kanban_theme') || 'dark');

  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Switch persona
  const switchUser = (user) => {
    setCurrentUser(user);
    if (switchAccount) {
      switchAccount(user);
    }
    if (socketRef.current && board?._id) {
      socketRef.current.emit('join_board', { boardId: board._id, user });
    }
  };

  // Toggle Theme
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('kanban_theme', nextTheme);
  };

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  // Fetch initial board data
  const fetchBoardData = useCallback(async (boardId = null) => {
    try {
      setLoading(true);
      let targetId = boardId;

      if (!targetId) {
        // Fetch list of boards first
        const boardsRes = await fetch('/api/boards');
        if (!boardsRes.ok) throw new Error('Failed to fetch boards');
        const boardsList = await boardsRes.json();
        if (boardsList.length === 0) {
          // Create default board if none exists
          const createRes = await fetch('/api/boards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Cloud Platform Sprint 42', createdBy: currentUser })
          });
          const createdBoard = await createRes.json();
          targetId = createdBoard._id;
        } else {
          targetId = boardsList[0]._id;
        }
      }

      const res = await fetch(`/api/boards/${targetId}`);
      if (!res.ok) throw new Error('Failed to load board details');
      const data = await res.json();

      setBoard(data.board);
      setTasks(data.tasks || []);
      setActivities(data.activities || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Socket setup
  useEffect(() => {
    // Setup socket connection directly to backend
    const socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('⚡ Socket connected:', socket.id);
      setConnectionStatus('connected');
      if (board?._id) {
        socket.emit('join_board', { boardId: board._id, user: currentUser });
      }
    });

    socket.on('disconnect', () => {
      console.warn('⚠️ Socket disconnected');
      setConnectionStatus('disconnected');
    });

    socket.on('reconnect', () => {
      console.log('🔄 Socket reconnected! Re-syncing board state...');
      setConnectionStatus('connected');
      if (board?._id) {
        socket.emit('join_board', { boardId: board._id, user: currentUser });
        fetchBoardData(board._id); // Auto-refresh board state on reconnect
      }
    });

    // Real-time events
    socket.on('online_members_update', (members) => {
      setOnlineMembers(members || []);
    });

    socket.on('task_created', ({ task }) => {
      setTasks((prev) => {
        if (prev.some((t) => t._id === task._id)) return prev;
        return [...prev, task];
      });
    });

    socket.on('task_moved', ({ taskId, tasks: updatedTasks }) => {
      if (updatedTasks && Array.isArray(updatedTasks)) {
        setTasks(updatedTasks);
      }
    });

    socket.on('task_updated', ({ task }) => {
      setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
      setSelectedTask((prev) => (prev?._id === task._id ? task : prev));
    });

    socket.on('task_deleted', ({ taskId }) => {
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      setSelectedTask((prev) => (prev?._id === taskId ? null : prev));
    });

    socket.on('comment_added', ({ taskId, comment }) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t._id === taskId) {
            const comments = t.comments || [];
            return { ...t, comments: [...comments, comment] };
          }
          return t;
        })
      );
      setSelectedTask((prev) => {
        if (prev?._id === taskId) {
          const comments = prev.comments || [];
          return { ...prev, comments: [...comments, comment] };
        }
        return prev;
      });
    });

    socket.on('attachment_added', ({ taskId, attachment }) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t._id === taskId) {
            const attachments = t.attachments || [];
            return { ...t, attachments: [...attachments, attachment] };
          }
          return t;
        })
      );
      setSelectedTask((prev) => {
        if (prev?._id === taskId) {
          const attachments = prev.attachments || [];
          return { ...prev, attachments: [...attachments, attachment] };
        }
        return prev;
      });
    });

    socket.on('member_invited', ({ member }) => {
      setBoard((prev) => {
        if (!prev) return prev;
        return { ...prev, members: [...prev.members, member] };
      });
    });

    socket.on('activity_added', (activity) => {
      setActivities((prev) => [activity, ...prev]);
    });

    socket.on('user_typing_update', ({ taskId, user, isTyping, field }) => {
      setRemoteTyping((prev) => {
        const next = { ...prev };
        if (isTyping) {
          next[taskId] = { user, field };
        } else {
          delete next[taskId];
        }
        return next;
      });
    });

    socket.on('user_drag_activity', ({ taskId, user, isDragging }) => {
      setRemoteDragging((prev) => {
        const next = { ...prev };
        if (isDragging) {
          next[taskId] = user;
        } else {
          delete next[taskId];
        }
        return next;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // When board or currentUser changes, notify socket room
  useEffect(() => {
    if (socketRef.current && socketRef.current.connected && board?._id) {
      socketRef.current.emit('join_board', { boardId: board._id, user: currentUser });
    }
  }, [board?._id, currentUser]);

  // Initial load
  useEffect(() => {
    fetchBoardData();
  }, [fetchBoardData]);

  // Broadcast drag actions
  const broadcastDragStart = (taskId) => {
    if (socketRef.current && board?._id) {
      socketRef.current.emit('task_drag_start', { boardId: board._id, taskId, user: currentUser });
    }
  };

  const broadcastDragEnd = (taskId) => {
    if (socketRef.current && board?._id) {
      socketRef.current.emit('task_drag_end', { boardId: board._id, taskId });
    }
  };

  // Broadcast typing indicators
  const broadcastTypingStart = (taskId, field = 'comment') => {
    if (socketRef.current && board?._id) {
      socketRef.current.emit('typing_start', { boardId: board._id, taskId, user: currentUser, field });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        broadcastTypingStop(taskId);
      }, 3000);
    }
  };

  const broadcastTypingStop = (taskId) => {
    if (socketRef.current && board?._id) {
      socketRef.current.emit('typing_stop', { boardId: board._id, taskId, user: currentUser });
    }
  };

  // Move task (Optimistic update + API call)
  const moveTask = async (taskId, sourceStatus, destStatus, newPosition) => {
    const previousTasks = [...tasks];

    // Optimistic local update
    const movingTask = tasks.find((t) => t._id === taskId);
    if (!movingTask) return;

    const sourceTasks = tasks
      .filter((t) => t.status === sourceStatus && t._id !== taskId)
      .sort((a, b) => a.position - b.position);

    let destTasks;
    if (sourceStatus === destStatus) {
      destTasks = sourceTasks;
    } else {
      destTasks = tasks
        .filter((t) => t.status === destStatus && t._id !== taskId)
        .sort((a, b) => a.position - b.position);
    }

    const clampedPosition = Math.max(0, Math.min(newPosition, destTasks.length));
    const updatedMovingTask = { ...movingTask, status: destStatus, position: clampedPosition };

    destTasks.splice(clampedPosition, 0, updatedMovingTask);
    const reindexedDest = destTasks.map((t, idx) => ({ ...t, position: idx, status: destStatus }));

    const otherTasks = tasks.filter(
      (t) => t.status !== sourceStatus && t.status !== destStatus && t._id !== taskId
    );

    let nextTasks;
    if (sourceStatus === destStatus) {
      nextTasks = [...otherTasks, ...reindexedDest];
    } else {
      const reindexedSource = sourceTasks.map((t, idx) => ({ ...t, position: idx }));
      nextTasks = [...otherTasks, ...reindexedSource, ...reindexedDest];
    }

    setTasks(nextTasks);

    try {
      const res = await fetch(`/api/tasks/${taskId}/move`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceStatus,
          destStatus,
          newPosition: clampedPosition,
          user: currentUser
        })
      });

      if (!res.ok) {
        throw new Error('Failed to move task');
      }
      const data = await res.json();
      if (data.tasks) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error('Move error, rolling back:', err);
      setTasks(previousTasks);
    }
  };

  // Create task
  const createTask = async (taskData) => {
    try {
      const res = await fetch(`/api/boards/${board._id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...taskData,
          user: currentUser
        })
      });
      if (!res.ok) throw new Error('Failed to create task');
      const newTask = await res.json();
      setTasks((prev) => [...prev, newTask]);
      return newTask;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // Update task
  const updateTask = async (taskId, updates) => {
    // Optimistic update
    setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, ...updates } : t)));
    if (selectedTask?._id === taskId) {
      setSelectedTask((prev) => ({ ...prev, ...updates }));
    }

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updates,
          user: currentUser
        })
      });
      if (!res.ok) throw new Error('Failed to update task');
      const updated = await res.json();
      return updated;
    } catch (err) {
      console.error(err);
      fetchBoardData(board._id); // Re-sync on failure
      throw err;
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    // Optimistic removal
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
    if (selectedTask?._id === taskId) {
      setSelectedTask(null);
    }

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser })
      });
      if (!res.ok) throw new Error('Failed to delete task');
    } catch (err) {
      console.error(err);
      fetchBoardData(board._id);
      throw err;
    }
  };

  // Add Comment (Bonus)
  const addComment = async (taskId, text) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, user: currentUser })
      });
      if (!res.ok) throw new Error('Failed to add comment');
      const comment = await res.json();
      return comment;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // Add Attachment (Bonus)
  const addAttachment = async (taskId, attachmentData) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/attachments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...attachmentData, user: currentUser })
      });
      if (!res.ok) throw new Error('Failed to add attachment');
      const attachment = await res.json();
      return attachment;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // Invite member
  const inviteMember = async (memberData) => {
    try {
      const res = await fetch(`/api/boards/${board._id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...memberData, invitedBy: currentUser })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to invite member');
      }
      const updatedBoard = await res.json();
      setBoard(updatedBoard);
      return updatedBoard;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // Filter tasks selector
  const filteredTasks = tasks.filter((task) => {
    // Search query
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }

    // Priority filter
    if (filters.priority !== 'all') {
      if (task.priority.toLowerCase() !== filters.priority.toLowerCase()) return false;
    }

    // Member filter
    if (filters.member !== 'all') {
      if (filters.member === 'unassigned') {
        if (task.assignedTo && task.assignedTo.id) return false;
      } else {
        if (task.assignedTo?.id !== filters.member) return false;
      }
    }

    // Date filter
    if (filters.date !== 'all') {
      if (!task.dueDate) return false;
      const due = new Date(task.dueDate);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfToday = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1);
      const endOfWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      if (filters.date === 'overdue') {
        if (due >= now || task.status === 'Done') return false;
      } else if (filters.date === 'today') {
        if (due < today || due > endOfToday) return false;
      } else if (filters.date === 'week') {
        if (due < today || due > endOfWeek) return false;
      }
    }

    return true;
  });

  return (
    <BoardContext.Provider
      value={{
        board,
        tasks: filteredTasks,
        rawTasks: tasks,
        activities,
        loading,
        error,
        connectionStatus,
        onlineMembers,
        currentUser,
        switchUser,
        logout: authLogout,
        filters,
        setFilters,
        theme,
        toggleTheme,
        selectedTask,
        setSelectedTask,
        isCreateModalOpen,
        setIsCreateModalOpen,
        createDefaultStatus,
        setCreateDefaultStatus,
        isAnalyticsOpen,
        setIsAnalyticsOpen,
        isActivityOpen,
        setIsActivityOpen,
        isInviteOpen,
        setIsInviteOpen,
        moveTask,
        createTask,
        updateTask,
        deleteTask,
        addComment,
        addAttachment,
        inviteMember,
        remoteTyping,
        remoteDragging,
        broadcastDragStart,
        broadcastDragEnd,
        broadcastTypingStart,
        broadcastTypingStop,
        refreshBoard: () => fetchBoardData(board?._id)
      }}
    >
      {children}
    </BoardContext.Provider>
  );
};

export const useBoard = () => useContext(BoardContext);

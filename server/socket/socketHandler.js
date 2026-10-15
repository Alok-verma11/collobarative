// In-memory presence tracker: boardId -> Map(socketId -> userInfo)
const boardPresences = new Map();

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    let currentBoardId = null;
    let currentUser = null;

    console.log(`🔌 New client connected: ${socket.id}`);

    // Join a specific board room
    socket.on('join_board', ({ boardId, user }) => {
      if (!boardId) return;

      currentBoardId = boardId.toString();
      currentUser = user || {
        id: `guest_${socket.id.substring(0, 4)}`,
        name: 'Guest User',
        avatar: ''
      };

      socket.join(currentBoardId);

      // Track online presence
      if (!boardPresences.has(currentBoardId)) {
        boardPresences.set(currentBoardId, new Map());
      }
      boardPresences.get(currentBoardId).set(socket.id, {
        socketId: socket.id,
        ...currentUser,
        joinedAt: new Date()
      });

      // Send current online members to everyone in this board room
      broadcastOnlineMembers(io, currentBoardId);
      console.log(`👤 User ${currentUser.name} (${socket.id}) joined board ${currentBoardId}`);
    });

    // Leave board room
    socket.on('leave_board', ({ boardId }) => {
      handleUserLeave(socket, io, boardId || currentBoardId);
    });

    // Realtime live dragging indicator (Bonus/Live feedback: so other clients see who is dragging what!)
    socket.on('task_drag_start', ({ boardId, taskId, user }) => {
      if (boardId) {
        socket.to(boardId.toString()).emit('user_drag_activity', {
          taskId,
          user,
          isDragging: true
        });
      }
    });

    socket.on('task_drag_end', ({ boardId, taskId }) => {
      if (boardId) {
        socket.to(boardId.toString()).emit('user_drag_activity', {
          taskId,
          isDragging: false
        });
      }
    });

    // Typing indicators
    socket.on('typing_start', ({ boardId, taskId, user, field }) => {
      if (boardId) {
        socket.to(boardId.toString()).emit('user_typing_update', {
          boardId,
          taskId,
          user,
          field,
          isTyping: true
        });
      }
    });

    socket.on('typing_stop', ({ boardId, taskId, user }) => {
      if (boardId) {
        socket.to(boardId.toString()).emit('user_typing_update', {
          boardId,
          taskId,
          user,
          isTyping: false
        });
      }
    });

    // Disconnect handling
    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
      handleUserLeave(socket, io, currentBoardId);
    });
  });
};

const handleUserLeave = (socket, io, boardId) => {
  if (boardId && boardPresences.has(boardId)) {
    const presenceMap = boardPresences.get(boardId);
    presenceMap.delete(socket.id);
    if (presenceMap.size === 0) {
      boardPresences.delete(boardId);
    } else {
      broadcastOnlineMembers(io, boardId);
    }
  }
};

const broadcastOnlineMembers = (io, boardId) => {
  if (!boardPresences.has(boardId)) {
    io.to(boardId).emit('online_members_update', []);
    return;
  }

  const presences = Array.from(boardPresences.get(boardId).values());
  // Deduplicate by user.id if user has multiple tabs open
  const uniqueUsersMap = new Map();
  presences.forEach((p) => {
    if (!uniqueUsersMap.has(p.id)) {
      uniqueUsersMap.set(p.id, p);
    }
  });

  const onlineUsers = Array.from(uniqueUsersMap.values());
  io.to(boardId).emit('online_members_update', onlineUsers);
};

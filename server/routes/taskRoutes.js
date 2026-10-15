import express from 'express';
import Task from '../models/Task.js';
import Board from '../models/Board.js';
import { logActivity } from './boardRoutes.js';

const router = express.Router();

// Helper to sanitize and normalize positions in a column
const normalizeColumnPositions = async (boardId, status) => {
  const tasks = await Task.find({ boardId, status }).sort({ position: 1, updatedAt: -1 });
  const bulkOps = tasks.map((task, index) => ({
    updateOne: {
      filter: { _id: task._id },
      update: { position: index }
    }
  }));
  if (bulkOps.length > 0) {
    await Task.bulkWrite(bulkOps);
  }
  return tasks;
};

// Reusable task creation handler
export const createTaskHandler = async (req, res) => {
  try {
    const { title, description, priority, dueDate, assignedTo, status, user } = req.body;
    const boardId = req.params.id || req.body.boardId;

    if (!title) {
      return res.status(400).json({ error: 'Task title is required.' });
    }
    if (!boardId) {
      return res.status(400).json({ error: 'Board ID is required.' });
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
};

// POST /api/tasks (with boardId in body)
router.post('/', createTaskHandler);

// POST /api/tasks/boards/:id/tasks (legacy fallback)
router.post('/boards/:id/tasks', createTaskHandler);


// PUT /api/tasks/:id/move - Move task (handles reordering, cross-column, and conflicts)
router.put('/:id/move', async (req, res) => {
  try {
    const taskId = req.params.id;
    const { sourceStatus, destStatus, newPosition, user } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const boardId = task.boardId;
    const fromStatus = sourceStatus || task.status;
    const toStatus = destStatus || task.status;
    let targetIndex = Number(newPosition);

    if (isNaN(targetIndex) || targetIndex < 0) {
      targetIndex = 0;
    }

    if (fromStatus === toStatus) {
      // Reordering within the same column
      const siblingTasks = await Task.find({
        boardId,
        status: fromStatus,
        _id: { $ne: task._id }
      }).sort({ position: 1 });

      const clampedIndex = Math.min(targetIndex, siblingTasks.length);
      siblingTasks.splice(clampedIndex, 0, task);

      const bulkOps = siblingTasks.map((t, index) => ({
        updateOne: {
          filter: { _id: t._id },
          update: { position: index }
        }
      }));

      await Task.bulkWrite(bulkOps);
      task.position = clampedIndex;
    } else {
      // Moving across columns
      // 1. Remove from source and normalize source column
      const sourceTasks = await Task.find({
        boardId,
        status: fromStatus,
        _id: { $ne: task._id }
      }).sort({ position: 1 });

      const sourceOps = sourceTasks.map((t, index) => ({
        updateOne: {
          filter: { _id: t._id },
          update: { position: index }
        }
      }));
      if (sourceOps.length > 0) {
        await Task.bulkWrite(sourceOps);
      }

      // 2. Insert into destination column
      const destTasks = await Task.find({
        boardId,
        status: toStatus,
        _id: { $ne: task._id }
      }).sort({ position: 1 });

      const clampedIndex = Math.min(targetIndex, destTasks.length);
      destTasks.splice(clampedIndex, 0, task);

      const destOps = destTasks.map((t, index) => ({
        updateOne: {
          filter: { _id: t._id },
          update: {
            position: index,
            status: toStatus
          }
        }
      }));
      await Task.bulkWrite(destOps);

      task.status = toStatus;
      task.position = clampedIndex;
    }

    // Fetch refreshed list of tasks for the board to ensure sync
    const refreshedTasks = await Task.find({ boardId }).sort({ position: 1 });

    const io = req.app.get('io');
    const actor = user || { id: 'usr_actor', name: 'Collaborator' };
    const logText = fromStatus === toStatus
      ? `Reordered "${task.title}" to position #${task.position + 1} in ${toStatus}`
      : `Moved "${task.title}" from ${fromStatus} to ${toStatus}`;

    await logActivity(boardId, actor, 'TASK_MOVED', logText, task._id, io);

    if (io) {
      io.to(boardId.toString()).emit('task_moved', {
        taskId: task._id,
        boardId,
        sourceStatus: fromStatus,
        destStatus: toStatus,
        newPosition: task.position,
        tasks: refreshedTasks,
        actor
      });
    }

    res.json({
      success: true,
      task,
      tasks: refreshedTasks
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/tasks/:id - Update task details
router.put('/:id', async (req, res) => {
  try {
    const { title, description, priority, dueDate, assignedTo, status, user } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const oldStatus = task.status;
    let statusChanged = false;

    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;

    if (status !== undefined && status !== oldStatus) {
      task.status = status;
      statusChanged = true;
      // Put at bottom of new status column
      const lastTask = await Task.findOne({ boardId: task.boardId, status }).sort({ position: -1 });
      task.position = lastTask ? lastTask.position + 1 : 0;
    }

    await task.save();

    if (statusChanged) {
      await normalizeColumnPositions(task.boardId, oldStatus);
    }

    const io = req.app.get('io');
    const actor = user || { id: 'usr_actor', name: 'Collaborator' };
    await logActivity(task.boardId, actor, 'TASK_UPDATED', `Updated task details for "${task.title}"`, task._id, io);

    if (io) {
      io.to(task.boardId.toString()).emit('task_updated', {
        task,
        actor
      });
    }

    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const boardId = task.boardId;
    const taskTitle = task.title;
    const taskStatus = task.status;

    await Task.findByIdAndDelete(req.params.id);
    await normalizeColumnPositions(boardId, taskStatus);

    const io = req.app.get('io');
    const actor = req.body.user || { id: 'usr_actor', name: 'Collaborator' };
    await logActivity(boardId, actor, 'TASK_DELETED', `Deleted task "${taskTitle}" from ${taskStatus}`, req.params.id, io);

    if (io) {
      io.to(boardId.toString()).emit('task_deleted', {
        taskId: req.params.id,
        boardId,
        actor
      });
    }

    res.json({ message: 'Task deleted successfully', taskId: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/tasks/:id/comments - Add comment (Bonus)
router.post('/:id/comments', async (req, res) => {
  try {
    const { text, user } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required.' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const newComment = {
      id: `comment_${Date.now()}`,
      user: user || { id: 'usr_anon', name: 'Anonymous', avatar: '' },
      text: text.trim(),
      createdAt: new Date()
    };

    task.comments.push(newComment);
    await task.save();

    const io = req.app.get('io');
    await logActivity(task.boardId, newComment.user, 'COMMENT_ADDED', `Commented on "${task.title}": "${text.substring(0, 30)}..."`, task._id, io);

    if (io) {
      io.to(task.boardId.toString()).emit('comment_added', {
        taskId: task._id,
        comment: newComment,
        boardId: task.boardId
      });
    }

    res.status(201).json(newComment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/tasks/:id/attachments - Add file attachment (Bonus)
router.post('/:id/attachments', async (req, res) => {
  try {
    const { name, size, type, url, user } = req.body;
    if (!name || !url) {
      return res.status(400).json({ error: 'Attachment name and URL are required.' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const attachment = {
      id: `att_${Date.now()}`,
      name,
      size: size || 1024,
      type: type || 'application/octet-stream',
      url,
      uploadedBy: user?.name || 'Collaborator',
      createdAt: new Date()
    };

    task.attachments.push(attachment);
    await task.save();

    const io = req.app.get('io');
    await logActivity(task.boardId, user || { id: 'usr_actor', name: 'Collaborator' }, 'ATTACHMENT_ADDED', `Attached file "${name}" to "${task.title}"`, task._id, io);

    if (io) {
      io.to(task.boardId.toString()).emit('attachment_added', {
        taskId: task._id,
        attachment,
        boardId: task.boardId
      });
    }

    res.status(201).json(attachment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

import React, { useState } from 'react';
import { useBoard } from '../context/BoardContext';
import KanbanColumn from './KanbanColumn';
import { Loader2 } from 'lucide-react';

export default function KanbanBoard() {
  const { 
    board, 
    tasks, 
    loading, 
    error, 
    moveTask, 
    broadcastDragStart, 
    broadcastDragEnd,
    refreshBoard 
  } = useBoard();

  const [draggedTask, setDraggedTask] = useState(null);
  const [sourceColumn, setSourceColumn] = useState(null);

  if (loading && !board) {
    return (
      <div style={{
        height: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        color: 'var(--text-muted)'
      }}>
        <Loader2 size={36} className="animate-spin" color="#6366f1" />
        <p style={{ fontSize: '0.95rem', fontWeight: '500' }}>Connecting to Real-Time Kanban Board...</p>
      </div>
    );
  }

  if (error && !board) {
    return (
      <div style={{
        height: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        color: '#ef4444'
      }}>
        <p style={{ fontSize: '1rem', fontWeight: '600' }}>Error: {error}</p>
        <button
          onClick={refreshBoard}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary)',
            color: '#fff',
            fontWeight: '600'
          }}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const columns = board?.columns || [
    { id: 'Todo', title: 'To Do', color: '#64748b' },
    { id: 'In Progress', title: 'In Progress', color: '#3b82f6' },
    { id: 'Review', title: 'In Review', color: '#f59e0b' },
    { id: 'Done', title: 'Done', color: '#10b981' }
  ];

  const handleDragStart = (e, task, index) => {
    setDraggedTask(task);
    setSourceColumn(task.status);
    e.dataTransfer.setData('text/plain', task._id);
    e.dataTransfer.effectAllowed = 'move';

    // Broadcast live dragging activity to other peers!
    broadcastDragStart(task._id);

    // Apply ghost style slightly delayed so drag image stays clean
    setTimeout(() => {
      e.target.classList.add('task-dragging');
    }, 0);
  };

  const handleDragEnd = (e, task) => {
    e.target.classList.remove('task-dragging');
    broadcastDragEnd(task._id);
    setDraggedTask(null);
    setSourceColumn(null);
  };

  const handleDrop = (destStatus, targetIndex) => {
    if (!draggedTask) return;
    const fromStatus = sourceColumn || draggedTask.status;

    moveTask(draggedTask._id, fromStatus, destStatus, targetIndex);
    broadcastDragEnd(draggedTask._id);
    setDraggedTask(null);
    setSourceColumn(null);
  };

  return (
    <div style={{
      padding: '24px 28px',
      overflowX: 'auto',
      minHeight: 'calc(100vh - 150px)',
      display: 'flex',
      gap: '20px',
      alignItems: 'flex-start'
    }}>
      {columns.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.id);
        return (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={columnTasks}
            draggedTask={draggedTask}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
          />
        );
      })}
    </div>
  );
}

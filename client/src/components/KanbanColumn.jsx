import React, { useState } from 'react';
import TaskCard from './TaskCard';
import { useBoard } from '../context/BoardContext';
import { Plus, MoreHorizontal } from 'lucide-react';

export default function KanbanColumn({
  column,
  tasks,
  draggedTask,
  onDragStart,
  onDragEnd,
  onDrop
}) {
  const { setIsCreateModalOpen, setCreateDefaultStatus } = useBoard();
  const [isOver, setIsOver] = useState(false);
  const [dropIndex, setDropIndex] = useState(null);

  const sortedTasks = [...tasks].sort((a, b) => a.position - b.position);

  const getColumnColor = (id) => {
    switch (id) {
      case 'Todo':
        return '#64748b';
      case 'In Progress':
        return '#3b82f6';
      case 'Review':
        return '#f59e0b';
      case 'Done':
        return '#10b981';
      default:
        return '#6366f1';
    }
  };

  const columnColor = getColumnColor(column.id);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsOver(true);

    // Calculate nearest drop index based on mouse Y position
    const cardElements = Array.from(e.currentTarget.querySelectorAll('[data-task-card="true"]'));
    const mouseY = e.clientY;

    let targetIndex = sortedTasks.length;
    for (let i = 0; i < cardElements.length; i++) {
      const rect = cardElements[i].getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (mouseY < midY) {
        targetIndex = i;
        break;
      }
    }
    setDropIndex(targetIndex);
  };

  const handleDragLeave = (e) => {
    // Only clear if mouse is leaving the column container entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsOver(false);
      setDropIndex(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    const targetIdx = dropIndex !== null ? dropIndex : sortedTasks.length;
    setDropIndex(null);
    onDrop(column.id, targetIdx);
  };

  const handleQuickAdd = () => {
    setCreateDefaultStatus(column.id);
    setIsCreateModalOpen(true);
  };

  return (
    <div
      style={{
        flex: '1 1 300px',
        minWidth: '290px',
        maxWidth: '360px',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        height: 'calc(100vh - 160px)',
        maxHeight: '840px',
        overflow: 'hidden'
      }}
    >
      {/* Column Header */}
      <div style={{
        padding: '16px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'rgba(25, 32, 50, 0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: columnColor,
            boxShadow: `0 0 10px ${columnColor}`
          }} />
          <h3 style={{ fontSize: '0.98rem', fontWeight: '700', color: 'var(--text-main)' }}>
            {column.title || column.id}
          </h3>
          <span style={{
            fontSize: '0.74rem',
            fontWeight: '700',
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-muted)',
            padding: '2px 8px',
            borderRadius: '999px',
            border: '1px solid var(--border-color)'
          }}>
            {sortedTasks.length}
          </span>
        </div>

        <button
          onClick={handleQuickAdd}
          style={{
            padding: '4px',
            borderRadius: '6px',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'var(--transition-fast)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-main)';
            e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          title={`Add task to ${column.title}`}
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Task List / Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={isOver ? 'column-drop-active' : ''}
        style={{
          flex: 1,
          padding: '14px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          transition: 'background-color 0.15s ease'
        }}
      >
        {sortedTasks.length === 0 && !isOver && (
          <div style={{
            height: '120px',
            border: '1.5px dashed var(--border-light)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: 'var(--text-dim)',
            fontSize: '0.8rem'
          }}>
            <span>No tasks in {column.title}</span>
            <button
              onClick={handleQuickAdd}
              style={{
                fontSize: '0.75rem',
                color: 'var(--primary)',
                fontWeight: '600'
              }}
            >
              + Add a task
            </button>
          </div>
        )}

        {sortedTasks.map((task, idx) => (
          <React.Fragment key={task._id}>
            {isOver && dropIndex === idx && (
              <div className="drop-indicator animate-fade-in" />
            )}
            <div data-task-card="true">
              <TaskCard
                task={task}
                index={idx}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              />
            </div>
          </React.Fragment>
        ))}

        {isOver && dropIndex >= sortedTasks.length && (
          <div className="drop-indicator animate-fade-in" />
        )}
      </div>

      {/* Column Footer: Quick add bar */}
      <div style={{
        padding: '10px 14px',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'rgba(25, 32, 50, 0.2)'
      }}>
        <button
          onClick={handleQuickAdd}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-muted)',
            fontSize: '0.82rem',
            fontWeight: '600',
            transition: 'var(--transition-fast)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
            e.currentTarget.style.color = 'var(--text-main)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          <Plus size={15} />
          <span>Add card</span>
        </button>
      </div>
    </div>
  );
}

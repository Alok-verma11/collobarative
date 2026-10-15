import React from 'react';
import { useBoard } from '../context/BoardContext';
import { 
  Calendar, 
  MessageSquare, 
  Paperclip, 
  AlertCircle, 
  GripVertical,
  Clock
} from 'lucide-react';

export default function TaskCard({ task, index, onDragStart, onDragEnd }) {
  const { 
    setSelectedTask, 
    remoteTyping, 
    remoteDragging 
  } = useBoard();

  const isRemoteDragging = remoteDragging[task._id];
  const isRemoteTyping = remoteTyping[task._id];

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'Urgent':
        return {
          bg: 'var(--priority-urgent-bg)',
          color: 'var(--priority-urgent)',
          border: 'rgba(239, 68, 68, 0.3)'
        };
      case 'High':
        return {
          bg: 'var(--priority-high-bg)',
          color: 'var(--priority-high)',
          border: 'rgba(249, 115, 22, 0.3)'
        };
      case 'Medium':
        return {
          bg: 'var(--priority-medium-bg)',
          color: 'var(--priority-medium)',
          border: 'rgba(59, 130, 246, 0.3)'
        };
      case 'Low':
      default:
        return {
          bg: 'var(--priority-low-bg)',
          color: 'var(--priority-low)',
          border: 'rgba(16, 185, 129, 0.3)'
        };
    }
  };

  const priorityStyle = getPriorityStyle(task.priority);

  // Due date formatting and overdue check
  let isOverdue = false;
  let formattedDate = null;
  if (task.dueDate) {
    const due = new Date(task.dueDate);
    isOverdue = due < new Date() && task.status !== 'Done';
    formattedDate = due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task, index)}
      onDragEnd={(e) => onDragEnd(e, task)}
      onClick={() => setSelectedTask(task)}
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-md)',
        padding: '14px',
        border: isRemoteDragging
          ? '1.5px solid #ec4899'
          : '1px solid var(--border-color)',
        boxShadow: isRemoteDragging ? '0 0 12px rgba(236, 72, 153, 0.4)' : 'var(--shadow-sm)',
        cursor: 'grab',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.backgroundColor = 'var(--bg-card)';
        e.currentTarget.style.boxShadow = isRemoteDragging
          ? '0 0 12px rgba(236, 72, 153, 0.4)'
          : 'var(--shadow-sm)';
      }}
    >
      {/* Remote live collaborator indicator */}
      {isRemoteDragging && (
        <div style={{
          position: 'absolute',
          top: '-10px',
          right: '12px',
          backgroundColor: '#ec4899',
          color: '#ffffff',
          fontSize: '0.68rem',
          fontWeight: '700',
          padding: '2px 8px',
          borderRadius: '999px',
          boxShadow: '0 2px 6px rgba(236, 72, 153, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          zIndex: 5
        }}>
          <span>{isRemoteDragging.name || 'User'} is moving</span>
        </div>
      )}

      {/* Card Header: Priority & Drag Handle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontSize: '0.72rem',
          fontWeight: '700',
          padding: '2px 8px',
          borderRadius: '4px',
          backgroundColor: priorityStyle.bg,
          color: priorityStyle.color,
          border: `1px solid ${priorityStyle.border}`,
          letterSpacing: '0.02em',
          textTransform: 'uppercase'
        }}>
          {task.priority}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isRemoteTyping && (
            <span
              title={`${isRemoteTyping.user?.name || 'Someone'} is active`}
              style={{
                fontSize: '0.7rem',
                color: '#6366f1',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#6366f1',
                animation: 'pulseGlow 1.2s infinite'
              }} />
              Typing...
            </span>
          )}
          <GripVertical size={14} color="var(--text-dim)" />
        </div>
      </div>

      {/* Title */}
      <h4 style={{
        fontSize: '0.92rem',
        fontWeight: '600',
        color: 'var(--text-main)',
        lineHeight: 1.35
      }}>
        {task.title}
      </h4>

      {/* Description Snippet */}
      {task.description && (
        <p style={{
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {task.description}
        </p>
      )}

      {/* Footer: Due date, comments, attachments, assignee */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '4px',
        paddingTop: '8px',
        borderTop: '1px solid var(--border-color)',
        fontSize: '0.75rem',
        color: 'var(--text-dim)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Due date badge */}
          {formattedDate && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: isOverdue ? '#ef4444' : 'var(--text-muted)',
                fontWeight: isOverdue ? '600' : '400',
                backgroundColor: isOverdue ? 'rgba(239, 68, 68, 0.12)' : 'transparent',
                padding: isOverdue ? '2px 6px' : '0',
                borderRadius: '4px'
              }}
              title={isOverdue ? 'Overdue!' : `Due on ${formattedDate}`}
            >
              <Calendar size={13} color={isOverdue ? '#ef4444' : 'var(--text-muted)'} />
              <span>{formattedDate}</span>
            </div>
          )}

          {/* Comment Count */}
          {task.comments && task.comments.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }} title={`${task.comments.length} comments`}>
              <MessageSquare size={13} />
              <span>{task.comments.length}</span>
            </div>
          )}

          {/* Attachment Count */}
          {task.attachments && task.attachments.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }} title={`${task.attachments.length} attachments`}>
              <Paperclip size={13} />
              <span>{task.attachments.length}</span>
            </div>
          )}
        </div>

        {/* Assignee Avatar */}
        {task.assignedTo && task.assignedTo.name ? (
          <div
            title={`Assigned to ${task.assignedTo.name}`}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <img
              src={
                task.assignedTo.avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(task.assignedTo.name)}`
              }
              alt={task.assignedTo.name}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1.5px solid var(--border-light)',
                backgroundColor: '#334155'
              }}
            />
          </div>
        ) : (
          <div
            title="Unassigned"
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: '1px dashed var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.68rem',
              color: 'var(--text-dim)'
            }}
          >
            ?
          </div>
        )}
      </div>
    </div>
  );
}

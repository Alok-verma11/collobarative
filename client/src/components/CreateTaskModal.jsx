import React, { useState } from 'react';
import { useBoard } from '../context/BoardContext';
import { X, Plus, Calendar, User, AlignLeft, Tag } from 'lucide-react';

export default function CreateTaskModal() {
  const { 
    isCreateModalOpen, 
    setIsCreateModalOpen, 
    createDefaultStatus, 
    createTask, 
    board 
  } = useBoard();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(createDefaultStatus || 'Todo');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isCreateModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a task title.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      let assignedTo = null;
      if (assignedToId && assignedToId !== 'unassigned') {
        const found = board?.members?.find((m) => m.id === assignedToId);
        if (found) {
          assignedTo = {
            id: found.id,
            name: found.name,
            avatar: found.avatar,
            email: found.email,
            color: found.color
          };
        }
      }

      await createTask({
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedTo
      });

      // Reset and close
      setTitle('');
      setDescription('');
      setDueDate('');
      setAssignedToId('');
      setIsCreateModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '540px',
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'var(--bg-secondary)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(25, 32, 50, 0.5)'
        }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Create New Task</h3>
          <button
            onClick={() => setIsCreateModalOpen(false)}
            style={{
              padding: '6px',
              borderRadius: '6px',
              color: 'var(--text-muted)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {error && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              fontSize: '0.84rem'
            }}>
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
              Task Title *
            </label>
            <input
              type="text"
              autoFocus
              placeholder="e.g., Implement OAuth2 Authentication flow"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem',
                color: 'var(--text-main)',
                outline: 'none'
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Add key objectives, links, or notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                fontSize: '0.86rem',
                color: 'var(--text-main)',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Status & Priority Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                Column Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem'
                }}
              >
                <option value="Todo">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">In Review</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem'
                }}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Assignee & Due Date Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                Assignee
              </label>
              <select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem'
                }}
              >
                <option value="unassigned">Unassigned</option>
                {board?.members?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              style={{
                padding: '9px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
                fontWeight: '600'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 20px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: '600',
                boxShadow: 'var(--shadow-glow)'
              }}
            >
              <Plus size={16} />
              <span>{loading ? 'Creating...' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

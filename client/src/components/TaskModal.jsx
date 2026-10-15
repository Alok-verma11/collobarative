import React, { useState, useEffect } from 'react';
import { useBoard } from '../context/BoardContext';
import { 
  X, 
  Trash2, 
  Calendar, 
  User, 
  Clock, 
  MessageSquare, 
  Paperclip, 
  Send, 
  Check, 
  FileText,
  ExternalLink,
  Plus
} from 'lucide-react';

export default function TaskModal() {
  const { 
    selectedTask, 
    setSelectedTask, 
    updateTask, 
    deleteTask, 
    addComment, 
    addAttachment, 
    board, 
    currentUser,
    remoteTyping,
    broadcastTypingStart,
    broadcastTypingStop
  } = useBoard();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Todo');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newAttachmentName, setNewAttachmentName] = useState('');
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('');
  const [showAttachmentInput, setShowAttachmentInput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (selectedTask) {
      setTitle(selectedTask.title || '');
      setDescription(selectedTask.description || '');
      setStatus(selectedTask.status || 'Todo');
      setPriority(selectedTask.priority || 'Medium');
      setDueDate(selectedTask.dueDate ? selectedTask.dueDate.substring(0, 10) : '');
      setAssignedToId(selectedTask.assignedTo?.id || '');
      setShowDeleteConfirm(false);
    }
  }, [selectedTask]);

  if (!selectedTask) return null;

  const handleSaveField = async (fields) => {
    try {
      setIsSaving(true);
      await updateTask(selectedTask._id, fields);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTitleBlur = () => {
    if (title.trim() && title !== selectedTask.title) {
      handleSaveField({ title: title.trim() });
    }
  };

  const handleDescriptionBlur = () => {
    if (description !== selectedTask.description) {
      handleSaveField({ description });
    }
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    handleSaveField({ status: newStatus });
  };

  const handlePriorityChange = (newPriority) => {
    setPriority(newPriority);
    handleSaveField({ priority: newPriority });
  };

  const handleDueDateChange = (e) => {
    const val = e.target.value;
    setDueDate(val);
    handleSaveField({ dueDate: val ? new Date(val) : null });
  };

  const handleAssigneeChange = (memberId) => {
    setAssignedToId(memberId);
    if (!memberId || memberId === 'unassigned') {
      handleSaveField({
        assignedTo: { id: null, name: 'Unassigned', avatar: '', email: '' }
      });
    } else {
      const member = board?.members?.find((m) => m.id === memberId);
      if (member) {
        handleSaveField({
          assignedTo: {
            id: member.id,
            name: member.name,
            avatar: member.avatar,
            email: member.email,
            color: member.color
          }
        });
      }
    }
  };

  // Comments handler
  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
    broadcastTypingStart(selectedTask._id, 'comment');
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      broadcastTypingStop(selectedTask._id);
      await addComment(selectedTask._id, newComment.trim());
      setNewComment('');
    } catch (err) {
      console.error(err);
    }
  };

  // Attachment handler
  const handleAddAttachment = async (e) => {
    e.preventDefault();
    if (!newAttachmentName.trim() || !newAttachmentUrl.trim()) return;

    try {
      await addAttachment(selectedTask._id, {
        name: newAttachmentName.trim(),
        url: newAttachmentUrl.trim(),
        size: 154000,
        type: 'link'
      });
      setNewAttachmentName('');
      setNewAttachmentUrl('');
      setShowAttachmentInput(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    await deleteTask(selectedTask._id);
  };

  const typingOnTask = remoteTyping[selectedTask._id];

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
          maxWidth: '820px',
          maxHeight: '90vh',
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'rgba(25, 32, 50, 0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              padding: '4px 10px',
              borderRadius: '999px',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8',
              border: '1px solid rgba(99, 102, 241, 0.3)'
            }}>
              Task #{selectedTask._id.slice(-4).toUpperCase()}
            </span>

            {isSaving && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> Auto-saving...
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {showDeleteConfirm ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: '#ef4444' }}>Delete this task?</span>
                <button
                  onClick={handleDelete}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    backgroundColor: '#ef4444',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem'
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                title="Delete Task"
                style={{
                  padding: '8px',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-dim)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ef4444';
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-dim)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Trash2 size={16} />
              </button>
            )}

            <button
              onClick={() => setSelectedTask(null)}
              style={{
                padding: '8px',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-main)';
                e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 280px',
          overflowY: 'auto',
          flex: 1
        }}>
          {/* Main Content Area */}
          <div style={{ padding: '24px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Title Input */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                placeholder="Task title..."
                style={{
                  width: '100%',
                  marginTop: '6px',
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: 'var(--text-main)',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  borderBottom: '1px solid transparent',
                  padding: '4px 0'
                }}
                onFocus={(e) => (e.target.style.borderBottom = '1px solid var(--primary)')}
                onBlurCapture={(e) => (e.target.style.borderBottom = '1px solid transparent')}
              />
            </div>

            {/* Description Editor */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
                Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleDescriptionBlur}
                placeholder="Add more details, specs, or acceptance criteria..."
                style={{
                  width: '100%',
                  marginTop: '6px',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem',
                  lineHeight: 1.5,
                  resize: 'vertical',
                  outline: 'none'
                }}
              />
            </div>

            {/* Attachments Section (Bonus) */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '700' }}>
                  <Paperclip size={16} color="#06b6d4" />
                  <span>Attachments ({selectedTask.attachments?.length || 0})</span>
                </div>
                <button
                  onClick={() => setShowAttachmentInput(!showAttachmentInput)}
                  style={{
                    fontSize: '0.75rem',
                    color: '#06b6d4',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Plus size={14} /> Add File
                </button>
              </div>

              {showAttachmentInput && (
                <form onSubmit={handleAddAttachment} style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-tertiary)',
                  marginBottom: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <input
                    type="text"
                    placeholder="Attachment Title (e.g. wireframes-v1.pdf)"
                    value={newAttachmentName}
                    onChange={(e) => setNewAttachmentName(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.82rem'
                    }}
                  />
                  <input
                    type="url"
                    placeholder="File URL or Link (https://...)"
                    value={newAttachmentUrl}
                    onChange={(e) => setNewAttachmentUrl(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.82rem'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setShowAttachmentInput(false)}
                      style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '4px 10px' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        padding: '4px 12px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: '#06b6d4',
                        color: '#fff'
                      }}
                    >
                      Attach
                    </button>
                  </div>
                </form>
              )}

              {selectedTask.attachments && selectedTask.attachments.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedTask.attachments.map((att) => (
                    <div
                      key={att.id}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileText size={18} color="#06b6d4" />
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{att.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            Attached by {att.uploadedBy}
                          </div>
                        </div>
                      </div>
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: 'var(--text-muted)',
                          padding: '6px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <ExternalLink size={15} />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                  No files attached yet.
                </div>
              )}
            </div>

            {/* Comments Thread (Bonus) */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '0.85rem', fontWeight: '700' }}>
                <MessageSquare size={16} color="#8b5cf6" />
                <span>Comments ({selectedTask.comments?.length || 0})</span>
              </div>

              {/* Typing indicator */}
              {typingOnTask && (
                <div style={{
                  fontSize: '0.75rem',
                  color: '#8b5cf6',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#8b5cf6',
                    animation: 'pulseGlow 1.2s infinite'
                  }} />
                  {typingOnTask.user?.name || 'A teammate'} is typing...
                </div>
              )}

              {/* Comments list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                {selectedTask.comments && selectedTask.comments.length > 0 ? (
                  selectedTask.comments.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        display: 'flex',
                        gap: '12px',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      <img
                        src={c.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.user?.name}`}
                        alt={c.user?.name}
                        style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-main)' }}>
                            {c.user?.name}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                            {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                          {c.text}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                    No comments yet. Start the conversation!
                  </div>
                )}
              </div>

              {/* Add comment input */}
              <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={handleCommentChange}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.84rem'
                  }}
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: newComment.trim() ? 'var(--primary)' : 'var(--bg-tertiary)',
                    color: newComment.trim() ? '#ffffff' : 'var(--text-dim)',
                    cursor: newComment.trim() ? 'pointer' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          </div>

          {/* Right Sidebar: Metadata & Controls */}
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: 'rgba(17, 22, 34, 0.4)' }}>
            {/* Status Select */}
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                Status
              </label>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.84rem'
                }}
              >
                <option value="Todo">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">In Review</option>
                <option value="Done">Done</option>
              </select>
            </div>

            {/* Priority Select */}
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => handlePriorityChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.84rem'
                }}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            {/* Assignee Select */}
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                Assignee
              </label>
              <select
                value={assignedToId}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.84rem'
                }}
              >
                <option value="unassigned">Unassigned</option>
                {board?.members?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date Picker */}
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={handleDueDateChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.84rem'
                }}
              />
            </div>

            {/* Timestamps */}
            <div style={{
              marginTop: 'auto',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-color)',
              fontSize: '0.72rem',
              color: 'var(--text-dim)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div>Created: {new Date(selectedTask.createdAt || Date.now()).toLocaleDateString()}</div>
              <div>Updated: {new Date(selectedTask.updatedAt || Date.now()).toLocaleTimeString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

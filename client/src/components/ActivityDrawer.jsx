import React from 'react';
import { useBoard } from '../context/BoardContext';
import { 
  X, 
  History, 
  ArrowRight, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  MessageSquare, 
  Paperclip, 
  UserPlus,
  Clock
} from 'lucide-react';

export default function ActivityDrawer() {
  const { isActivityOpen, setIsActivityOpen, activities, board } = useBoard();

  if (!isActivityOpen) return null;

  const getActionIcon = (action) => {
    switch (action) {
      case 'TASK_CREATED':
        return <PlusCircle size={15} color="#10b981" />;
      case 'TASK_MOVED':
        return <ArrowRight size={15} color="#3b82f6" />;
      case 'TASK_UPDATED':
        return <Edit3 size={15} color="#06b6d4" />;
      case 'TASK_DELETED':
        return <Trash2 size={15} color="#ef4444" />;
      case 'COMMENT_ADDED':
        return <MessageSquare size={15} color="#ec4899" />;
      case 'ATTACHMENT_ADDED':
        return <Paperclip size={15} color="#f59e0b" />;
      case 'MEMBER_INVITED':
        return <UserPlus size={15} color="#8b5cf6" />;
      default:
        return <History size={15} color="#6366f1" />;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(4px)',
      zIndex: 100,
      display: 'flex',
      justifyContent: 'flex-end'
    }}>
      <div
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '420px',
          height: '100%',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          borderLeft: '1px solid var(--border-color)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'rgba(25, 32, 50, 0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <History size={18} color="#f59e0b" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>Activity Timeline</h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Live audit history</p>
            </div>
          </div>
          <button
            onClick={() => setIsActivityOpen(false)}
            style={{ padding: '6px', borderRadius: '6px', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Timeline list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {activities.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: 'var(--text-dim)',
              marginTop: '40px',
              fontSize: '0.85rem'
            }}>
              No activity logged yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', position: 'relative' }}>
              {/* Timeline continuous vertical line */}
              <div style={{
                position: 'absolute',
                top: '12px',
                bottom: '12px',
                left: '15px',
                width: '2px',
                backgroundColor: 'var(--border-color)',
                zIndex: 1
              }} />

              {activities.map((act) => (
                <div
                  key={act._id || act.timestamp}
                  style={{
                    display: 'flex',
                    gap: '14px',
                    position: 'relative',
                    zIndex: 2
                  }}
                >
                  {/* Icon badge */}
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1.5px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {getActionIcon(act.action)}
                  </div>

                  {/* Activity Details Card */}
                  <div style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-main)' }}>
                        {act.user?.name || 'User'}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Clock size={11} />
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      {act.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

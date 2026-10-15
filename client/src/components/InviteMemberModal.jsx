import React, { useState } from 'react';
import { useBoard } from '../context/BoardContext';
import { X, UserPlus, Mail, User, ShieldCheck } from 'lucide-react';

export default function InviteMemberModal() {
  const { isInviteOpen, setIsInviteOpen, inviteMember, board } = useBoard();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Frontend Engineer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isInviteOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Please provide both name and email.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await inviteMember({
        name: name.trim(),
        email: email.trim(),
        role: role.trim(),
        color: '#8b5cf6'
      });

      setSuccess(`Successfully invited ${name}!`);
      setTimeout(() => {
        setName('');
        setEmail('');
        setSuccess('');
        setIsInviteOpen(false);
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to invite member');
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
          maxWidth: '480px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(139, 92, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UserPlus size={18} color="#8b5cf6" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Invite Collaborator</h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Add team member to this board</p>
            </div>
          </div>
          <button
            onClick={() => setIsInviteOpen(false)}
            style={{ padding: '6px', borderRadius: '6px', color: 'var(--text-muted)' }}
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

          {success && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              fontSize: '0.84rem'
            }}>
              {success}
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
              Full Name *
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                autoFocus
                placeholder="e.g. Jordan Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.88rem',
                  color: 'var(--text-main)',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
              Email Address *
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                placeholder="jordan@company.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.88rem',
                  color: 'var(--text-main)',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
              Role
            </label>
            <div style={{ position: 'relative' }}>
              <ShieldCheck size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.88rem',
                  color: 'var(--text-main)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="Frontend Engineer">Frontend Engineer</option>
                <option value="Backend Engineer">Backend Engineer</option>
                <option value="Full Stack Dev">Full Stack Dev</option>
                <option value="UI/UX Designer">UI/UX Designer</option>
                <option value="Product Manager">Product Manager</option>
                <option value="QA Engineer">QA Engineer</option>
                <option value="DevOps Lead">DevOps Lead</option>
              </select>
            </div>
          </div>

          {/* Current Members preview */}
          <div style={{
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '8px' }}>
              Current Board Members ({board?.members?.length || 0})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {board?.members?.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 8px',
                    borderRadius: '999px',
                    backgroundColor: 'var(--bg-input)',
                    fontSize: '0.75rem'
                  }}
                >
                  <img src={m.avatar} alt={m.name} style={{ width: '18px', height: '18px', borderRadius: '50%' }} />
                  <span>{m.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button
              type="button"
              onClick={() => setIsInviteOpen(false)}
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
                backgroundColor: '#8b5cf6',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: '600',
                boxShadow: '0 0 14px rgba(139, 92, 246, 0.35)'
              }}
            >
              <UserPlus size={16} />
              <span>{loading ? 'Inviting...' : 'Send Invite'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useBoard, DEFAULT_USERS } from '../context/BoardContext';
import { 
  Users, 
  Plus, 
  BarChart3, 
  History, 
  Sun, 
  Moon, 
  Wifi, 
  WifiOff, 
  UserPlus, 
  Kanban,
  CheckCircle2,
  ChevronDown,
  LogOut
} from 'lucide-react';

export default function Header() {
  const { 
    board, 
    connectionStatus, 
    onlineMembers, 
    currentUser, 
    switchUser, 
    logout,
    setIsCreateModalOpen,
    setIsAnalyticsOpen,
    setIsActivityOpen,
    setIsInviteOpen,
    theme,
    toggleTheme
  } = useBoard();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="glass-panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      padding: '14px 28px',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '20px',
      flexWrap: 'wrap'
    }}>
      {/* Brand & Board Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
        }}>
          <Kanban size={22} color="#ffffff" />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.02em' }}>
              {board?.title || 'SyncBoard Kanban'}
            </h1>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: '600',
              padding: '2px 8px',
              borderRadius: '999px',
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8',
              border: '1px solid rgba(99, 102, 241, 0.3)'
            }}>
              MERN + Socket.IO
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '2px' }}>
            {/* Live Socket Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
              {connectionStatus === 'connected' ? (
                <>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    boxShadow: '0 0 8px #10b981',
                    display: 'inline-block'
                  }} />
                  <span style={{ color: '#10b981', fontWeight: '500' }}>Live Synced</span>
                </>
              ) : (
                <>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#f59e0b',
                    display: 'inline-block'
                  }} />
                  <span style={{ color: '#f59e0b', fontWeight: '500' }}>Reconnecting...</span>
                </>
              )}
            </div>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>•</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              Real-time multi-client enabled
            </span>
          </div>
        </div>
      </div>

      {/* Online presence & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        {/* Active Online Members Avatars */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-secondary)',
          padding: '4px 12px 4px 8px',
          borderRadius: '999px',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', marginLeft: '4px' }}>
            {onlineMembers.length > 0 ? (
              onlineMembers.map((m, idx) => (
                <div
                  key={m.socketId || idx}
                  title={`${m.name} (Online)`}
                  style={{
                    position: 'relative',
                    marginLeft: idx > 0 ? '-10px' : '0',
                    zIndex: 10 - idx
                  }}
                >
                  <img
                    src={m.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name}`}
                    alt={m.name}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      border: '2px solid var(--bg-secondary)',
                      objectFit: 'cover',
                      backgroundColor: '#334155'
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    border: '1.5px solid var(--bg-secondary)'
                  }} />
                </div>
              ))
            ) : (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Connecting presence...</span>
            )}
          </div>
          <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-muted)' }}>
            {onlineMembers.length} Online
          </span>
        </div>

        {/* Persona Switcher (For testing multi-user collaboration seamlessly!) */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              fontSize: '0.82rem',
              fontWeight: '500',
              transition: 'var(--transition-fast)'
            }}
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <span>{currentUser.name}</span>
            <span style={{
              fontSize: '0.7rem',
              padding: '1px 6px',
              borderRadius: '4px',
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              color: '#a5b4fc'
            }}>
              {currentUser.role}
            </span>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {isUserMenuOpen && (
            <div
              className="glass-panel animate-fade-in"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '260px',
                borderRadius: 'var(--radius-md)',
                padding: '10px',
                zIndex: 50,
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              {/* Current signed in account badge */}
              <div style={{
                padding: '8px 10px 10px',
                borderBottom: '1px solid var(--border-color)',
                marginBottom: '8px'
              }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase' }}>
                  Signed in as
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-main)', marginTop: '2px' }}>
                  {currentUser.name}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentUser.email || 'user@company.io'}
                </div>
              </div>

              <div style={{
                fontSize: '0.7rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                color: 'var(--text-dim)',
                padding: '4px 10px',
                letterSpacing: '0.05em'
              }}>
                Switch Persona (Demo)
              </div>
              {DEFAULT_USERS.map((user) => (
                <div
                  key={user.id}
                  onClick={() => {
                    switchUser(user);
                    setIsUserMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    background: currentUser.id === user.id || currentUser.email === user.email ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    transition: 'var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    if (currentUser.id !== user.id && currentUser.email !== user.email) {
                      e.currentTarget.style.background = 'var(--bg-tertiary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentUser.id !== user.id && currentUser.email !== user.email) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img
                      src={user.avatar}
                      alt={user.name}
                      style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: '600' }}>{user.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{user.role}</div>
                    </div>
                  </div>
                  {(currentUser.id === user.id || currentUser.email === user.email) && (
                    <CheckCircle2 size={16} color="#6366f1" />
                  )}
                </div>
              ))}

              {/* Log Out Option */}
              <div style={{
                marginTop: '8px',
                paddingTop: '8px',
                borderTop: '1px solid var(--border-color)'
              }}>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    if (logout) logout();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    color: '#f87171',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <LogOut size={15} />
                  <span>Log Out (लॉग आउट)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Invite Member Button */}
        <button
          onClick={() => setIsInviteOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 12px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            fontSize: '0.82rem',
            fontWeight: '500',
            transition: 'var(--transition-fast)'
          }}
          title="Invite Board Member"
        >
          <UserPlus size={15} color="#8b5cf6" />
          <span className="hide-on-mobile">Invite</span>
        </button>

        {/* Analytics Modal Trigger */}
        <button
          onClick={() => setIsAnalyticsOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 12px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            fontSize: '0.82rem',
            fontWeight: '500',
            transition: 'var(--transition-fast)'
          }}
          title="View Board Analytics"
        >
          <BarChart3 size={15} color="#06b6d4" />
          <span className="hide-on-mobile">Analytics</span>
        </button>

        {/* Activity Timeline Trigger */}
        <button
          onClick={() => setIsActivityOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 12px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            fontSize: '0.82rem',
            fontWeight: '500',
            transition: 'var(--transition-fast)'
          }}
          title="Live Activity Timeline"
        >
          <History size={15} color="#f59e0b" />
          <span className="hide-on-mobile">Activity</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            padding: '8px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={16} color="#fbbf24" /> : <Moon size={16} color="#6366f1" />}
        </button>

        {/* Create Task Button */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color: '#ffffff',
            fontSize: '0.85rem',
            fontWeight: '600',
            boxShadow: 'var(--shadow-glow)',
            transition: 'var(--transition-fast)'
          }}
        >
          <Plus size={16} />
          <span>New Task</span>
        </button>
      </div>
    </header>
  );
}

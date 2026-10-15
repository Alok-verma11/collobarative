import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BoardProvider, useBoard } from './context/BoardContext';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import KanbanBoard from './components/KanbanBoard';
import TaskModal from './components/TaskModal';
import CreateTaskModal from './components/CreateTaskModal';
import AnalyticsModal from './components/AnalyticsModal';
import ActivityDrawer from './components/ActivityDrawer';
import InviteMemberModal from './components/InviteMemberModal';
import AuthPage from './components/AuthPage';
import { WifiOff, Kanban } from 'lucide-react';

function KanbanAppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const { connectionStatus, theme, toggleTheme } = useBoard();

  // Loading state when validating JWT / session
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        gap: '16px'
      }}>
        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 24px rgba(99, 102, 241, 0.5)',
          animation: 'pulseGlow 1.5s infinite ease-in-out'
        }}>
          <Kanban size={28} color="#ffffff" />
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>
          Initializing SyncBoard Workspace...
        </div>
      </div>
    );
  }

  // If not logged in, show the Login / Signup Page
  if (!isAuthenticated) {
    return <AuthPage theme={theme} toggleTheme={toggleTheme} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Reconnect notification if offline */}
      {connectionStatus === 'disconnected' && (
        <div style={{
          backgroundColor: '#ef4444',
          color: '#ffffff',
          fontSize: '0.8rem',
          fontWeight: '600',
          padding: '6px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          zIndex: 999
        }}>
          <WifiOff size={14} />
          <span>Real-time connection lost. Attempting auto-reconnection...</span>
        </div>
      )}

      {/* Main UI */}
      <Header />
      <FilterBar />
      <main style={{ flex: 1 }}>
        <KanbanBoard />
      </main>

      {/* Modals & Drawers */}
      <TaskModal />
      <CreateTaskModal />
      <AnalyticsModal />
      <ActivityDrawer />
      <InviteMemberModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BoardProvider>
        <KanbanAppContent />
      </BoardProvider>
    </AuthProvider>
  );
}

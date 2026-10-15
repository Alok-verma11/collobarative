import React from 'react';
import { useBoard } from '../context/BoardContext';
import { X, BarChart3, CheckCircle2, Clock, AlertTriangle, Layers, Users } from 'lucide-react';

export default function AnalyticsModal() {
  const { isAnalyticsOpen, setIsAnalyticsOpen, rawTasks, board } = useBoard();

  if (!isAnalyticsOpen) return null;

  const totalTasks = rawTasks.length;
  const statusCounts = {
    Todo: rawTasks.filter((t) => t.status === 'Todo').length,
    'In Progress': rawTasks.filter((t) => t.status === 'In Progress').length,
    Review: rawTasks.filter((t) => t.status === 'Review').length,
    Done: rawTasks.filter((t) => t.status === 'Done').length
  };

  const priorityCounts = {
    Urgent: rawTasks.filter((t) => t.priority === 'Urgent').length,
    High: rawTasks.filter((t) => t.priority === 'High').length,
    Medium: rawTasks.filter((t) => t.priority === 'Medium').length,
    Low: rawTasks.filter((t) => t.priority === 'Low').length
  };

  const now = new Date();
  const overdueCount = rawTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'Done'
  ).length;

  const completionRate = totalTasks > 0 ? Math.round((statusCounts.Done / totalTasks) * 100) : 0;

  // Workload per member
  const memberWorkload = {};
  rawTasks.forEach((t) => {
    const name = t.assignedTo?.name || 'Unassigned';
    memberWorkload[name] = (memberWorkload[name] || 0) + 1;
  });

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
          maxWidth: '720px',
          maxHeight: '85vh',
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 24px',
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
              backgroundColor: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BarChart3 size={18} color="#06b6d4" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Board Analytics & Health</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Live metrics for {board?.title}</p>
            </div>
          </div>
          <button
            onClick={() => setIsAnalyticsOpen(false)}
            style={{ padding: '6px', borderRadius: '6px', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Key Metric KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '700' }}>
                Total Tasks
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '6px' }}>{totalTasks}</div>
            </div>

            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '700' }}>
                Completion Rate
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '6px', color: '#10b981' }}>
                {completionRate}%
              </div>
            </div>

            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '700' }}>
                In Progress
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '6px', color: '#3b82f6' }}>
                {statusCounts['In Progress']}
              </div>
            </div>

            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '700' }}>
                Overdue
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '6px', color: overdueCount > 0 ? '#ef4444' : '#10b981' }}>
                {overdueCount}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.82rem', fontWeight: '600' }}>
              <span>Sprint Progress ({statusCounts.Done} of {totalTasks} completed)</span>
              <span style={{ color: '#10b981' }}>{completionRate}%</span>
            </div>
            <div style={{
              height: '10px',
              width: '100%',
              borderRadius: '999px',
              backgroundColor: 'var(--bg-input)',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${completionRate}%`,
                background: 'linear-gradient(90deg, #6366f1, #10b981)',
                borderRadius: '999px',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>

          {/* Status Breakdown & Priority Breakdown side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Column Distribution */}
            <div style={{
              padding: '18px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)'
            }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} color="#6366f1" /> Column Status Breakdown
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(statusCounts).map(([statusName, count]) => {
                  const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                  return (
                    <div key={statusName}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                        <span>{statusName}</span>
                        <span style={{ fontWeight: '700' }}>{count} ({pct}%)</span>
                      </div>
                      <div style={{ height: '6px', borderRadius: '999px', backgroundColor: 'var(--bg-input)', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${pct}%`,
                          backgroundColor:
                            statusName === 'Done' ? '#10b981' :
                            statusName === 'Review' ? '#f59e0b' :
                            statusName === 'In Progress' ? '#3b82f6' : '#64748b'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Priority Distribution */}
            <div style={{
              padding: '18px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)'
            }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} color="#f59e0b" /> Priority Distribution
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(priorityCounts).map(([pName, count]) => {
                  const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                  return (
                    <div key={pName}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                        <span>{pName}</span>
                        <span style={{ fontWeight: '700' }}>{count} ({pct}%)</span>
                      </div>
                      <div style={{ height: '6px', borderRadius: '999px', backgroundColor: 'var(--bg-input)', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${pct}%`,
                          backgroundColor:
                            pName === 'Urgent' ? '#ef4444' :
                            pName === 'High' ? '#f97316' :
                            pName === 'Medium' ? '#3b82f6' : '#10b981'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Member Workload */}
          <div style={{
            padding: '18px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)'
          }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={16} color="#8b5cf6" /> Member Workload
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              {Object.entries(memberWorkload).map(([memberName, count]) => (
                <div
                  key={memberName}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <span style={{ fontSize: '0.82rem', fontWeight: '600' }}>{memberName}</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)' }}>
                    {count} {count === 1 ? 'task' : 'tasks'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

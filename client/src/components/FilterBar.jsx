import React from 'react';
import { useBoard } from '../context/BoardContext';
import { Search, Filter, Calendar, User, X, Flame } from 'lucide-react';

export default function FilterBar() {
  const { filters, setFilters, board, tasks, rawTasks } = useBoard();

  const priorities = ['all', 'Urgent', 'High', 'Medium', 'Low'];
  const dateOptions = [
    { id: 'all', label: 'Any Date' },
    { id: 'overdue', label: '⚠️ Overdue' },
    { id: 'today', label: '📅 Due Today' },
    { id: 'week', label: '🗓️ Due This Week' }
  ];

  const hasActiveFilters =
    filters.search !== '' ||
    filters.priority !== 'all' ||
    filters.member !== 'all' ||
    filters.date !== 'all';

  const resetFilters = () => {
    setFilters({
      search: '',
      priority: 'all',
      member: 'all',
      date: 'all'
    });
  };

  return (
    <div style={{
      padding: '16px 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      flexWrap: 'wrap',
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'rgba(17, 22, 34, 0.4)'
    }}>
      {/* Search Input & Quick Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 320px', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{
          position: 'relative',
          flex: '1 1 200px',
          minWidth: '220px',
          maxWidth: '340px'
        }}>
          <Search
            size={16}
            color="var(--text-dim)"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              fontSize: '0.84rem',
              color: 'var(--text-main)',
              outline: 'none',
              transition: 'var(--transition-fast)'
            }}
          />
          {filters.search && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-dim)'
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Priority Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', padding: '2px 0' }}>
          {priorities.map((p) => {
            const isActive = filters.priority === p;
            return (
              <button
                key={p}
                onClick={() => setFilters((prev) => ({ ...prev, priority: p }))}
                style={{
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  padding: '5px 12px',
                  borderRadius: '999px',
                  border: isActive ? '1px solid transparent' : '1px solid var(--border-color)',
                  background: isActive
                    ? p === 'Urgent'
                      ? 'var(--priority-urgent)'
                      : p === 'High'
                      ? 'var(--priority-high)'
                      : p === 'Medium'
                      ? 'var(--priority-medium)'
                      : p === 'Low'
                      ? 'var(--priority-low)'
                      : 'var(--primary)'
                    : 'var(--bg-secondary)',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                  whiteSpace: 'nowrap'
                }}
              >
                {p === 'all' ? 'All Priorities' : p}
              </button>
            );
          })}
        </div>
      </div>

      {/* Member and Date Selectors */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {/* Member Select */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <User size={14} color="var(--text-dim)" style={{ position: 'absolute', left: '10px', pointerEvents: 'none' }} />
          <select
            value={filters.member}
            onChange={(e) => setFilters((prev) => ({ ...prev, member: e.target.value }))}
            style={{
              padding: '6px 12px 6px 30px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              fontSize: '0.8rem',
              color: 'var(--text-main)',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="all">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {board?.members?.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Calendar size={14} color="var(--text-dim)" style={{ position: 'absolute', left: '10px', pointerEvents: 'none' }} />
          <select
            value={filters.date}
            onChange={(e) => setFilters((prev) => ({ ...prev, date: e.target.value }))}
            style={{
              padding: '6px 12px 6px 30px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              fontSize: '0.8rem',
              color: 'var(--text-main)',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {dateOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters button */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 10px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              fontSize: '0.78rem',
              fontWeight: '600',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}
          >
            <X size={12} />
            <span>Reset</span>
          </button>
        )}

        {/* Count Pill */}
        <div style={{
          fontSize: '0.78rem',
          color: 'var(--text-dim)',
          marginLeft: '4px'
        }}>
          Showing <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>{tasks.length}</span> of {rawTasks.length} tasks
        </div>
      </div>
    </div>
  );
}

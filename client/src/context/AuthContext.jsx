import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const DEFAULT_DEMO_USERS = [
  {
    id: 'usr_alex',
    name: 'Alex Rivera',
    email: 'alex@company.io',
    role: 'Tech Lead',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    color: '#6366f1'
  },
  {
    id: 'usr_sarah',
    name: 'Sarah Chen',
    email: 'sarah@company.io',
    role: 'Product Lead',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    color: '#ec4899'
  },
  {
    id: 'usr_vikram',
    name: 'Vikram Patel',
    email: 'vikram@company.io',
    role: 'Full Stack Dev',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    color: '#3b82f6'
  },
  {
    id: 'usr_priya',
    name: 'Priya Sharma',
    email: 'priya@company.io',
    role: 'QA Engineer',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    color: '#10b981'
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('kanban_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('kanban_token') || null;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [demoUsers, setDemoUsers] = useState(DEFAULT_DEMO_USERS);

  // Fetch demo users from backend
  useEffect(() => {
    fetch('/api/auth/demo-users')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setDemoUsers(data);
        }
      })
      .catch((err) => console.log('Using default demo users fallback', err));
  }, []);

  // Verify stored token on initial load
  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('kanban_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${storedToken}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          localStorage.setItem('kanban_user', JSON.stringify(data.user));
          localStorage.setItem('kanban_active_user', JSON.stringify(data.user));
        } else {
          // Token is expired or invalid
          console.warn('Session expired. Logging out.');
          logout();
        }
      } catch (err) {
        console.error('Auth verification error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    verifyUser();
  }, []);

  // Login method
  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('kanban_token', data.token);
      localStorage.setItem('kanban_user', JSON.stringify(data.user));
      localStorage.setItem('kanban_active_user', JSON.stringify(data.user));

      return data.user;
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  };

  // Register method
  const register = async (userData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed. Please try again.');
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('kanban_token', data.token);
      localStorage.setItem('kanban_user', JSON.stringify(data.user));
      localStorage.setItem('kanban_active_user', JSON.stringify(data.user));

      return data.user;
    } catch (err) {
      console.error('Registration error:', err);
      throw err;
    }
  };

  // Demo Login shortcut
  const demoLogin = async (email) => {
    return login(email, 'password123');
  };

  // Logout method
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('kanban_token');
    localStorage.removeItem('kanban_user');
    localStorage.removeItem('kanban_active_user');
  };

  // Switch to another persona (useful for instant demo multi-user testing)
  const switchAccount = async (targetUser) => {
    try {
      // If user has demo email, log in via API to get real token
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetUser.email, password: 'password123' })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('kanban_token', data.token);
        localStorage.setItem('kanban_user', JSON.stringify(data.user));
        localStorage.setItem('kanban_active_user', JSON.stringify(data.user));
      } else {
        // Fallback to local switch
        setUser(targetUser);
        localStorage.setItem('kanban_user', JSON.stringify(targetUser));
        localStorage.setItem('kanban_active_user', JSON.stringify(targetUser));
      }
    } catch {
      setUser(targetUser);
      localStorage.setItem('kanban_user', JSON.stringify(targetUser));
      localStorage.setItem('kanban_active_user', JSON.stringify(targetUser));
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    register,
    demoLogin,
    logout,
    switchAccount,
    demoUsers
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

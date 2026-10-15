import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Kanban, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Zap, 
  Users, 
  ShieldCheck, 
  Sun, 
  Moon,
  Briefcase
} from 'lucide-react';

const PRESET_ROLES = [
  'Full Stack Dev',
  'Tech Lead',
  'Product Lead',
  'UI/UX Designer',
  'QA Engineer',
  'DevOps Specialist'
];

const PRESET_COLORS = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#06b6d4'  // Cyan
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80'
];

export default function AuthPage({ theme, toggleTheme }) {
  const { login, register, demoLogin, demoUsers } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupRole, setSignupRole] = useState(PRESET_ROLES[0]);
  const [signupColor, setSignupColor] = useState(PRESET_COLORS[0]);
  const [signupAvatar, setSignupAvatar] = useState(PRESET_AVATARS[0]);

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      await login(loginEmail.trim(), loginPassword.trim());
      setSuccessMessage('Login successful! Redirecting to board...');
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Signup Submit
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (signupPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    try {
      setSubmitting(true);
      const generatedAvatar = signupAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(signupName.trim())}`;
      await register({
        name: signupName.trim(),
        email: signupEmail.trim(),
        password: signupPassword.trim(),
        role: signupRole,
        color: signupColor,
        avatar: generatedAvatar
      });
      setSuccessMessage('Account created! Welcome to SyncBoard.');
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // 1-Click Demo Login
  const handleDemoClick = async (email) => {
    setErrorMessage('');
    try {
      setSubmitting(true);
      await demoLogin(email);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to login with demo user.');
    } finally {
      setSubmitting(false);
    }
  };

  // Password strength checker helper
  const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) || /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const passwordStrength = getPasswordStrength(signupPassword);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      background: 'var(--bg-primary)',
      overflowX: 'hidden'
    }}>
      {/* Background ambient decorative glows */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(99, 102, 241, 0) 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 0,
        filter: 'blur(40px)'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '0%',
        right: '5%',
        width: '550px',
        height: '550px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0) 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 0,
        filter: 'blur(50px)'
      }} />

      {/* Top Navbar */}
      <header style={{
        padding: '20px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.45)'
          }}>
            <Kanban size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
                SyncBoard
              </span>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '999px',
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#818cf8',
                border: '1px solid rgba(99, 102, 241, 0.3)'
              }}>
                v2.0 Real-Time
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Collaborative MERN + Socket.IO Workspace
            </p>
          </div>
        </div>

        {/* Theme toggle */}
        {toggleTheme && (
          <button
            onClick={toggleTheme}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
            title="Toggle Light / Dark mode"
          >
            {theme === 'dark' ? <Sun size={15} color="#fbbf24" /> : <Moon size={15} color="#6366f1" />}
            <span style={{ fontSize: '0.78rem' }}>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 24px 60px',
        zIndex: 10
      }}>
        <div style={{
          width: '100%',
          maxWidth: '1060px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '36px',
          alignItems: 'center'
        }}>

          {/* Left Column: Visual Showcase & Benefits */}
          <div style={{ padding: '16px 12px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '999px',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              color: '#818cf8',
              fontSize: '0.8rem',
              fontWeight: '600',
              marginBottom: '20px'
            }}>
              <Sparkles size={14} />
              <span>Full-Stack Agile Sprint Management</span>
            </div>

            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              lineHeight: 1.18,
              letterSpacing: '-0.03em',
              marginBottom: '16px'
            }}>
              Work together seamlessly in <span style={{
                background: 'linear-gradient(135deg, #818cf8, #c084fc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>Real-Time</span>.
            </h1>

            <p style={{
              fontSize: '1rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              marginBottom: '32px',
              maxWidth: '460px'
            }}>
              Sign in or create an account to access synchronized kanban boards, live member presence radar, drag-and-drop task pipelines, and instant activity audits.
            </p>

            {/* Feature badges list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981'
                }}>
                  <Zap size={17} />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>Bi-Directional WebSockets</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Card updates and column reordering sync instantly across all clients.</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#818cf8'
                }}>
                  <Users size={17} />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>Live Presence & Remote Dragging Radar</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>See who is online and watch collaborator cards move live in real time.</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f59e0b'
                }}>
                  <ShieldCheck size={17} />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>JWT Secure Authentication</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Bcrypt password protection with persistent sessions and role management.</div>
                </div>
              </div>
            </div>

            {/* Quick 1-Click Demo Accounts Showcase */}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 18px',
              maxWidth: '460px'
            }}>
              <div style={{
                fontSize: '0.78rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-dim)',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>⚡ Instant 1-Click Demo Logins</span>
                <span style={{ fontSize: '0.7rem', color: '#818cf8', fontWeight: '500' }}>No typing required</span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px'
              }}>
                {demoUsers.slice(0, 4).map((du) => (
                  <button
                    key={du.email}
                    onClick={() => handleDemoClick(du.email)}
                    disabled={submitting}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-main)',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      cursor: submitting ? 'not-allowed' : 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = du.color || '#6366f1';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <img
                      src={du.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${du.name}`}
                      alt={du.name}
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: '600', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {du.name.split(' ')[0]}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {du.role}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: The Auth Card (Login & Signup Tabs) */}
          <div style={{
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-xl)',
            padding: '32px 36px',
            boxShadow: 'var(--shadow-lg), 0 0 30px rgba(99, 102, 241, 0.12)',
            position: 'relative'
          }}>

            {/* Tab switch pills */}
            <div style={{
              display: 'flex',
              background: 'var(--bg-secondary)',
              padding: '4px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              marginBottom: '26px'
            }}>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                style={{
                  flex: 1,
                  padding: '9px 16px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.86rem',
                  fontWeight: mode === 'login' ? '700' : '500',
                  color: mode === 'login' ? '#ffffff' : 'var(--text-muted)',
                  background: mode === 'login' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
                  boxShadow: mode === 'login' ? '0 2px 8px rgba(99, 102, 241, 0.4)' : 'none',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
              >
                Sign In (लॉग इन)
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                style={{
                  flex: 1,
                  padding: '9px 16px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.86rem',
                  fontWeight: mode === 'signup' ? '700' : '500',
                  color: mode === 'signup' ? '#ffffff' : 'var(--text-muted)',
                  background: mode === 'signup' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
                  boxShadow: mode === 'signup' ? '0 2px 8px rgba(99, 102, 241, 0.4)' : 'none',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
              >
                Create Account (साइन अप)
              </button>
            </div>

            {/* Error Message banner */}
            {errorMessage && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#f87171',
                fontSize: '0.82rem'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Message banner */}
            {successMessage && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#34d399',
                fontSize: '0.82rem'
              }}>
                <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                <span>{successMessage}</span>
              </div>
            )}

            {/* ---------------- LOGIN FORM ---------------- */}
            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    marginBottom: '7px',
                    color: 'var(--text-main)'
                  }}>
                    Email Address
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    transition: 'border-color 0.2s'
                  }}>
                    <Mail size={16} color="var(--text-dim)" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="alex@company.io"
                      required
                      autoFocus
                      style={{
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        flex: 1,
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                    <label style={{
                      fontSize: '0.82rem',
                      fontWeight: '600',
                      color: 'var(--text-main)'
                    }}>
                      Password
                    </label>
                    <span style={{ fontSize: '0.74rem', color: '#818cf8', cursor: 'pointer' }} onClick={() => {
                      setLoginEmail('alex@company.io');
                      setLoginPassword('password123');
                    }}>
                      Fill demo password
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px'
                  }}>
                    <Lock size={16} color="var(--text-dim)" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      style={{
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        flex: 1,
                        fontSize: '0.9rem'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      style={{ color: 'var(--text-dim)', padding: 0 }}
                      title={showLoginPassword ? 'Hide password' : 'Show password'}
                    >
                      {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)'
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked style={{ accentColor: '#6366f1' }} />
                    <span>Remember my session</span>
                  </label>
                  <span>Default password: <code>password123</code></span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    marginTop: '8px',
                    padding: '12px 20px',
                    borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    color: '#ffffff',
                    fontSize: '0.92rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: 'var(--shadow-glow)',
                    transition: 'all 0.2s ease',
                    opacity: submitting ? 0.7 : 1,
                    cursor: submitting ? 'wait' : 'pointer'
                  }}
                >
                  <span>{submitting ? 'Authenticating...' : 'Sign In to Workspace'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            ) : (
              /* ---------------- SIGNUP FORM ---------------- */
              <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    marginBottom: '6px',
                    color: 'var(--text-main)'
                  }}>
                    Full Name *
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '9px 14px'
                  }}>
                    <User size={16} color="var(--text-dim)" />
                    <input
                      type="text"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="e.g. Rahul Verma"
                      required
                      autoFocus
                      style={{
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        flex: 1,
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    marginBottom: '6px',
                    color: 'var(--text-main)'
                  }}>
                    Work Email *
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '9px 14px'
                  }}>
                    <Mail size={16} color="var(--text-dim)" />
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="rahul@company.io"
                      required
                      style={{
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        flex: 1,
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    marginBottom: '6px',
                    color: 'var(--text-main)'
                  }}>
                    Create Password * (min 6 chars)
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '9px 14px'
                  }}>
                    <Lock size={16} color="var(--text-dim)" />
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Choose a strong password"
                      required
                      minLength={6}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        flex: 1,
                        fontSize: '0.9rem'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      style={{ color: 'var(--text-dim)', padding: 0 }}
                    >
                      {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Password strength indicator */}
                  {signupPassword && (
                    <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{
                        flex: 1,
                        height: '4px',
                        borderRadius: '2px',
                        background: passwordStrength >= 1 ? '#ef4444' : 'var(--border-color)'
                      }} />
                      <div style={{
                        flex: 1,
                        height: '4px',
                        borderRadius: '2px',
                        background: passwordStrength >= 2 ? '#f59e0b' : 'var(--border-color)'
                      }} />
                      <div style={{
                        flex: 1,
                        height: '4px',
                        borderRadius: '2px',
                        background: passwordStrength >= 3 ? '#10b981' : 'var(--border-color)'
                      }} />
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {passwordStrength <= 1 ? 'Weak' : passwordStrength === 2 ? 'Fair' : 'Strong'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Role selection */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    marginBottom: '6px',
                    color: 'var(--text-main)'
                  }}>
                    Role in Team
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '9px 14px'
                  }}>
                    <Briefcase size={16} color="var(--text-dim)" />
                    <select
                      value={signupRole}
                      onChange={(e) => setSignupRole(e.target.value)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        flex: 1,
                        fontSize: '0.88rem',
                        cursor: 'pointer'
                      }}
                    >
                      {PRESET_ROLES.map((r) => (
                        <option key={r} value={r} style={{ background: '#111622', color: '#f8fafc' }}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Avatar Choice & Color */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: 'var(--text-main)'
                  }}>
                    Select Profile Avatar & Theme Color
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    {PRESET_AVATARS.map((avUrl, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSignupAvatar(avUrl)}
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          padding: '2px',
                          border: signupAvatar === avUrl ? '2px solid #6366f1' : '2px solid transparent',
                          cursor: 'pointer',
                          transition: 'transform 0.15s ease'
                        }}
                      >
                        <img
                          src={avUrl}
                          alt="avatar option"
                          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Accent color palette */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Color:</span>
                    {PRESET_COLORS.map((c) => (
                      <div
                        key={c}
                        onClick={() => setSignupColor(c)}
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          backgroundColor: c,
                          cursor: 'pointer',
                          outline: signupColor === c ? '2px solid #ffffff' : 'none',
                          outlineOffset: '2px'
                        }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    marginTop: '8px',
                    padding: '12px 20px',
                    borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    color: '#ffffff',
                    fontSize: '0.92rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: 'var(--shadow-glow)',
                    transition: 'all 0.2s ease',
                    opacity: submitting ? 0.7 : 1,
                    cursor: submitting ? 'wait' : 'pointer'
                  }}
                >
                  <span>{submitting ? 'Creating Account...' : 'Create Account & Join Board'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            )}

            <div style={{
              marginTop: '22px',
              textAlign: 'center',
              fontSize: '0.78rem',
              color: 'var(--text-muted)'
            }}>
              {mode === 'login' ? (
                <span>
                  Don't have an account?{' '}
                  <span
                    onClick={() => {
                      setMode('signup');
                      setErrorMessage('');
                    }}
                    style={{ color: '#818cf8', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Create one now
                  </span>
                </span>
              ) : (
                <span>
                  Already registered?{' '}
                  <span
                    onClick={() => {
                      setMode('login');
                      setErrorMessage('');
                    }}
                    style={{ color: '#818cf8', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Log in here
                  </span>
                </span>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '16px 32px',
        textAlign: 'center',
        fontSize: '0.75rem',
        color: 'var(--text-dim)',
        borderTop: '1px solid var(--border-color)',
        zIndex: 10
      }}>
        SyncBoard Kanban Engine &bull; Secure JWT Authentication &bull; MongoDB &bull; Express &bull; React &bull; Socket.IO
      </footer>
    </div>
  );
}

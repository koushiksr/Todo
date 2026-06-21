import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, KeyRound, ArrowLeft, Lock, User, Link as LinkIcon, AlertCircle, CheckCircle } from 'lucide-react';

export const Auth = ({ useAuthHook }) => {
  const { login, register, requestMagicLink, verifyMagicLink, forgotPassword, resetPassword, loading, error } = useAuthHook;
  
  const [view, setView] = useState('LOGIN'); 
  const [identifier, setIdentifier] = useState(''); 
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [localError, setLocalError] = useState('');
  const [mockLink, setMockLink] = useState('');
  const [mockOtp, setMockOtp] = useState('');

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/magic-link/')) {
      const token = path.split('/')[2];
      if (token) {
        setView('MAGIC_VERIFYING');
        verifyMagicLink(token).then(success => {
          if (!success) {
            setView('LOGIN');
          } else {
            window.history.replaceState({}, document.title, '/');
          }
        });
      }
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLocalError('');
    await login(identifier, password);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLocalError('');
    await register(name, identifier, password);
  };

  const handleRequestMagicLink = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!identifier) {
      setLocalError('Please enter your email first.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/request-magic-link', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, baseUrl: window.location.origin })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      if (data.mockLink) setMockLink(data.mockLink);
      setView('MAGIC_SENT');
    } catch (err) { setLocalError(err.message); }
    finally { setLoading(false); }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      if (data.mockOtp) setMockOtp(data.mockOtp);
      setView('RESET');
    } catch (err) { setLocalError(err.message); }
    finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLocalError('');
    await resetPassword(identifier, otp, password);
  };

  const renderError = () => {
    const msg = localError || error;
    if (!msg) return null;
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: 'var(--danger-color)', fontSize: '0.85rem', textAlign: 'center', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
        <AlertCircle size={16} /> {msg}
      </motion.div>
    );
  };

  return (
    <div className="auth-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100vw', padding: '1.5rem' }}>
      <motion.div 
        className="todo-card" 
        style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', overflow: 'hidden' }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <AnimatePresence mode="wait">
          {view === 'MAGIC_VERIFYING' && (
            <motion.div key="verifying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', padding: '2rem 0' }}>
              <LinkIcon size={48} color="var(--primary-color)" style={{ margin: '0 auto 1.5rem auto' }} className="spin-animation" />
              <h2 style={{ marginBottom: '0.5rem' }}>Verifying Magic Link...</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Please wait while we log you in safely.</p>
              {renderError()}
            </motion.div>
          )}

          {view === 'MAGIC_SENT' && (
            <motion.div key="magicsent" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} style={{ textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                <CheckCircle size={32} color="#10b981" />
              </div>
              <h2 style={{ marginBottom: '0.5rem' }}>Check Your Email</h2>
              <p style={{ color: 'var(--text-secondary)' }}>We've sent a magic link to <strong>{identifier}</strong>. Click it to log in instantly!</p>
              
              {mockLink && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px dashed var(--primary-color)' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Email provider not configured. Use this mock link instead:</p>
                  <a href={mockLink} style={{ color: 'var(--primary-color)', fontWeight: 'bold', wordBreak: 'break-all', fontSize: '0.9rem' }}>{mockLink}</a>
                </div>
              )}

              <button onClick={() => setView('LOGIN')} className="btn-secondary" style={{ width: '100%', marginTop: '2rem' }}>
                Back to Login
              </button>
            </motion.div>
          )}

          {view === 'LOGIN' && (
            <motion.div key="login" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div className="sidebar-logo" style={{ margin: '0 auto 1.5rem auto', width: '64px', height: '64px', fontSize: '2rem' }}>T</div>
                <h1 className="page-title" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Welcome Back</h1>
              </div>

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ position: 'relative' }}>
                  <Mail size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input type="email" className="input-field" placeholder="Email Address" value={identifier} onChange={e => setIdentifier(e.target.value)} style={{ width: '100%', paddingLeft: '3rem', height: '3.5rem' }} required />
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input type="password" className="input-field" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', paddingLeft: '3rem', height: '3.5rem' }} required />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setView('FORGOT')} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.9rem', cursor: 'pointer' }}>Forgot Password?</button>
                </div>

                {renderError()}

                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem', height: '3.5rem', fontSize: '1.05rem' }} disabled={loading}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
                
                <div style={{ textAlign: 'center', position: 'relative', margin: '1rem 0' }}>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />
                  <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'var(--surface-color)', padding: '0 10px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>OR</span>
                </div>

                <button type="button" onClick={handleRequestMagicLink} className="btn-secondary" style={{ width: '100%', padding: '1rem', height: '3.5rem', fontSize: '1.05rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} disabled={loading}>
                  <LinkIcon size={18} /> Send Magic Link
                </button>
                
                <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  Don't have an account? <button type="button" onClick={() => { setView('REGISTER'); setPassword(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 'bold', cursor: 'pointer' }}>Sign Up</button>
                </p>
              </form>
            </motion.div>
          )}

          {view === 'REGISTER' && (
            <motion.div key="register" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }}>
              <button onClick={() => setView('LOGIN')} className="btn-icon" style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'var(--bg-color)', zIndex: 10 }}>
                <ArrowLeft size={20} />
              </button>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem', marginTop: '1rem' }}>
                <h1 className="page-title" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Create Account</h1>
              </div>

              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ position: 'relative' }}>
                  <User size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input type="text" className="input-field" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', paddingLeft: '3rem', height: '3.5rem' }} required />
                </div>
                <div style={{ position: 'relative' }}>
                  <Mail size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input type="email" className="input-field" placeholder="Email Address" value={identifier} onChange={e => setIdentifier(e.target.value)} style={{ width: '100%', paddingLeft: '3rem', height: '3.5rem' }} required />
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input type="password" className="input-field" placeholder="Create Password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', paddingLeft: '3rem', height: '3.5rem' }} required minLength={6} />
                </div>

                {renderError()}

                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem', height: '3.5rem', fontSize: '1.05rem', marginTop: '1rem' }} disabled={loading}>
                  {loading ? 'Creating...' : 'Sign Up'}
                </button>
              </form>
            </motion.div>
          )}

          {view === 'FORGOT' && (
            <motion.div key="forgot" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }}>
              <button onClick={() => setView('LOGIN')} className="btn-icon" style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'var(--bg-color)', zIndex: 10 }}>
                <ArrowLeft size={20} />
              </button>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem', marginTop: '1rem' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                  <KeyRound size={32} color="var(--primary-color)" />
                </div>
                <h1 className="page-title" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Reset Password</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Enter your email or phone to receive a 6-digit reset code.</p>
              </div>

              <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ position: 'relative' }}>
                  <Mail size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input type="text" className="input-field" placeholder="Email or Phone Number" value={identifier} onChange={e => setIdentifier(e.target.value)} style={{ width: '100%', paddingLeft: '3rem', height: '3.5rem' }} required />
                </div>

                {renderError()}

                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem', height: '3.5rem', fontSize: '1.05rem', marginTop: '1rem' }} disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Code'}
                </button>
              </form>
            </motion.div>
          )}

          {view === 'RESET' && (
            <motion.div key="reset" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }}>
              <button onClick={() => { setView('FORGOT'); setOtp(''); setPassword(''); }} className="btn-icon" style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'var(--bg-color)', zIndex: 10 }}>
                <ArrowLeft size={20} />
              </button>

              <div style={{ textAlign: 'center', marginBottom: '1.5rem', marginTop: '1rem' }}>
                <h1 className="page-title" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Enter Code & New Password</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>We sent a code to <strong>{identifier}</strong></p>
                {mockOtp && (
                  <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                    [MOCK SMS] Your Code: {mockOtp}
                  </p>
                )}
              </div>

              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="6-Digit Code" 
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  style={{ width: '100%', height: '4rem', fontSize: '1.5rem', textAlign: 'center', letterSpacing: '0.5rem', fontWeight: 'bold' }}
                  required
                />
                
                <div style={{ position: 'relative', marginTop: '0.5rem' }}>
                  <Lock size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input type="password" className="input-field" placeholder="New Password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', paddingLeft: '3rem', height: '3.5rem' }} required minLength={6} />
                </div>

                {renderError()}

                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '1rem', height: '3.5rem', fontSize: '1.05rem' }} disabled={loading || otp.length !== 6}>
                  {loading ? 'Resetting...' : 'Reset Password & Login'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <style>{`
        .spin-animation {
          animation: spin 2s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

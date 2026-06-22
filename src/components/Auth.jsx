import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, KeyRound, ArrowLeft, User, AlertCircle, Phone, X } from 'lucide-react';

export const Auth = ({ useAuthHook, onCancel }) => {
  const { requestOTP, verifyOTP, loading, error } = useAuthHook;
  
  const [view, setView] = useState('REQUEST'); // 'REQUEST' or 'VERIFY'
  const [identifier, setIdentifier] = useState(''); 
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [localError, setLocalError] = useState('');

  const handleRequest = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!identifier) {
      setLocalError('Please enter your email address.');
      return;
    }
    if (!identifier.includes('@')) {
      setLocalError('Only email login is supported.');
      return;
    }
    
    const data = await requestOTP(identifier);
    if (data) {
      setView('VERIFY');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLocalError('');
    const success = await verifyOTP(identifier, otp, name);
    if (success && onCancel) {
      onCancel();
    }
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
        {onCancel && (
          <button 
            onClick={onCancel}
            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
          >
            <X size={20} />
          </button>
        )}

        <AnimatePresence mode="wait">
          {view === 'REQUEST' && (
            <motion.div key="request" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div className="sidebar-logo" style={{ margin: '0 auto 1.5rem auto', width: '64px', height: '64px', fontSize: '2rem' }}>T</div>
                <h1 className="page-title" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Welcome Back</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Log in instantly without a password.</p>
              </div>

              <form onSubmit={handleRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ position: 'relative' }}>
                  <Mail size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input type="email" className="input-field" placeholder="Email Address" value={identifier} onChange={e => setIdentifier(e.target.value)} style={{ width: '100%', paddingLeft: '3rem', height: '3.5rem' }} required />
                </div>

                {renderError()}

                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem', height: '3.5rem', fontSize: '1.05rem', marginTop: '1rem' }} disabled={loading}>
                  {loading ? 'Sending Code...' : 'Send OTP Code'}
                </button>
              </form>
            </motion.div>
          )}

          {view === 'VERIFY' && (
            <motion.div key="verify" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }}>
              <button onClick={() => setView('REQUEST')} className="btn-icon" style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'var(--bg-color)', zIndex: 10 }}>
                <ArrowLeft size={20} />
              </button>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem', marginTop: '1rem' }}>
                <h1 className="page-title" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Verify Code</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Enter the code sent to <strong>{identifier}</strong></p>
              </div>

              <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input type="text" className="input-field" placeholder="6-Digit OTP" value={otp} onChange={e => setOtp(e.target.value)} style={{ width: '100%', paddingLeft: '3rem', height: '3.5rem', fontSize: '1.2rem', letterSpacing: '2px' }} required />
                </div>
                
                <div style={{ position: 'relative' }}>
                  <User size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input type="text" className="input-field" placeholder="Your Name (Optional)" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', paddingLeft: '3rem', height: '3.5rem' }} />
                </div>

                {renderError()}

                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem', height: '3.5rem', fontSize: '1.05rem', marginTop: '1rem' }} disabled={loading}>
                  {loading ? 'Verifying...' : 'Log In'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

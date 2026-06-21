import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, KeyRound, ArrowLeft } from 'lucide-react';

export const Auth = ({ useAuthHook }) => {
  const { requestOTP, verifyOTP, loading, error } = useAuthHook;
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    const success = await requestOTP(email);
    if (success) {
      setStep(2);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    await verifyOTP(email, otp);
  };

  return (
    <div className="auth-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw', padding: '1.5rem' }}>
      <motion.div 
        className="todo-card" 
        style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', overflow: 'hidden' }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div className="sidebar-logo" style={{ margin: '0 auto 1.5rem auto', width: '64px', height: '64px', fontSize: '2rem' }}>T</div>
                <h1 className="page-title" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                  Welcome to TodoPro
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  Enter your email to sign in or create a new account securely without a password.
                </p>
              </div>

              <form onSubmit={handleRequestOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ position: 'relative' }}>
                  <Mail size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="email" 
                    className="input-field" 
                    placeholder="Email Address" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ width: '100%', paddingLeft: '3rem', height: '3.5rem', fontSize: '1rem' }}
                    required
                  />
                </div>

                {error && <div style={{ color: 'var(--danger-color)', fontSize: '0.85rem', textAlign: 'center', marginTop: '0.5rem' }}>{error}</div>}

                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '1rem', height: '3.5rem', fontSize: '1.05rem' }} disabled={loading || !email}>
                  {loading ? 'Sending Code...' : 'Send Login Code'}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <button 
                onClick={() => { setStep(1); setOtp(''); }} 
                className="btn-icon" 
                style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'var(--bg-color)', zIndex: 10 }}
              >
                <ArrowLeft size={20} />
              </button>

              <div style={{ textAlign: 'center', marginBottom: '1.5rem', marginTop: '1rem' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                  <KeyRound size={32} color="var(--primary-color)" />
                </div>
                <h1 className="page-title" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                  Enter Code
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  We sent a 6-digit code to <strong style={{ color: 'var(--text-color)' }}>{email}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="6-Digit Code" 
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  style={{ width: '100%', height: '4rem', fontSize: '1.5rem', textAlign: 'center', letterSpacing: '0.5rem', fontWeight: 'bold' }}
                  required
                />

                {error && <div style={{ color: 'var(--danger-color)', fontSize: '0.85rem', textAlign: 'center', marginTop: '0.5rem' }}>{error}</div>}

                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '1rem', height: '3.5rem', fontSize: '1.05rem' }} disabled={loading || otp.length !== 6}>
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

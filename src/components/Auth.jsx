import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Auth = ({ useAuthHook }) => {
  const { login, register, loading, error } = useAuthHook;
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      await login(email, password);
    } else {
      await register(name, email, password);
    }
  };

  return (
    <div className="auth-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw', padding: '1.5rem' }}>
      <motion.div 
        className="todo-card" 
        style={{ width: '100%', maxWidth: '400px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <div className="sidebar-logo" style={{ margin: '0 auto 1rem auto' }}>T</div>
          <h1 className="page-title" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {isLogin ? 'Sign in to access your tasks.' : 'Join to sync your tasks everywhere.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <AnimatePresence>
            {!isLogin && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: 'auto', opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Full Name" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{ width: '100%' }}
                  required={!isLogin}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <input 
            type="email" 
            className="input-field" 
            placeholder="Email Address" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%' }}
            required
          />

          <input 
            type="password" 
            className="input-field" 
            placeholder="Password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%' }}
            required
          />

          {error && <div style={{ color: 'var(--danger-color)', fontSize: '0.85rem', textAlign: 'center' }}>{error}</div>}

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            onClick={() => { setIsLogin(!isLogin); setEmail(''); setPassword(''); setName(''); }}
            style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

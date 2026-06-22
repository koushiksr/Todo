import React, { useState, useRef, useEffect } from 'react';
import { LogOut, Plus, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AccountSwitcher = ({ accounts, activeAccountId, switchAccount, logoutAccount, onAddAccount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeAccount = accounts.find(a => a.user.id === activeAccountId);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!activeAccount) return null;

  return (
    <div className="account-switcher" ref={dropdownRef} style={{ position: 'relative' }}>
      <button 
        className="nav-item" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          width: 'auto', 
          padding: '0.5rem', 
          background: 'var(--surface-color)', 
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          borderRadius: '8px'
        }}
      >
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary-color)', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem',
          overflow: 'hidden'
        }}>
          {activeAccount.user.dp ? (
            <img src={activeAccount.user.dp} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            activeAccount.user.name.charAt(0).toUpperCase()
          )}
        </div>
        <span style={{ fontSize: '0.9rem', fontWeight: 'bold', maxWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {activeAccount.user.name}
        </span>
        <ChevronDown size={16} style={{ color: 'var(--text-secondary)' }} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 0.5rem)',
              right: 0,
              background: 'var(--surface-color)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              width: '260px',
              zIndex: 100,
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {accounts.map(acc => {
                const isActive = acc.user.id === activeAccountId;
                return (
                  <button
                    key={acc.user.id}
                    onClick={() => {
                      switchAccount(acc.user.id);
                      setIsOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      background: isActive ? 'var(--bg-color)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%'
                    }}
                  >
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-color)', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem',
                      overflow: 'hidden', flexShrink: 0
                    }}>
                      {acc.user.dp ? (
                        <img src={acc.user.dp} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        acc.user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-color)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {acc.user.name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {acc.user.email}
                      </div>
                    </div>
                    {isActive && <Check size={16} color="var(--primary-color)" />}
                  </button>
                );
              })}

              <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.5rem 0' }} />

              <button
                onClick={() => {
                  setIsOpen(false);
                  onAddAccount();
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem',
                  background: 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-color)', width: '100%'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: 'var(--bg-color)', borderRadius: '50%' }}>
                  <Plus size={16} />
                </div>
                <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>Add another account</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  logoutAccount(activeAccountId);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem',
                  background: 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'var(--danger-color)', width: '100%'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px' }}>
                  <LogOut size={16} />
                </div>
                <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>Sign out of {activeAccount.user.name}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

import React from 'react';
import { Settings as SettingsIcon, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

export const Settings = ({ user, updateSettings }) => {
  const handleToggleEmail = async () => {
    const newVal = !user.emailNotifications;
    await updateSettings({ emailNotifications: newVal });
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">
          <SettingsIcon size={28} style={{ marginRight: '10px' }} /> Settings
        </h1>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="settings-container"
        style={{ background: 'var(--surface-color)', padding: '2rem', borderRadius: '16px', marginTop: '1rem' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-color)', padding: '0.8rem', borderRadius: '12px' }}>
              <Bell size={24} color="var(--primary-color)" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-color)' }}>Daily Reminder Emails</h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Receive an email if you forget to complete your daily tasks.
              </p>
            </div>
          </div>
          
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={user.emailNotifications} 
              onChange={handleToggleEmail}
            />
            <span className="slider round"></span>
          </label>
        </div>

      </motion.div>

      <style>{`
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 28px;
        }
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: var(--border-color);
          transition: .4s;
          border-radius: 34px;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        input:checked + .slider {
          background-color: var(--primary-color);
        }
        input:checked + .slider:before {
          transform: translateX(22px);
        }
      `}</style>
    </>
  );
};

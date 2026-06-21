import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle, Clock, ShieldAlert } from 'lucide-react';

export const AdminDashboard = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await fetch('/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.message || 'Failed to fetch admin data');
        
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [token]);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-color)' }}>
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger-color)' }}>
        <ShieldAlert size={48} style={{ margin: '0 auto 1rem' }} />
        <h3>Access Denied or Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <span className="tag tag-count" style={{ background: 'var(--primary-color)', color: '#fff' }}>
          {users.length} Users Total
        </span>
      </div>

      <div style={{ padding: '0 1rem' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '1rem',
          marginTop: '1rem'
        }}>
          {users.map((u, i) => (
            <motion.div 
              key={u.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                background: 'var(--surface-color)',
                borderRadius: '16px',
                padding: '1.5rem',
                border: u.role === 'admin' ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={18} color="var(--primary-color)" />
                  {u.name}
                </h3>
                {u.role === 'admin' && (
                  <span className="tag" style={{ background: 'var(--primary-color)', color: '#fff', fontSize: '0.7rem' }}>
                    ADMIN
                  </span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {u.email}
              </p>
              
              <div style={{ 
                marginTop: '1rem', 
                paddingTop: '1rem', 
                borderTop: '1px solid var(--border-color)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Daily</span>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.todoCounts.daily}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Short Term</span>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.todoCounts.short}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Long Term</span>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.todoCounts.long}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Lifetime</span>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.todoCounts.lifetime}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-color)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-color)', fontWeight: 600 }}>Total</span>
                  <span style={{ 
                    fontWeight: 600, 
                    fontSize: '1rem', 
                    color: 'var(--text-color)',
                    background: 'var(--bg-color)',
                    padding: '0.1rem 0.6rem',
                    borderRadius: '12px'
                  }}>
                    {u.todoCounts.total}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
};

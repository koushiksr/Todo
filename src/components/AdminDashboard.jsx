import React, { useState, useEffect } from 'react';
import { ShieldAlert, ArrowUpDown, Tag } from 'lucide-react';

export const AdminDashboard = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'total', direction: 'desc' });

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

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // all, admin, user

  const getProcessedUsers = () => {
    let processed = [...users];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      processed = processed.filter(u => 
        u.name.toLowerCase().includes(q) || 
        u.email.toLowerCase().includes(q)
      );
    }

    // Filter
    if (roleFilter !== 'all') {
      if (roleFilter === 'admin') {
        processed = processed.filter(u => u.role === 'admin' || u.role === 'owner');
      } else {
        processed = processed.filter(u => u.role !== 'admin' && u.role !== 'owner');
      }
    }

    // Sort
    if (sortConfig.key !== null) {
      processed.sort((a, b) => {
        let aValue, bValue;
        
        if (sortConfig.key === 'name') {
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
        } else if (sortConfig.key === 'email') {
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
        } else if (sortConfig.key === 'total') {
          aValue = a.todoCounts?.total || 0;
          bValue = b.todoCounts?.total || 0;
        } else {
          aValue = a.todoCounts?.[sortConfig.key] || 0;
          bValue = b.todoCounts?.[sortConfig.key] || 0;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return processed;
  };

  // Collect all unique categories across all users to build dynamic table headers
  const allCategories = new Set(['daily', 'short', 'long', 'lifetime']);
  users.forEach(u => {
    Object.keys(u.todoCounts || {}).forEach(k => {
      if (k !== 'total') allCategories.add(k);
    });
  });
  const categoryHeaders = Array.from(allCategories);

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
      <div className="page-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="page-title">Admin Dashboard</h1>
          <span className="tag tag-count" style={{ background: 'var(--primary-color)', color: '#fff' }}>
            {users.length} Users Total
          </span>
        </div>

        <div className="control-bar" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', background: 'var(--surface-color)', padding: '0.75rem', borderRadius: '12px' }}>
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ flex: '1 1 200px', padding: '0.4rem 0.75rem', fontSize: '0.9rem' }}
          />
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input-field"
            style={{ flex: '0 1 auto', padding: '0.4rem 0.75rem', fontSize: '0.9rem', width: 'auto' }}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins Only</option>
            <option value="user">Users Only</option>
          </select>
        </div>
      </div>

      <div style={{ padding: '0 1rem', overflowX: 'auto', paddingBottom: '2rem' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse', 
          background: 'var(--surface-color)',
          borderRadius: '16px',
          overflow: 'hidden'
        }}>
          <thead>
            <tr style={{ background: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
              <th onClick={() => handleSort('name')} style={{ padding: '1rem', textAlign: 'left', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Name <ArrowUpDown size={14} style={{ marginLeft: '4px', opacity: sortConfig.key === 'name' ? 1 : 0.3 }} />
              </th>
              <th onClick={() => handleSort('email')} style={{ padding: '1rem', textAlign: 'left', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Email <ArrowUpDown size={14} style={{ marginLeft: '4px', opacity: sortConfig.key === 'email' ? 1 : 0.3 }} />
              </th>
              <th onClick={() => handleSort('total')} style={{ padding: '1rem', textAlign: 'center', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Total Tasks <ArrowUpDown size={14} style={{ marginLeft: '4px', opacity: sortConfig.key === 'total' ? 1 : 0.3 }} />
              </th>
              {categoryHeaders.map(cat => (
                <th key={cat} onClick={() => handleSort(cat)} style={{ padding: '1rem', textAlign: 'center', cursor: 'pointer', whiteSpace: 'nowrap', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  <Tag size={12} style={{ marginRight: '4px' }}/> {cat} <ArrowUpDown size={14} style={{ marginLeft: '4px', opacity: sortConfig.key === cat ? 1 : 0.3 }} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {getProcessedUsers().map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem', color: 'var(--text-color)' }}>
                  {u.name}
                  {(u.role === 'admin' || u.role === 'owner') && (
                    <span className="tag" style={{ marginLeft: '0.5rem', background: 'var(--primary-color)', color: '#fff', fontSize: '0.6rem' }}>
                      {u.role.toUpperCase()}
                    </span>
                  )}
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {u.email}
                </td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <span style={{ background: 'var(--bg-color)', padding: '0.2rem 0.8rem', borderRadius: '12px', fontWeight: 600 }}>
                    {u.todoCounts?.total || 0}
                  </span>
                </td>
                {categoryHeaders.map(cat => (
                  <td key={cat} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    {u.todoCounts?.[cat] || 0}
                  </td>
                ))}
              </tr>
            ))}
            {getProcessedUsers().length === 0 && (
              <tr>
                <td colSpan={3 + categoryHeaders.length} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No users match your search and filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

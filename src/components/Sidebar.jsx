import React from 'react';
import { Calendar, Clock, Target, Repeat, Trash2, Archive, Download, Upload, Shield } from 'lucide-react';

export const Sidebar = ({ currentView, onViewChange, onExport, onImport, role }) => {
  const navItems = [
    { id: 'daily', label: 'Daily', icon: <Calendar size={22} /> },
    { id: 'short', label: 'Short Term', icon: <Clock size={22} /> },
    { id: 'long', label: 'Long Term', icon: <Target size={22} /> },
    { id: 'lifetime', label: 'Lifetime', icon: <Repeat size={20} /> },
  ];

  const secondaryItems = [
    { id: 'history', label: 'History', icon: <Archive size={22} /> },
    { id: 'bin', label: 'Recycle Bin', icon: <Trash2 size={22} /> },
    ...(role === 'admin' ? [{ id: 'admin', label: 'Admin Panel', icon: <Shield size={22} /> }] : []),
  ];

  const NavButton = ({ item }) => (
    <button
      onClick={() => onViewChange(item.id)}
      className={`nav-item ${currentView === item.id ? 'active' : ''}`}
    >
      <div className="nav-icon">
        {item.icon}
      </div>
      <span>{item.label}</span>
    </button>
  );

  return (
    <div className="sidebar">
      <div>
        <div className="sidebar-header">
          <div className="sidebar-logo">T</div>
          <h2 className="sidebar-title">TodoPro</h2>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <div className="sidebar-section-title">Categories</div>
          {navItems.map(item => <NavButton key={item.id} item={item} />)}
        </div>

        <div>
          <div className="sidebar-section-title">Storage</div>
          {secondaryItems.map(item => <NavButton key={item.id} item={item} />)}
        </div>
      </div>

      <div className="sidebar-footer">
        <button onClick={onExport} className="nav-item">
          <div className="nav-icon"><Download size={22} /></div>
          <span>Backup Data</span>
        </button>
        <label className="nav-item" style={{ cursor: 'pointer', display: 'flex' }}>
          <div className="nav-icon"><Upload size={22} /></div>
          <span>Restore Data</span>
          <input type="file" accept=".json" onChange={onImport} style={{ display: 'none' }} />
        </label>
      </div>
    </div>
  );
};

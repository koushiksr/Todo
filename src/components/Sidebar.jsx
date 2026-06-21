import React, { useState } from 'react';
import { Calendar, Clock, Target, Repeat, Trash2, Archive, Download, Upload, Shield, Tag, Plus, Settings } from 'lucide-react';

export const Sidebar = ({ currentView, onViewChange, onExport, onImport, role, customCategories = [], onAddCustomCategory }) => {
  const [newCatName, setNewCatName] = useState('');
  const [isAddingCat, setIsAddingCat] = useState(false);

  const navItems = [
    { id: 'daily', label: 'Daily', icon: <Calendar size={22} /> },
    { id: 'short', label: 'Short Term', icon: <Clock size={22} /> },
    { id: 'long', label: 'Long Term', icon: <Target size={22} /> },
    { id: 'lifetime', label: 'Lifetime', icon: <Repeat size={20} /> },
    ...customCategories.map(cat => ({
      id: cat, label: cat, icon: <Tag size={20} />
    }))
  ];

  const secondaryItems = [
    { id: 'history', label: 'History', icon: <Archive size={22} /> },
    { id: 'bin', label: 'Recycle Bin', icon: <Trash2 size={22} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={22} /> },
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

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCatName.trim()) {
      onAddCustomCategory(newCatName.trim());
      setNewCatName('');
      setIsAddingCat(false);
    }
  };

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
          
          {isAddingCat ? (
            <form onSubmit={handleAddCategory} style={{ padding: '0 1rem', marginTop: '0.5rem' }}>
              <input
                type="text"
                autoFocus
                placeholder="Category name..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                onBlur={() => setIsAddingCat(false)}
                className="input-field"
                style={{ background: 'var(--bg-color)', fontSize: '0.9rem', padding: '0.6rem 1rem' }}
              />
            </form>
          ) : (
            <button
              onClick={() => setIsAddingCat(true)}
              className="nav-item"
              style={{ opacity: 0.7 }}
            >
              <div className="nav-icon"><Plus size={20} /></div>
              <span>Add Category</span>
            </button>
          )}
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

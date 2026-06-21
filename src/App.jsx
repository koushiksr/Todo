import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useTodos } from './hooks/useTodos';
import { useNotifications } from './hooks/useNotifications';
import { Sidebar } from './components/Sidebar';
import { TodoList } from './components/TodoList';
import { TodoItem } from './components/TodoItem';
import { Auth } from './components/Auth';
import { AdminDashboard } from './components/AdminDashboard';
import { Settings } from './components/Settings';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Target, Repeat, Archive, Trash2, Download, Upload, MoreHorizontal, X, LogOut, Shield, Tag, Settings as SettingsIcon } from 'lucide-react';

function App() {
  const authHook = useAuth();
  const { user, token, logout, updateSettings } = authHook;
  
  const { 
    data, 
    addTodo, 
    toggleTodo, 
    editTodo,
    markNotified,
    deleteTodo, 
    restoreFromBin,
    permanentlyDelete,
    clearBin,
    archiveCompleted,
    reorderTodos
  } = useTodos(token);

  useNotifications(data.todos, markNotified);

  const [currentView, setCurrentView] = useState('daily'); // daily, short, long, lifetime, all
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  if (!user || !token) {
    return <Auth useAuthHook={authHook} />;
  }

  const exportData = () => {
    const dataStr = JSON.stringify(data);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'todopro-backup.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          if (imported.todos && imported.history && imported.bin) {
            alert("Local import is currently disabled while using Cloud Sync.");
          }
        } catch (err) {
          alert("Invalid backup file");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="app-container">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        onExport={exportData}
        onImport={importData}
        role={user.role}
        customCategories={user.customCategories}
        onAddCustomCategory={authHook.addCustomCategory}
      />
      
      <main className="main-content">
        <header style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button onClick={logout} className="nav-item" style={{ width: 'auto', padding: '0.5rem 1rem', background: 'var(--surface-color)', color: 'var(--danger-color)' }}>
            <LogOut size={18} />
            <span style={{ fontSize: '0.9rem' }}>Logout</span>
          </button>
        </header>

        <div className="content-scroll">
          {currentView === 'settings' ? (
            <Settings user={user} updateSettings={updateSettings} />
          ) : currentView === 'admin' && user.role === 'admin' ? (
            <AdminDashboard token={token} />
          ) : currentView === 'history' ? (
            <>
              <div className="page-header">
                <h1 className="page-title">History</h1>
                <span className="tag tag-count">{data.history.length} Tasks</span>
              </div>
              <div className="todo-list-container">
                <AnimatePresence>
                  {data.history.map((todo) => (
                    <motion.div key={todo.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} layout>
                      <TodoItem todo={todo} onToggle={() => toggleTodo(todo.id, true)} onDelete={() => deleteTodo(todo.id)} />
                    </motion.div>
                  ))}
                </AnimatePresence>
                {data.history.length === 0 && (
                  <div className="empty-state">
                    <h3>No history yet</h3>
                    <p>Tasks you complete will show up here.</p>
                  </div>
                )}
              </div>
            </>
          ) : currentView === 'bin' ? (
            <>
              <div className="page-header">
                <h1 className="page-title">Recycle Bin</h1>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={clearBin} className="btn-icon" style={{ color: 'var(--danger-color)' }} title="Empty Bin">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <div className="todo-list-container">
                <AnimatePresence>
                  {data.bin.map((todo) => (
                    <motion.div key={todo.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} layout>
                      <TodoItem todo={todo} onDelete={() => permanentlyDelete(todo.id)} onRestore={() => restoreFromBin(todo.id)} />
                    </motion.div>
                  ))}
                </AnimatePresence>
                {data.bin.length === 0 && (
                  <div className="empty-state">
                    <h3>Bin is empty</h3>
                    <p>Deleted tasks will be stored here safely.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <TodoList 
              todos={data.todos} 
              category={currentView} 
              onAdd={addTodo} 
              onToggle={toggleTodo} 
              onEdit={editTodo}
              onDelete={deleteTodo}
              onReorder={reorderTodos}
            />
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav">
        <button onClick={() => { setCurrentView('daily'); setShowMoreMenu(false); }} className={`bottom-nav-item ${currentView === 'daily' ? 'active' : ''}`}>
          <Calendar size={20} />
          <span>Daily</span>
        </button>
        <button onClick={() => { setCurrentView('short'); setShowMoreMenu(false); }} className={`bottom-nav-item ${currentView === 'short' ? 'active' : ''}`}>
          <Clock size={20} />
          <span>Short</span>
        </button>
        <button onClick={() => { setCurrentView('long'); setShowMoreMenu(false); }} className={`bottom-nav-item ${currentView === 'long' ? 'active' : ''}`}>
          <Target size={20} />
          <span>Long</span>
        </button>
        <button onClick={() => { setCurrentView('lifetime'); setShowMoreMenu(false); }} className={`bottom-nav-item ${currentView === 'lifetime' ? 'active' : ''}`}>
          <Repeat size={20} />
          <span>Lifetime</span>
        </button>
        <button onClick={() => setShowMoreMenu(!showMoreMenu)} className={`bottom-nav-item ${showMoreMenu ? 'active' : ''}`}>
          <MoreHorizontal size={20} />
          <span>More</span>
        </button>
      </nav>

      {/* Mobile More Menu Overlay */}
      <AnimatePresence>
        {showMoreMenu && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="bottom-sheet-overlay"
              onClick={() => setShowMoreMenu(false)}
            />
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bottom-sheet"
            >
              <div className="sheet-header">
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>More Options</h3>
                <button onClick={() => setShowMoreMenu(false)} className="btn-icon"><X size={24} /></button>
              </div>
              <div className="sheet-menu">
                {user.role === 'admin' && (
                  <button className="sheet-btn" onClick={() => { setCurrentView('admin'); setShowMoreMenu(false); }} style={{ color: 'var(--primary-color)' }}>
                    <Shield size={20} /> Admin Panel
                  </button>
                )}
                {user.customCategories && user.customCategories.map(cat => (
                  <button key={cat} className="sheet-btn" onClick={() => { setCurrentView(cat); setShowMoreMenu(false); }}>
                    <Tag size={20} /> {cat}
                  </button>
                ))}
                <button className="sheet-btn" onClick={() => { setCurrentView('history'); setShowMoreMenu(false); }}>
                  <Archive size={20} /> History
                </button>
                <button className="sheet-btn" onClick={() => { setCurrentView('bin'); setShowMoreMenu(false); }}>
                  <Trash2 size={20} /> Recycle Bin
                </button>
                <button className="sheet-btn" onClick={() => { setCurrentView('settings'); setShowMoreMenu(false); }}>
                  <SettingsIcon size={20} /> Settings
                </button>
                <button className="sheet-btn" onClick={() => { logout(); setShowMoreMenu(false); }} style={{ color: 'var(--danger-color)' }}>
                  <LogOut size={20} /> Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;

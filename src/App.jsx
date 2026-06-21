import React, { useState } from 'react';
import { useTodos } from './hooks/useTodos';
import { useNotifications } from './hooks/useNotifications';
import { Sidebar } from './components/Sidebar';
import { TodoList } from './components/TodoList';
import { TodoItem } from './components/TodoItem';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Target, Repeat, Archive, Trash2, Download, Upload, MoreHorizontal, X } from 'lucide-react';

function App() {
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
    reorderTodos,
    setData
  } = useTodos();

  useNotifications(data.todos, markNotified);

  const [currentView, setCurrentView] = useState('daily');
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "todo_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (importedData.todos && importedData.bin) {
          setData(importedData);
          alert("Data restored successfully!");
        } else {
          alert("Invalid backup file.");
        }
      } catch (err) {
        alert("Error parsing backup file.");
      }
    };
    reader.readAsText(file);
  };

  const renderContent = () => {
    if (currentView === 'history') {
      return (
        <>
          <div className="page-header">
            <h1 className="page-title">History</h1>
            <button className="btn-primary" onClick={archiveCompleted}>Archive Done</button>
          </div>
          <div className="todo-list-container">
            {data.history.length === 0 ? (
              <div className="empty-state">No history available.</div>
            ) : (
              data.history.map(todo => (
                <div key={todo.id} className="todo-card" style={{ marginBottom: '0.75rem' }}>
                  <div className="todo-card-left">
                    <div className="todo-content">
                      <div className="todo-meta">
                        <span className={`tag tag-${todo.category}`}>{todo.category}</span>
                        <span className="tag tag-count" style={{ background: 'transparent', border: 'none' }}>
                          Archived {new Date(todo.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="todo-title" style={{ textDecoration: 'line-through' }}>{todo.text}</h3>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      );
    }

    if (currentView === 'bin') {
      return (
        <>
          <div className="page-header">
            <h1 className="page-title">Recycle Bin</h1>
            {data.bin.length > 0 && (
              <button className="btn-primary" style={{ background: 'var(--danger-color)' }} onClick={clearBin}>
                Empty Bin
              </button>
            )}
          </div>
          <div className="todo-list-container">
            <AnimatePresence>
              {data.bin.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state">
                  Bin is empty.
                </motion.div>
              ) : (
                data.bin.map(todo => (
                  <motion.div key={todo.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} layout>
                    <TodoItem 
                      todo={todo} 
                      onToggle={() => {}} 
                      onDelete={permanentlyDelete} 
                      onRestore={restoreFromBin} 
                    />
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </>
      );
    }

    return (
      <TodoList 
        todos={data.todos} 
        category={currentView} 
        onAdd={addTodo} 
        onToggle={toggleTodo} 
        onEdit={editTodo}
        onDelete={deleteTodo}
        onRestore={restoreFromBin}
        onReorder={reorderTodos}
      />
    );
  };

  return (
    <div className="app-container">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        onExport={handleExport}
        onImport={handleImport}
      />

      <main className="main-content">
        {renderContent()}
      </main>

      <div className="bottom-nav">
        <button onClick={() => { setCurrentView('daily'); setShowMoreMenu(false); }} className={`bottom-nav-item ${currentView === 'daily' ? 'active' : ''}`}>
          <Calendar size={24} />
          <span>Daily</span>
        </button>
        <button onClick={() => { setCurrentView('short'); setShowMoreMenu(false); }} className={`bottom-nav-item ${currentView === 'short' ? 'active' : ''}`}>
          <Clock size={24} />
          <span>Short</span>
        </button>
        <button onClick={() => { setCurrentView('long'); setShowMoreMenu(false); }} className={`bottom-nav-item ${currentView === 'long' ? 'active' : ''}`}>
          <Target size={24} />
          <span>Long</span>
        </button>
        <button onClick={() => setShowMoreMenu(true)} className={`bottom-nav-item ${['lifetime', 'history', 'bin'].includes(currentView) || showMoreMenu ? 'active' : ''}`}>
          <MoreHorizontal size={24} />
          <span>More</span>
        </button>
      </div>

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
                <h3>More Options</h3>
                <button onClick={() => setShowMoreMenu(false)} className="btn-icon">
                  <X size={20} />
                </button>
              </div>
              
              <div className="sheet-menu">
                <button onClick={() => { setCurrentView('lifetime'); setShowMoreMenu(false); }} className="sheet-btn">
                  <div style={{ color: 'var(--text-secondary)' }}><Infinity size={22} /></div>
                  <span>Lifetime Tasks</span>
                </button>
                <button onClick={() => { setCurrentView('history'); setShowMoreMenu(false); }} className="sheet-btn">
                  <div style={{ color: 'var(--history-color)' }}><Archive size={22} /></div>
                  <span>History</span>
                </button>
                <button onClick={() => { setCurrentView('bin'); setShowMoreMenu(false); }} className="sheet-btn">
                  <div style={{ color: 'var(--danger-color)' }}><Trash2 size={22} /></div>
                  <span>Recycle Bin</span>
                </button>
              </div>

              <div className="sheet-actions">
                <button onClick={handleExport} className="action-btn">
                  <Download size={24} />
                  <span>Backup</span>
                </button>
                <label className="action-btn" style={{ cursor: 'pointer' }}>
                  <Upload size={24} />
                  <span>Restore</span>
                  <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
                </label>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;

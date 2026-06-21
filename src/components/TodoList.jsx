import React, { useState, useEffect } from 'react';
import { TodoItem } from './TodoItem';
import { Plus, Bell } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

export const TodoList = ({ todos, category, onAdd, onToggle, onEdit, onDelete, onRestore, onReorder }) => {
  const [newTask, setNewTask] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Search, Sort, Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest'); // newest, oldest, az, za
  const [filterOption, setFilterOption] = useState('all'); // all, reminders, no-reminders
  
  const filteredTodos = todos.filter(t => t.category === category || category === 'all');
  const [localTodos, setLocalTodos] = useState(filteredTodos);

  useEffect(() => {
    setLocalTodos(filteredTodos);
  }, [todos, category]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (newTask.trim()) {
      onAdd(newTask, category, reminderTime || null);
      setNewTask('');
      setReminderTime('');
      setShowTimePicker(false);
    }
  };

  const handleReorder = (newOrder) => {
    // Only allow reorder if no filters/sorts are active
    if (!searchQuery && sortOption === 'newest' && filterOption === 'all') {
      setLocalTodos(newOrder); 
      if (onReorder) {
        onReorder(newOrder, category); 
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  // Apply Search, Sort, and Filter
  const getProcessedTodos = () => {
    let result = [...localTodos];

    if (searchQuery) {
      result = result.filter(t => t.text.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (filterOption === 'reminders') {
      result = result.filter(t => !!t.reminderTime);
    } else if (filterOption === 'no-reminders') {
      result = result.filter(t => !t.reminderTime);
    }

    result.sort((a, b) => {
      if (sortOption === 'az') return a.text.localeCompare(b.text);
      if (sortOption === 'za') return b.text.localeCompare(a.text);
      
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      if (sortOption === 'oldest') return dateA - dateB;
      return dateB - dateA; // default newest
    });

    return result;
  };

  const processedTodos = getProcessedTodos();
  const isDefaultView = !searchQuery && sortOption === 'newest' && filterOption === 'all';

  return (
    <>
      <div className="page-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="page-title">
            {category === 'all' ? 'All Tasks' : `${category} Tasks`}
          </h1>
          <span className="tag tag-count">{filteredTodos.length} Tasks</span>
        </div>
        
        <div className="control-bar" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', background: 'var(--surface-color)', padding: '0.75rem', borderRadius: '12px' }}>
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ flex: '1 1 200px', padding: '0.4rem 0.75rem', fontSize: '0.9rem' }}
          />
          <select 
            value={sortOption} 
            onChange={(e) => setSortOption(e.target.value)}
            className="input-field"
            style={{ flex: '0 1 auto', padding: '0.4rem 0.75rem', fontSize: '0.9rem', width: 'auto' }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="az">A-Z</option>
            <option value="za">Z-A</option>
          </select>
          <select 
            value={filterOption} 
            onChange={(e) => setFilterOption(e.target.value)}
            className="input-field"
            style={{ flex: '0 1 auto', padding: '0.4rem 0.75rem', fontSize: '0.9rem', width: 'auto' }}
          >
            <option value="all">All</option>
            <option value="reminders">Has Reminder</option>
            <option value="no-reminders">No Reminder</option>
          </select>
        </div>
      </div>

      <div className="todo-list-container">
        {processedTodos.length === 0 ? (
          <AnimatePresence>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="empty-state"
            >
              <div className="empty-icon-wrapper">
                <CheckCircle size={32} color="var(--text-secondary)" />
              </div>
              <h3>{filteredTodos.length === 0 ? "You're all caught up!" : "No tasks match your filters."}</h3>
              <p>{filteredTodos.length === 0 ? "Add a new task below to get started." : "Try adjusting your search or filters."}</p>
            </motion.div>
          </AnimatePresence>
        ) : (
          isDefaultView ? (
            <Reorder.Group 
              axis="y" 
              values={localTodos} 
              onReorder={handleReorder} 
              style={{ listStyle: 'none', padding: 0 }}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {localTodos.map((todo) => (
                <TodoItem 
                  key={todo.id}
                  todo={todo} 
                  onToggle={onToggle} 
                  onEdit={onEdit}
                  onDelete={onDelete} 
                  onRestore={onRestore}
                />
              ))}
            </Reorder.Group>
          ) : (
            <div style={{ listStyle: 'none', padding: 0 }}>
              {processedTodos.map((todo) => (
                <TodoItem 
                  key={todo.id}
                  todo={todo} 
                  onToggle={onToggle} 
                  onEdit={onEdit}
                  onDelete={onDelete} 
                  onRestore={onRestore}
                />
              ))}
            </div>
          )
        )}
      </div>

      <div className="sticky-form-wrapper">
        <form onSubmit={handleAdd} className="todo-form">
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', position: 'relative' }}>
              <input
                type="text"
                className="input-field"
                placeholder={`Add a new ${category} task...`}
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
              />
              <button 
                type="button" 
                onClick={() => setShowTimePicker(!showTimePicker)}
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: reminderTime ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '0.5rem'
                }}
              >
                <Bell size={20} />
              </button>
            </div>
            
            <AnimatePresence>
              {showTimePicker && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}
                >
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Remind me at:</span>
                  <input 
                    type="time" 
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="input-field"
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.9rem', width: 'auto' }}
                  />
                  {reminderTime && (
                    <button type="button" onClick={() => setReminderTime('')} style={{ background: 'transparent', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', fontSize: '0.85rem' }}>Clear</button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={!newTask.trim()}
            style={{ opacity: !newTask.trim() ? 0.5 : 1, alignSelf: 'flex-start', height: '54px' }}
          >
            <Plus size={24} strokeWidth={3} />
          </button>
        </form>
      </div>
    </>
  );
};

const CheckCircle = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

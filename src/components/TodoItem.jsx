import React, { useState, useRef, useEffect } from 'react';
import { Trash2, CheckCircle, RotateCcw, GripVertical, Bell } from 'lucide-react';
import { motion, useMotionValue, useTransform, useAnimation, Reorder, useDragControls } from 'framer-motion';

export const TodoItem = ({ todo, onToggle, onEdit, onDelete, onRestore, isReorderable = false }) => {
  const isDeleted = Boolean(todo.deletedAt);
  const x = useMotionValue(0);
  const swipeControls = useAnimation();
  const dragControls = useDragControls();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [editTime, setEditTime] = useState(todo.reminderTime || '');
  const inputRef = useRef(null);
  
  const opacityRight = useTransform(x, [0, 80], [0, 1]); 
  const opacityLeft = useTransform(x, [0, -80], [0, 1]); 
  const scaleRight = useTransform(x, [0, 80], [0.8, 1.2]);
  const scaleLeft = useTransform(x, [0, -80], [0.8, 1.2]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const longPressTimer = useRef(null);

  const handlePointerDown = (e) => {
    if (isDeleted || isEditing) return;
    longPressTimer.current = setTimeout(() => {
      setIsEditing(true);
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    }, 500);
  };

  const handlePointerCancel = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleDragEnd = async (event, info) => {
    if (isEditing) return; // Disable swipe while editing
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    
    if (Math.abs(offset) > 100 || Math.abs(velocity) > 500) {
      if ((offset > 100 || velocity > 500) && !isDeleted) {
        await swipeControls.start({ x: 150, opacity: 0, transition: { duration: 0.2 } });
        onToggle(todo.id);
        swipeControls.start({ x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } });
      } else if (offset < -100 || velocity < -500) {
        await swipeControls.start({ x: -150, opacity: 0, transition: { duration: 0.2 } });
        onDelete(todo.id);
      } else {
        swipeControls.start({ x: 0, transition: { type: 'spring', stiffness: 400, damping: 25 } });
      }
    } else {
      swipeControls.start({ x: 0, transition: { type: 'spring', stiffness: 400, damping: 25 } });
    }
  };

  const saveEdit = () => {
    if (editText.trim()) {
      onEdit(todo.id, editText, editTime || undefined);
    } else {
      setEditText(todo.text);
      setEditTime(todo.reminderTime || '');
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') {
      setEditText(todo.text);
      setEditTime(todo.reminderTime || '');
      setIsEditing(false);
    }
  };

  const getTagClass = (category) => {
    switch(category) {
      case 'daily': return 'tag-daily';
      case 'short': return 'tag-short';
      case 'long': return 'tag-long';
      case 'lifetime': return 'tag-lifetime';
      default: return '';
    }
  };

  const CardContent = (
    <>
      {!isDeleted && (
        <motion.div className="swipe-background complete" style={{ opacity: opacityRight }}>
          <motion.div style={{ scale: scaleRight }}>
            <CheckCircle size={28} />
          </motion.div>
        </motion.div>
      )}
      <motion.div className="swipe-background delete" style={{ opacity: opacityLeft }}>
        <motion.div style={{ scale: scaleLeft }}>
          <Trash2 size={28} />
        </motion.div>
      </motion.div>

      <motion.div
        className="todo-card"
        style={{ x, zIndex: 1 }}
        drag={isDeleted || isEditing ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        animate={swipeControls}
        initial={{ x: 0, opacity: 1 }}
        onDoubleClick={() => !isDeleted && setIsEditing(true)}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerCancel}
        onPointerLeave={handlePointerCancel}
        onPointerCancel={handlePointerCancel}
      >
        <div className="todo-card-left">
          {!isDeleted && !isEditing && (
            <div 
              className="drag-handle" 
              onPointerDown={(e) => dragControls.start(e)}
            >
              <GripVertical size={20} />
            </div>
          )}

          <div className="todo-content">
            <div className="todo-meta">
              <span className={`tag ${getTagClass(todo.category)}`}>
                {todo.category}
              </span>
              {!isEditing && todo.reminderTime && (
                <span className="tag tag-count" style={{ display: 'flex', alignItems: 'center', gap: '4px', border: 'none', background: 'rgba(255,255,255,0.05)' }}>
                  <Bell size={12} /> {todo.reminderTime}
                </span>
              )}
            </div>
            
            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input
                  ref={inputRef}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={saveEdit}
                  className="input-field"
                  style={{ padding: '0.5rem', fontSize: '1rem', boxShadow: 'none' }}
                />
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Bell size={16} color="var(--text-secondary)" />
                  <input 
                    type="time" 
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    onBlur={saveEdit}
                    className="input-field"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.9rem', width: 'auto', boxShadow: 'none' }}
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>(Press Enter to save)</span>
                </div>
              </div>
            ) : (
              <h3 
                className="todo-title"
                style={{ 
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  color: todo.completed ? 'var(--text-secondary)' : 'var(--text-primary)',
                }}
              >
                {todo.text}
              </h3>
            )}
          </div>
        </div>

        {!isEditing && (
          <div className="todo-actions">
            {isDeleted ? (
              <>
                <button onClick={() => onRestore(todo.id)} className="btn-icon">
                  <RotateCcw size={22} />
                </button>
                <button onClick={() => onDelete(todo.id)} className="btn-icon" style={{color: 'var(--danger-color)'}}>
                  <Trash2 size={22} />
                </button>
              </>
            ) : (
              <button 
                onClick={() => onToggle(todo.id)} 
                className="btn-icon"
                style={{
                  background: todo.completed ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                }}
              >
                <CheckCircle 
                  size={28} 
                  color={todo.completed ? 'var(--success-color)' : 'var(--border-color)'} 
                  strokeWidth={todo.completed ? 2.5 : 1.5}
                />
              </button>
            )}
          </div>
        )}
      </motion.div>
    </>
  );

  if (isDeleted || !isReorderable) {
    return (
      <motion.div 
        className="reorder-item-wrapper"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      >
        {CardContent}
      </motion.div>
    );
  }

  return (
    <Reorder.Item 
      value={todo} 
      id={todo.id}
      className="reorder-item-wrapper"
      dragListener={false} 
      dragControls={dragControls}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
    >
      {CardContent}
    </Reorder.Item>
  );
};

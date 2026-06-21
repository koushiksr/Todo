import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'todo_app_data';

const defaultState = {
  todos: [],
  bin: [],
  history: [], 
  lastResetDate: new Date().toDateString(),
};

export const useTodos = () => {
  const [data, setData] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaultState, ...parsed };
      }
    } catch (e) {
      console.error("Failed to load local storage", e);
    }
    return defaultState;
  });

  useEffect(() => {
    const today = new Date().toDateString();
    if (data.lastResetDate !== today) {
      setData((prev) => {
        const updatedTodos = prev.todos.map(todo => {
          if (todo.category === 'daily' && todo.completed) {
            return { ...todo, completed: false };
          }
          return todo;
        });
        return { ...prev, todos: updatedTodos, lastResetDate: today };
      });
    }
  }, [data.lastResetDate]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const addTodo = (text, category, reminderTime = null) => {
    const newTodo = {
      id: uuidv4(),
      text,
      category, 
      completed: false,
      createdAt: new Date().toISOString(),
      deletedAt: null,
      reminderTime: reminderTime,
      notified: false
    };
    setData((prev) => ({
      ...prev,
      todos: [newTodo, ...prev.todos]
    }));
  };

  const toggleTodo = (id) => {
    setData((prev) => ({
      ...prev,
      todos: prev.todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ),
    }));
  };

  const editTodo = (id, newText, newReminderTime = undefined) => {
    setData((prev) => ({
      ...prev,
      todos: prev.todos.map((todo) => {
        if (todo.id === id) {
          const updated = { ...todo, text: newText };
          if (newReminderTime !== undefined) {
            updated.reminderTime = newReminderTime;
            updated.notified = false;
          }
          return updated;
        }
        return todo;
      }),
    }));
  };

  const markNotified = (id) => {
    setData((prev) => ({
      ...prev,
      todos: prev.todos.map(todo =>
        todo.id === id ? { ...todo, notified: true } : todo
      ),
    }));
  };

  const deleteTodo = (id) => {
    setData((prev) => {
      const todoToDelete = prev.todos.find((t) => t.id === id);
      if (!todoToDelete) return prev;

      const newBin = [{ ...todoToDelete, deletedAt: new Date().toISOString() }, ...prev.bin];
      const newTodos = prev.todos.filter((t) => t.id !== id);

      return {
        ...prev,
        todos: newTodos,
        bin: newBin,
      };
    });
  };

  const restoreFromBin = (id) => {
    setData((prev) => {
      const todoToRestore = prev.bin.find((t) => t.id === id);
      if (!todoToRestore) return prev;

      const newTodos = [{ ...todoToRestore, deletedAt: null }, ...prev.todos];
      const newBin = prev.bin.filter((t) => t.id !== id);

      return {
        ...prev,
        todos: newTodos,
        bin: newBin,
      };
    });
  };

  const permanentlyDelete = (id) => {
    setData((prev) => ({
      ...prev,
      bin: prev.bin.filter((t) => t.id !== id),
    }));
  };

  const clearBin = () => {
    setData((prev) => ({
      ...prev,
      bin: [],
    }));
  };

  const archiveCompleted = () => {
    setData((prev) => {
      const completedNonDaily = prev.todos.filter(t => t.completed && t.category !== 'daily');
      const remainingTodos = prev.todos.filter(t => !(t.completed && t.category !== 'daily'));
      
      return {
        ...prev,
        todos: remainingTodos,
        history: [...completedNonDaily, ...prev.history]
      };
    });
  };

  const reorderTodos = (newOrder, category) => {
    setData((prev) => {
      if (category === 'all') {
        return { ...prev, todos: newOrder };
      }
      const otherTodos = prev.todos.filter(t => t.category !== category);
      return { ...prev, todos: [...newOrder, ...otherTodos] };
    });
  };

  return {
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
  };
};

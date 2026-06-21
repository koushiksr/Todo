import { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';

export const useTodos = (token) => {
  const [data, setData] = useState({ todos: [], history: [], bin: [] });

  const getE2EKey = () => localStorage.getItem('todo_e2e_key');

  const encryptText = (text) => {
    const key = getE2EKey();
    if (!key) return text;
    return CryptoJS.AES.encrypt(text, key).toString();
  };

  const decryptText = (ciphertext) => {
    const key = getE2EKey();
    if (!key) return ciphertext;
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, key);
      const plaintext = bytes.toString(CryptoJS.enc.Utf8);
      // If decryption fails (e.g. legacy unencrypted text), return original
      return plaintext || ciphertext;
    } catch (e) {
      return ciphertext;
    }
  };

  const fetchTodos = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/todos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        let todos = await res.json();
        todos = todos.map(t => ({ 
          ...t, 
          id: t._id,
          text: decryptText(t.text)
        }));
        
        const activeTodos = todos.filter(t => !t.deletedAt && !t.completed);
        const history = todos.filter(t => !t.deletedAt && t.completed);
        const bin = todos.filter(t => t.deletedAt);
        
        setData({ todos: activeTodos, history, bin });
      }
    } catch (err) {
      console.error("Error fetching todos", err);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [token]);

  const addTodo = async (text, category = 'daily', reminderTime = null) => {
    const encryptedText = encryptText(text);
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ text: encryptedText, category, reminderTime })
      });
      if (res.ok) {
        fetchTodos();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTodo = async (id, isHistory = false) => {
    let completed = !isHistory;
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ completed })
      });
      if (res.ok) fetchTodos();
    } catch (err) {}
  };

  const editTodo = async (id, text, reminderTime) => {
    const encryptedText = encryptText(text);
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ text: encryptedText, reminderTime, notified: false })
      });
      if (res.ok) fetchTodos();
    } catch (err) {}
  };

  const markNotified = async (id) => {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ notified: true })
      });
      if (res.ok) fetchTodos();
    } catch (err) {}
  };

  const deleteTodo = async (id, fromBin = false) => {
    try {
      if (fromBin) {
        const res = await fetch(`/api/todos/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) fetchTodos();
      } else {
        const res = await fetch(`/api/todos/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ deletedAt: new Date().toISOString() })
        });
        if (res.ok) fetchTodos();
      }
    } catch (err) {}
  };

  const restoreFromBin = async (id) => {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ deletedAt: null })
      });
      if (res.ok) fetchTodos();
    } catch (err) {}
  };

  const permanentlyDelete = async (id) => {
    await deleteTodo(id, true);
  };

  const clearBin = async () => {
    for (const todo of data.bin) {
      await deleteTodo(todo._id, true);
    }
  };

  const archiveCompleted = async () => {
    // History is already completed items. "Archive" here just means they're stored.
    // In our cloud DB, they are naturally archived. No action needed unless we want to hide them from history.
  };

  const reorderTodos = async (newOrderedTodos, category) => {
    const newTodos = data.todos.filter(t => t.category !== category).concat(newOrderedTodos);
    setData({ ...data, todos: newTodos });
    
    const orderedIds = newOrderedTodos.map(t => t._id);
    try {
      await fetch(`/api/todos/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ orderedIds })
      });
    } catch (err) {}
  };

  return { 
    data, 
    addTodo, 
    toggleTodo, 
    editTodo, 
    deleteTodo, 
    restoreFromBin,
    permanentlyDelete,
    clearBin,
    archiveCompleted,
    reorderTodos, 
    markNotified 
  };
};

import { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';

export const useAuth = () => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('todo_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('todo_token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateE2EKey = (email, password) => {
    return CryptoJS.SHA256(password + email).toString();
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      
      const userData = { 
        id: data.user.id, 
        name: data.user.name, 
        email: data.user.email, 
        role: data.user.role, 
        customCategories: data.user.customCategories || [],
        emailNotifications: data.user.emailNotifications !== false 
      };
      
      const e2eKey = generateE2EKey(email, password);
      localStorage.setItem('todo_e2e_key', e2eKey);
      
      localStorage.setItem('todo_user', JSON.stringify(userData));
      setToken(data.token);
      setUser(userData);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      
      const userData = { 
        id: data.user.id, 
        name: data.user.name, 
        email: data.user.email, 
        role: data.user.role, 
        customCategories: data.user.customCategories || [],
        emailNotifications: data.user.emailNotifications !== false 
      };
      
      const e2eKey = generateE2EKey(email, password);
      localStorage.setItem('todo_e2e_key', e2eKey);
      
      localStorage.setItem('todo_user', JSON.stringify(userData));
      setToken(data.token);
      setUser(userData);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const addCustomCategory = async (category) => {
    try {
      const res = await fetch('/api/user/categories', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ category })
      });
      if (res.ok) {
        const newCategories = await res.json();
        const updatedUser = { ...user, customCategories: newCategories };
        setUser(updatedUser);
        localStorage.setItem('todo_user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error('Failed to add category', err);
    }
  };

  const updateSettings = async (settings) => {
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        const data = await res.json();
        const updatedUser = { ...user, emailNotifications: data.emailNotifications };
        setUser(updatedUser);
        localStorage.setItem('todo_user', JSON.stringify(updatedUser));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to update settings', err);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('todo_token');
    localStorage.removeItem('todo_user');
    localStorage.removeItem('todo_e2e_key');
    setToken(null);
    setUser(null);
  };

  return { user, token, loading, error, login, register, logout, addCustomCategory, updateSettings };
};

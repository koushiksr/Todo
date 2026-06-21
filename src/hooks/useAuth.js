import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('todo_token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('todo_token', token);
      const storedUser = localStorage.getItem('todo_user');
      if (storedUser) setUser(JSON.parse(storedUser));
    } else {
      localStorage.removeItem('todo_token');
      localStorage.removeItem('todo_user');
      setUser(null);
    }
  }, [token]);

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
    setToken(null);
  };

  return { user, token, loading, error, login, register, logout, addCustomCategory, updateSettings };
};

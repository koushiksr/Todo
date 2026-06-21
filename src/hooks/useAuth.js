import { useState } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('todo_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('todo_token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestOTP = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to request OTP');
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (email, code, name = '') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');
      
      const userData = { 
        id: data.user.id, 
        name: data.user.name, 
        email: data.user.email, 
        role: data.user.role, 
        customCategories: data.user.customCategories || [],
        emailNotifications: data.user.emailNotifications !== false,
        pushNotifications: data.user.pushNotifications !== false
      };
      
      localStorage.setItem('todo_user', JSON.stringify(userData));
      localStorage.setItem('todo_token', data.token);
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
        const updatedUser = { 
          ...user, 
          emailNotifications: data.emailNotifications,
          pushNotifications: data.pushNotifications 
        };
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
    localStorage.removeItem('todo_e2e_key'); // clear legacy key if exists
    setToken(null);
    setUser(null);
  };

  return { user, token, loading, error, requestOTP, verifyOTP, logout, addCustomCategory, updateSettings };
};

import { useState } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('todo_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('todo_token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAuthResponse = async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Authentication failed');
    
    const userData = { 
      id: data.user.id, 
      name: data.user.name, 
      email: data.user.email, 
      phone: data.user.phone,
      dob: data.user.dob,
      dp: data.user.dp,
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
  };

  const login = async (email, password) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      return await handleAuthResponse(res);
    } catch (err) { setError(err.message); return false; }
    finally { setLoading(false); }
  };

  const register = async (name, email, password) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      return await handleAuthResponse(res);
    } catch (err) { setError(err.message); return false; }
    finally { setLoading(false); }
  };

  const requestMagicLink = async (email) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/auth/request-magic-link', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, baseUrl: window.location.origin })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return true;
    } catch (err) { setError(err.message); return false; }
    finally { setLoading(false); }
  };

  const verifyMagicLink = async (tokenParam) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/auth/verify-magic-link', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenParam })
      });
      return await handleAuthResponse(res);
    } catch (err) { setError(err.message); return false; }
    finally { setLoading(false); }
  };

  const forgotPassword = async (identifier) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return true;
    } catch (err) { setError(err.message); return false; }
    finally { setLoading(false); }
  };

  const resetPassword = async (identifier, code, newPassword) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, code, newPassword })
      });
      return await handleAuthResponse(res);
    } catch (err) { setError(err.message); return false; }
    finally { setLoading(false); }
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

  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');
      
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('todo_user', JSON.stringify(updatedUser));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('todo_token');
    localStorage.removeItem('todo_user');
    localStorage.removeItem('todo_e2e_key'); // clear legacy key if exists
    setToken(null);
    setUser(null);
  };

  return { user, token, loading, error, login, register, requestMagicLink, verifyMagicLink, forgotPassword, resetPassword, logout, addCustomCategory, updateSettings, updateProfile };
};

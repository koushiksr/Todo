import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [accounts, setAccounts] = useState(() => {
    const storedAccounts = localStorage.getItem('todo_accounts');
    if (storedAccounts) {
      return JSON.parse(storedAccounts);
    }
    // Migration from old single-user system
    const oldUser = localStorage.getItem('todo_user');
    const oldToken = localStorage.getItem('todo_token');
    if (oldUser && oldToken) {
      const parsedUser = JSON.parse(oldUser);
      const migrated = [{ user: parsedUser, token: oldToken }];
      localStorage.setItem('todo_accounts', JSON.stringify(migrated));
      localStorage.setItem('todo_active_account_id', parsedUser.id);
      
      // Cleanup old keys
      localStorage.removeItem('todo_user');
      localStorage.removeItem('todo_token');
      return migrated;
    }
    return [];
  });

  const [activeAccountId, setActiveAccountId] = useState(() => {
    const storedId = localStorage.getItem('todo_active_account_id');
    return storedId || null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const activeAccount = accounts.find(a => a.user.id === activeAccountId) || null;
  const user = activeAccount ? activeAccount.user : null;
  const token = activeAccount ? activeAccount.token : null;

  const saveAccounts = (newAccounts, newActiveId) => {
    localStorage.setItem('todo_accounts', JSON.stringify(newAccounts));
    localStorage.setItem('todo_active_account_id', newActiveId);
    setAccounts(newAccounts);
    setActiveAccountId(newActiveId);
  };

  const handleAuthResponse = async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Authentication failed');
    
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
    
    const newAccounts = [...accounts.filter(a => a.user.id !== userData.id), { user: userData, token: data.token }];
    saveAccounts(newAccounts, userData.id);
    return true;
  };

  const requestOTP = async (identifier) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to request OTP');
      return data;
    } catch (err) { setError(err.message); return null; }
    finally { setLoading(false); }
  };

  const verifyOTP = async (identifier, code, name) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, code, name })
      });
      return await handleAuthResponse(res);
    } catch (err) { setError(err.message); return false; }
    finally { setLoading(false); }
  };

  const switchAccount = (accountId) => {
    if (accounts.some(a => a.user.id === accountId)) {
      localStorage.setItem('todo_active_account_id', accountId);
      setActiveAccountId(accountId);
    }
  };

  const logoutAccount = (accountId) => {
    const newAccounts = accounts.filter(a => a.user.id !== accountId);
    let newActiveId = activeAccountId;
    if (accountId === activeAccountId) {
      newActiveId = newAccounts.length > 0 ? newAccounts[0].user.id : null;
    }
    saveAccounts(newAccounts, newActiveId);
  };

  const updateActiveUser = (updatedUser) => {
    const newAccounts = accounts.map(a => a.user.id === activeAccountId ? { ...a, user: updatedUser } : a);
    saveAccounts(newAccounts, activeAccountId);
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
        updateActiveUser({ ...user, customCategories: newCategories });
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
        updateActiveUser({ 
          ...user, 
          emailNotifications: data.emailNotifications,
          pushNotifications: data.pushNotifications 
        });
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
      
      updateActiveUser({ ...user, ...data });
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Backwards compatible logout (logs out current active account)
  const logout = () => {
    if (activeAccountId) {
      logoutAccount(activeAccountId);
    }
  };

  return { 
    user, 
    token, 
    accounts,
    activeAccountId,
    loading, 
    error, 
    requestOTP,
    verifyOTP,
    logout,
    logoutAccount,
    switchAccount,
    addCustomCategory, 
    updateSettings, 
    updateProfile 
  };
};

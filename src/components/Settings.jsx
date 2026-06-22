import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, User as UserIcon, Camera, Save } from 'lucide-react';
import { motion } from 'framer-motion';

export const Settings = ({ user, updateSettings, updateProfile }) => {
  const [profileData, setProfileData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    dob: user.dob ? user.dob.split('T')[0] : '',
    dp: user.dp || ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleToggleEmail = async () => {
    const newVal = !user.emailNotifications;
    await updateSettings({ emailNotifications: newVal });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert('Image must be less than 1MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, dp: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage('');
    const res = await updateProfile(profileData);
    setSaving(false);
    if (res.success) {
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage(`Error: ${res.error}`);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">
          <SettingsIcon size={28} style={{ marginRight: '10px' }} /> Settings
        </h1>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="settings-container"
        style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1rem' }}
      >
        {/* PROFILE SECTION */}
        <div style={{ background: 'var(--surface-color)', padding: '2rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <UserIcon size={24} color="var(--primary-color)" />
            <h2 style={{ margin: 0, fontSize: '1.3rem' }}>Profile Details</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                <div style={{ 
                  width: '100%', height: '100%', borderRadius: '50%', background: 'var(--bg-color)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                  border: '2px solid var(--border-color)'
                }}>
                  {profileData.dp ? (
                    <img src={profileData.dp} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <UserIcon size={40} color="var(--text-secondary)" />
                  )}
                </div>
                <label style={{
                  position: 'absolute', bottom: 0, right: 0, background: 'var(--primary-color)', 
                  width: '32px', height: '32px', borderRadius: '50%', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  border: '2px solid var(--surface-color)', color: 'white'
                }}>
                  <Camera size={16} />
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                </label>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Full Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={profileData.name} 
                  onChange={e => setProfileData({...profileData, name: e.target.value})} 
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Date of Birth</label>
                <input 
                  type="date" 
                  className="input-field" 
                  value={profileData.dob} 
                  onChange={e => setProfileData({...profileData, dob: e.target.value})} 
                  style={{ width: '100%', color: profileData.dob ? 'var(--text-color)' : 'var(--text-secondary)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Email</label>
                <input 
                  type="email" 
                  className="input-field" 
                  value={profileData.email} 
                  onChange={e => setProfileData({...profileData, email: e.target.value})} 
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Phone Number</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={profileData.phone} 
                  onChange={e => setProfileData({...profileData, phone: e.target.value})} 
                  style={{ width: '100%' }}
                  placeholder="+1234567890"
                />
              </div>
            </div>

            {message && (
              <div style={{ textAlign: 'center', color: message.includes('Error') ? 'var(--danger-color)' : 'var(--success-color, #10b981)', fontSize: '0.9rem' }}>
                {message}
              </div>
            )}

            <button 
              className="btn-primary" 
              onClick={handleSaveProfile} 
              disabled={saving}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', alignSelf: 'flex-end', padding: '0.8rem 1.5rem' }}
            >
              <Save size={18} /> {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>

        {/* NOTIFICATIONS SECTION */}
        <div style={{ background: 'var(--surface-color)', padding: '2rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <Bell size={24} color="var(--primary-color)" />
            <h2 style={{ margin: 0, fontSize: '1.3rem' }}>Notifications</h2>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-color)' }}>Push Notifications</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Receive mobile or desktop push alerts for tasks due now.
                </p>
              </div>
            </div>
            
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={user.pushNotifications !== false} 
                onChange={() => {
                  const newVal = !(user.pushNotifications !== false);
                  updateSettings({ pushNotifications: newVal });
                  if (newVal && 'Notification' in window && Notification.permission !== 'granted') {
                    Notification.requestPermission();
                  }
                }}
              />
              <span className="slider round"></span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-color)' }}>Email Notifications</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Receive emails for tasks due now, and daily missed task recaps.
                </p>
              </div>
            </div>
            
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={user.emailNotifications !== false} 
                onChange={handleToggleEmail}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
      </motion.div>

      <style>{`
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 28px;
        }
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: var(--border-color);
          transition: .4s;
          border-radius: 34px;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        input:checked + .slider {
          background-color: var(--primary-color);
        }
        input:checked + .slider:before {
          transform: translateX(22px);
        }
      `}</style>
    </>
  );
};

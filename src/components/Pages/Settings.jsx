import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Settings = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    language: 'en',
    timezone: 'UTC',
    autoLogout: true
  });

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSelectChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSave = () => {
    console.log('Settings saved:', settings);
    alert('Settings saved successfully!');
  };

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account preferences and privacy settings</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Notification Preferences</h3>
        </div>
        <div className="card-body">
          <div className="settings-grid">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Email Notifications</h4>
                <p>Receive important updates via email</p>
              </div>
              <div className="setting-control">
                <div 
                  className={`toggle-switch ${settings.emailNotifications ? 'active' : ''}`}
                  onClick={() => handleToggle('emailNotifications')}
                ></div>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>SMS Notifications</h4>
                <p>Receive urgent alerts via text message</p>
              </div>
              <div className="setting-control">
                <div 
                  className={`toggle-switch ${settings.smsNotifications ? 'active' : ''}`}
                  onClick={() => handleToggle('smsNotifications')}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Appearance & Privacy</h3>
        </div>
        <div className="card-body">
          <div className="settings-grid">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Dark Mode</h4>
                <p>Switch to dark theme for better night viewing</p>
              </div>
              <div className="setting-control">
                <div 
                  className={`toggle-switch ${isDarkMode ? 'active' : ''}`}
                  onClick={toggleTheme}
                ></div>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Auto Logout</h4>
                <p>Automatically log out after 30 minutes of inactivity</p>
              </div>
              <div className="setting-control">
                <div 
                  className={`toggle-switch ${settings.autoLogout ? 'active' : ''}`}
                  onClick={() => handleToggle('autoLogout')}
                ></div>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Language</h4>
                <p>Select your preferred language</p>
              </div>
              <div className="setting-control">
                <select 
                  value={settings.language}
                  onChange={(e) => handleSelectChange('language', e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Timezone</h4>
                <p>Set your local timezone for accurate timestamps</p>
              </div>
              <div className="setting-control">
                <select 
                  value={settings.timezone}
                  onChange={(e) => handleSelectChange('timezone', e.target.value)}
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">Eastern Time</option>
                  <option value="PST">Pacific Time</option>
                  <option value="CST">Central Time</option>
                  <option value="MST">Mountain Time</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button onClick={handleSave} className="btn btn-primary">
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;
import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Layout = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [settings, setSettings] = useState({
    fontSize: 'medium',
    compactMode: false,
    showAnimations: true,
    sidebarCollapsed: false
  });

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSave = () => {
    console.log('Layout settings saved:', settings);
    alert('Layout settings saved successfully!');
  };

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <h1 className="page-title">Layout Settings</h1>
        <p className="page-subtitle">Customize your portal appearance and layout preferences</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Display Settings</h3>
        </div>
        <div className="card-body">
          <div className="settings-grid">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Theme Mode</h4>
                <p>Switch between light and dark themes</p>
              </div>
              <div className="setting-control">
                <div 
                  className={`toggle-switch ${isDarkMode ? 'active' : ''}`}
                  onClick={toggleTheme}
                >
                </div>
                <span className="setting-status">{isDarkMode ? 'Dark' : 'Light'}</span>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Font Size</h4>
                <p>Adjust text size for better readability</p>
              </div>
              <div className="setting-control">
                <select 
                  value={settings.fontSize} 
                  onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                  className="form-control"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="extra-large">Extra Large</option>
                </select>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Compact Mode</h4>
                <p>Reduce spacing for more content</p>
              </div>
              <div className="setting-control">
                <div 
                  className={`toggle-switch ${settings.compactMode ? 'active' : ''}`}
                  onClick={() => handleToggle('compactMode')}
                >
                </div>
                <span className="setting-status">{settings.compactMode ? 'On' : 'Off'}</span>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Animations</h4>
                <p>Enable smooth transitions and animations</p>
              </div>
              <div className="setting-control">
                <div 
                  className={`toggle-switch ${settings.showAnimations ? 'active' : ''}`}
                  onClick={() => handleToggle('showAnimations')}
                >
                </div>
                <span className="setting-status">{settings.showAnimations ? 'On' : 'Off'}</span>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Sidebar</h4>
                <p>Collapse sidebar for more space</p>
              </div>
              <div className="setting-control">
                <div 
                  className={`toggle-switch ${settings.sidebarCollapsed ? 'active' : ''}`}
                  onClick={() => handleToggle('sidebarCollapsed')}
                >
                </div>
                <span className="setting-status">{settings.sidebarCollapsed ? 'Collapsed' : 'Expanded'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Preview</h3>
        </div>
        <div className="card-body">
          <div className="layout-preview">
            <div className="preview-item">
              <h4>Sample Card</h4>
              <p>This is how cards will appear with your current settings.</p>
              <button className="btn btn-primary btn-sm">Sample Button</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Actions</h3>
        </div>
        <div className="card-body">
          <div className="form-actions">
            <button onClick={handleSave} className="btn btn-primary">
              Save Layout Settings
            </button>
            <button 
              onClick={() => setSettings({ fontSize: 'medium', compactMode: false, showAnimations: true, sidebarCollapsed: false })}
              className="btn btn-secondary"
            >
              Reset to Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
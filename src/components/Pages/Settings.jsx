import React from 'react';

const Settings = () => {
  return (
    <div className="page-container">
      <h2>Settings</h2>
      <div className="settings-container">
        <div className="form-group">
          <label>
            <input type="checkbox" /> Enable Email Notifications
          </label>
        </div>
        <div className="form-group">
          <label>
            <input type="checkbox" /> Enable SMS Notifications
          </label>
        </div>
        {/* Add more settings as needed */}
      </div>
    </div>
  );
};

export default Settings;
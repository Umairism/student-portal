import React from 'react';

const Layout = () => {
  return (
    <div className="page-container">
      <h2>Page Layout Settings</h2>
      <div className="layout-settings">
        <div className="form-group">
          <label htmlFor="fontSize">Font Size</label>
          <select id="fontSize" className="form-control">
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="theme">Theme</label>
          <select id="theme" className="form-control">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        {/* Add more layout customization options */}
      </div>
    </div>
  );
};

export default Layout;
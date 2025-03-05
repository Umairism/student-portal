import React from 'react';

const Forms = () => {
  return (
    <div className="page-container">
      <h2>Download Forms</h2>
      <div className="forms-container">
        <div className="form-item">
          <h3>Fee Challan Forms</h3>
          <button className="btn">Download</button>
        </div>
        <div className="form-item">
          <h3>Scholarship Forms</h3>
          <button className="btn">Download</button>
        </div>
        {/* Add more form downloads as needed */}
      </div>
    </div>
  );
};

export default Forms;
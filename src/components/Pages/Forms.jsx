import React from 'react';

const Forms = () => {
  const forms = [
    {
      id: 1,
      title: 'Fee Challan Form',
      description: 'Download the fee payment form for current semester',
      category: 'Financial',
      fileSize: '2.3 MB',
      lastUpdated: '2025-01-15'
    },
    {
      id: 2,
      title: 'Scholarship Application',
      description: 'Apply for merit and need-based scholarships',
      category: 'Financial Aid',
      fileSize: '1.8 MB',
      lastUpdated: '2025-01-10'
    },
    {
      id: 3,
      title: 'Course Withdrawal Form',
      description: 'Form to withdraw from enrolled courses',
      category: 'Academic',
      fileSize: '1.2 MB',
      lastUpdated: '2025-01-12'
    },
    {
      id: 4,
      title: 'Transcript Request',
      description: 'Request official academic transcripts',
      category: 'Academic',
      fileSize: '950 KB',
      lastUpdated: '2025-01-08'
    },
    {
      id: 5,
      title: 'Medical Leave Application',
      description: 'Apply for medical leave of absence',
      category: 'Administrative',
      fileSize: '1.5 MB',
      lastUpdated: '2025-01-05'
    },
    {
      id: 6,
      title: 'Dormitory Application',
      description: 'Apply for on-campus housing accommodation',
      category: 'Student Life',
      fileSize: '2.1 MB',
      lastUpdated: '2025-01-03'
    }
  ];

  const handleDownload = (formTitle) => {
    console.log(`Downloading ${formTitle}`);
    alert(`${formTitle} download started!`);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Financial': 'status-badge active',
      'Financial Aid': 'status-badge active',
      'Academic': 'status-badge pending',
      'Administrative': 'status-badge inactive',
      'Student Life': 'status-badge active'
    };
    return colors[category] || 'status-badge';
  };

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <h1 className="page-title">Download Forms</h1>
        <p className="page-subtitle">Access and download official university forms and documents</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Available Forms</h3>
        </div>
        <div className="card-body">
          <div className="forms-grid">
            {forms.map((form) => (
              <div key={form.id} className="form-card">
                <div className="form-card-header">
                  <h4>{form.title}</h4>
                  <span className={getCategoryColor(form.category)}>
                    {form.category}
                  </span>
                </div>
                <div className="form-card-body">
                  <p className="form-description">{form.description}</p>
                  <div className="form-meta">
                    <span className="file-size">Size: {form.fileSize}</span>
                    <span className="last-updated">Updated: {form.lastUpdated}</span>
                  </div>
                </div>
                <div className="form-card-footer">
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => handleDownload(form.title)}
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Help & Instructions</h3>
        </div>
        <div className="card-body">
          <div className="alert info">
            <strong>Note:</strong> All forms require Adobe PDF Reader to view and print. Make sure to fill out forms completely before submission.
          </div>
          <div className="help-section">
            <h4>How to submit forms:</h4>
            <ol>
              <li>Download the required form</li>
              <li>Fill out all necessary information</li>
              <li>Print and sign where required</li>
              <li>Submit to the appropriate office or scan and email</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forms;
import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    priority: 'normal'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Contact form submitted:', formData);
    alert('Message sent successfully! We will get back to you within 24 hours.');
    setFormData({ subject: '', message: '', priority: 'normal' });
  };

  const adminContacts = [
    { name: 'Dr. Sarah Johnson', role: 'Academic Dean', email: 'dean@benchmark.edu', phone: '(555) 123-4567' },
    { name: 'Mr. Michael Brown', role: 'Registrar', email: 'registrar@benchmark.edu', phone: '(555) 123-4568' },
    { name: 'Ms. Emily Davis', role: 'Student Affairs', email: 'affairs@benchmark.edu', phone: '(555) 123-4569' },
    { name: 'IT Support', role: 'Technical Support', email: 'support@benchmark.edu', phone: '(555) 123-4570' }
  ];

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <h1 className="page-title">Contact Administration</h1>
        <p className="page-subtitle">Get in touch with our administrative staff for assistance</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Send Message</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Enter message subject"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Type your message here..."
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Administrative Contacts</h3>
        </div>
        <div className="card-body">
          <div className="contact-grid">
            {adminContacts.map((contact, index) => (
              <div key={index} className="contact-card">
                <h4>{contact.name}</h4>
                <p className="contact-role">{contact.role}</p>
                <div className="contact-details">
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                  <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
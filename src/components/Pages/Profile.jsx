import { useState, useEffect } from 'react';
import { supabase } from '../../supabase.js';

const Profile = () => {
  const [profile, setProfile] = useState({
    full_name: '',
    student_id: '',
    department: '',
    semester: '',
    phone: '',
    date_of_birth: '',
    address: '',
    emergency_contact: '',
    emergency_phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          student_id: data.student_id || '',
          department: data.department || '',
          semester: data.semester || '',
          phone: data.phone || '',
          date_of_birth: data.date_of_birth || '',
          address: data.address || '',
          emergency_contact: data.emergency_contact || '',
          emergency_phone: data.emergency_phone || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error.message);
      setMessage('Error loading profile data');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage('');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      const updates = {
        id: user.id,
        ...profile,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates, {
          onConflict: 'id'
        });

      if (error) throw error;
      
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error.message);
      setMessage('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <h1 className="page-title">Personal Information</h1>
        <p className="page-subtitle">Manage your personal details and contact information</p>
      </div>
      
      {message && (
        <div className={`alert ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}
      
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Student Profile</h3>
        </div>
        <div className="card-body">
          <form onSubmit={updateProfile}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  id="fullName"
                  type="text"
                  value={profile.full_name || ''}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="studentId">Student ID *</label>
                <input
                  id="studentId"
                  type="text"
                  value={profile.student_id || ''}
                  onChange={(e) => setProfile({ ...profile, student_id: e.target.value })}
                  placeholder="Enter your student ID"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="department">Department *</label>
                <input
                  id="department"
                  type="text"
                  value={profile.department || ''}
                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                  placeholder="Enter your department"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="semester">Current Semester</label>
                <select
                  id="semester"
                  value={profile.semester || ''}
                  onChange={(e) => setProfile({ ...profile, semester: e.target.value })}
                >
                  <option value="">Select Semester</option>
                  <option value="1">1st Semester</option>
                  <option value="2">2nd Semester</option>
                  <option value="3">3rd Semester</option>
                  <option value="4">4th Semester</option>
                  <option value="5">5th Semester</option>
                  <option value="6">6th Semester</option>
                  <option value="7">7th Semester</option>
                  <option value="8">8th Semester</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth</label>
                <input
                  id="dateOfBirth"
                  type="date"
                  value={profile.date_of_birth || ''}
                  onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
                />
              </div>
              <div className="form-group form-group-full">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  value={profile.address || ''}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  placeholder="Enter your complete address"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label htmlFor="emergencyContact">Emergency Contact Name</label>
                <input
                  id="emergencyContact"
                  type="text"
                  value={profile.emergency_contact || ''}
                  onChange={(e) => setProfile({ ...profile, emergency_contact: e.target.value })}
                  placeholder="Emergency contact person"
                />
              </div>
              <div className="form-group">
                <label htmlFor="emergencyPhone">Emergency Contact Phone</label>
                <input
                  id="emergencyPhone"
                  type="tel"
                  value={profile.emergency_phone || ''}
                  onChange={(e) => setProfile({ ...profile, emergency_phone: e.target.value })}
                  placeholder="Emergency contact number"
                />
              </div>
            </div>
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
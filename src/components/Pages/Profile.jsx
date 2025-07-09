import { useState, useEffect } from 'react';
import { supabase } from '../../supabase.js';

const Profile = () => {
  const [profile, setProfile] = useState({
    full_name: '',
    student_id: '',
    department: '',
    semester: '',
    phone: ''
  });

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle(); // Use maybeSingle() instead of single()

      if (error) throw error;
      if (data) {
        setProfile(data);
      } else {
        // If no profile exists, create a new one with default values
        const newProfile = {
          id: user.id,
          full_name: '',
          student_id: '',
          department: '',
          semester: '',
          phone: '',
          created_at: new Date().toISOString()
        };
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([newProfile]);
          
        if (insertError) throw insertError;
        setProfile(newProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error.message);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      const updates = {
        id: user.id,
        ...profile,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) throw error;
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error.message);
      alert('Error updating profile. Please try again.');
    }
  };

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <h1 className="page-title">Personal Information</h1>
        <p className="page-subtitle">Manage your personal details and contact information</p>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Student Profile</h3>
        </div>
        <div className="card-body">
          <form onSubmit={updateProfile}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  value={profile.full_name || ''}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="studentId">Student ID</label>
                <input
                  id="studentId"
                  type="text"
                  value={profile.student_id || ''}
                  onChange={(e) => setProfile({ ...profile, student_id: e.target.value })}
                  placeholder="Enter your student ID"
                />
              </div>
              <div className="form-group">
                <label htmlFor="department">Department</label>
                <input
                  id="department"
                  type="text"
                  value={profile.department || ''}
                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                  placeholder="Enter your department"
                />
              </div>
              <div className="form-group">
                <label htmlFor="semester">Semester</label>
                <input
                  id="semester"
                  type="text"
                  value={profile.semester || ''}
                  onChange={(e) => setProfile({ ...profile, semester: e.target.value })}
                  placeholder="Enter current semester"
                />
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
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Update Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

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
    <div className="page-container">
      <h2>Personal Information</h2>
      <form onSubmit={updateProfile}>
        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input
            id="fullName"
            type="text"
            value={profile.full_name || ''}
            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label htmlFor="studentId">Student ID</label>
          <input
            id="studentId"
            type="text"
            value={profile.student_id || ''}
            onChange={(e) => setProfile({ ...profile, student_id: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label htmlFor="department">Department</label>
          <input
            id="department"
            type="text"
            value={profile.department || ''}
            onChange={(e) => setProfile({ ...profile, department: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label htmlFor="semester">Semester</label>
          <input
            id="semester"
            type="text"
            value={profile.semester || ''}
            onChange={(e) => setProfile({ ...profile, semester: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            type="tel"
            value={profile.phone || ''}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Update Profile
        </button>
      </form>
    </div>
  );
};

export default Profile;
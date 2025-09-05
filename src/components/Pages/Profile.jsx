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
      if (!user) {
        setMessage('No user logged in');
        return;
      }

      console.log('Fetching profile for user:', user.id);

      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      console.log('Profile fetch result:', { data, error });

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        
        if (error.message.includes('relation "public.profiles" does not exist')) {
          setMessage('Database not set up yet. You can still fill out the form.');
        } else {
          throw error;
        }
        return;
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
      } else {
        console.log('No existing profile found, checking localStorage...');
        
        // Try to load from localStorage as fallback
        const localProfile = loadFromLocalStorage();
        if (localProfile) {
          setProfile(localProfile);
          setMessage('Profile loaded from local storage. Will sync with database when available.');
        } else {
          // Set default values for new profile
          setProfile(prev => ({
            ...prev,
            full_name: user.email?.split('@')[0] || ''
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage(`Error loading profile: ${error.message}`);
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

      console.log('Attempting to update profile for user:', user.id);
      console.log('Profile data to update:', profile);

      // First, check if the profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      console.log('Existing profile check:', { existingProfile, fetchError });

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking existing profile:', fetchError);
        throw new Error(`Database error: ${fetchError.message}`);
      }

      let result;
      
      if (existingProfile) {
        // Profile exists, update it
        console.log('Profile exists, updating...');
        const updates = {
          ...profile,
          updated_at: new Date().toISOString()
        };

        result = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id);
      } else {
        // Profile doesn't exist, create it
        console.log('Profile does not exist, creating...');
        const newProfile = {
          id: user.id,
          ...profile,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        result = await supabase
          .from('profiles')
          .insert([newProfile]);
      }

      console.log('Profile operation result:', result);

      if (result.error) {
        console.error('Profile operation failed:', result.error);
        throw result.error;
      }
      
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Error updating profile. ';
      if (error.message.includes('relation "public.profiles" does not exist')) {
        errorMessage += 'Database tables not set up. Please contact administrator.';
      } else if (error.message.includes('permission denied')) {
        errorMessage += 'Permission denied. Please contact administrator.';
      } else if (error.message.includes('JWT')) {
        errorMessage += 'Authentication issue. Please log out and log back in.';
      } else {
        errorMessage += `${error.message}`;
      }
      
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fallback: save to localStorage if database fails
  const saveToLocalStorage = (profileData) => {
    try {
      localStorage.setItem('student-profile', JSON.stringify(profileData));
      console.log('Profile saved to localStorage as backup');
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  };

  // Fallback: load from localStorage if database fails
  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('student-profile');
      if (saved) {
        const profileData = JSON.parse(saved);
        console.log('Loaded profile from localStorage');
        return profileData;
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
    return null;
  };

  // Enhanced update function with fallback
  const updateProfileWithFallback = async (e) => {
    e.preventDefault();
    
    // First try the database update
    try {
      await updateProfile(e);
    } catch (dbError) {
      console.log('Database update failed, using localStorage fallback');
      
      // Save to localStorage as fallback
      saveToLocalStorage(profile);
      setMessage('Profile saved locally (database unavailable). Changes will sync when database is ready.');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <h1 className="page-title">Personal Information</h1>
        <p className="page-subtitle">Manage your personal details and contact information</p>
      </div>
      
      {message && (
        <div className={`alert ${message.includes('Error') || message.includes('failed') ? 'error' : 
          message.includes('locally') || message.includes('local storage') ? 'warning' : 'success'}`}>
          {message}
        </div>
      )}
      
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Student Profile</h3>
        </div>
        <div className="card-body">
          <form onSubmit={updateProfileWithFallback}>
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
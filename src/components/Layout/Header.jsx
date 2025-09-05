import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../supabase.js';

const Header = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Fetch user profile to get name and avatar
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single();
        
        setProfile(profile);
      }
    };
    getUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleImageUpload = async (event) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      
      if (!file) return;

      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // For now, let's use a simple base64 approach until Supabase storage is configured
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64String = e.target.result;
        
        try {
          // Update profile with base64 image
          const { error: updateError } = await supabase
            .from('profiles')
            .upsert({ 
              id: user.id,
              avatar_url: base64String,
              updated_at: new Date().toISOString()
            });

          if (updateError) throw updateError;

          // Update local state
          setProfile(prev => ({ ...prev, avatar_url: base64String }));
          console.log('Profile updated successfully');
        } catch (error) {
          console.error('Error updating profile:', error);
          // Fallback: just update local state
          setProfile(prev => ({ ...prev, avatar_url: base64String }));
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Student';

  return (
    <header className="header">
      <div className="header-brand">
        <span className="header-logo">🎓</span>
        <div>
          <h1>Student Portal</h1>
          <span className="header-subtitle">Benchmark School Systems</span>
        </div>
      </div>
      <div className="profile-section">
        {user && (
          <>
            <div className="user-info">
              <span className="user-name">{displayName}</span>
              <span className="user-role">Student</span>
            </div>
            <div className="profile-image-container">
              <img
                src={profile?.avatar_url || 'https://via.placeholder.com/40/1e3c72/ffffff?text=' + displayName.charAt(0).toUpperCase()}
                alt="Profile"
                className="profile-image"
                onClick={() => fileInputRef.current?.click()}
                title="Click to upload profile picture"
              />
              {uploading && <div className="upload-spinner">⏳</div>}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </div>
            <button onClick={handleSignOut} className="btn btn-outline btn-sm">Sign Out</button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
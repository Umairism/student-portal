import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

const Header = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="header">
      <h1>Student Portal</h1>
      <div className="profile-section">
        {user && (
          <>
            <img
              src={user.user_metadata?.avatar_url || 'https://via.placeholder.com/40'}
              alt="Profile"
              className="profile-image"
            />
            <div>
              <p>{user.email}</p>
              <button onClick={handleSignOut} className="btn">Sign Out</button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
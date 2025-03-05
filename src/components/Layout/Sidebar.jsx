import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FaUser, 
  FaGraduationCap, 
  FaBook, 
  FaExchangeAlt, 
  FaDownload, 
  FaEnvelope, 
  FaCog,
  FaPalette,
  FaBars,
  FaSignOutAlt
} from 'react-icons/fa';
import { supabase } from '../../supabaseClient';  // Make sure you import your Supabase client

const menuItems = [
  { path: '/profile', icon: <FaUser />, label: 'Modify Personal' },
  { path: '/results', icon: <FaGraduationCap />, label: 'Check Semester Result' },
  { path: '/courses', icon: <FaBook />, label: 'Select Courses' },
  { path: '/change-course', icon: <FaExchangeAlt />, label: 'Change of Course' },
  { path: '/forms', icon: <FaDownload />, label: 'Download Forms' },
  { path: '/contact', icon: <FaEnvelope />, label: 'Contact Admin Staff' },
  { path: '/settings', icon: <FaCog />, label: 'Settings' },
  { path: '/layout', icon: <FaPalette />, label: 'Page Layout' },
  { path: '/auth', icon: <FaSignOutAlt />, label: 'Sign Out' }
];

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();  // Supabase sign-out
      navigate('/auth');  // Redirect to Auth page (login/signup)
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button className="menu-button" onClick={toggleSidebar}>
        <FaBars />
      </button>

      <div className="menu-items">
        {menuItems.map((item) => (
          item.label === 'Sign Out' ? (
            <button key={item.path} onClick={handleLogout} className="menu-item logout">
              {item.icon}
              <span>{item.label}</span>
            </button>
          ) : (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          )
        ))}
      </div>
    </div>
  );
};

export default Sidebar;

import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
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
import { supabase } from '../../supabase.js';

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
  const location = useLocation();
  const sidebarRef = useRef(null);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  // Close sidebar when route changes
  useEffect(() => {
    closeSidebar();
  }, [location.pathname]);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && isOpen) {
        closeSidebar();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
      closeSidebar();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleMenuItemClick = () => {
    closeSidebar();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
      
      <div ref={sidebarRef} className={`sidebar ${isOpen ? 'open' : ''}`}>
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
                onClick={handleMenuItemClick}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            )
          ))}
        </div>
      </div>
    </>
  );
};

export default Sidebar;

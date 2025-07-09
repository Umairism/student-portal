import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabase.js';
import { 
  FaUser, 
  FaGraduationCap, 
  FaBook, 
  FaCalendarAlt,
  FaClipboardList,
  FaBell
} from 'react-icons/fa';

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalCredits: 0,
    completedCourses: 0,
    currentGPA: 0
  });
  const [loading, setLoading] = useState(true);
  const [notifications] = useState([
    { id: 1, message: "Assignment due for Database Systems - March 15", type: "warning" },
    { id: 2, message: "New grade posted for Data Structures", type: "info" },
    { id: 3, message: "Course registration for next semester opens soon", type: "info" }
  ]);

  useEffect(() => {
    // Test database connection
    const testConnection = async () => {
      try {
        console.log('Testing Supabase connection...');
        const { data, error } = await supabase.from('profiles').select('count(*)', { count: 'exact', head: true });
        console.log('Connection test result:', { data, error });
      } catch (err) {
        console.error('Connection test failed:', err);
      }
    };
    
    testConnection();
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found');
        // Set demo data if no user
        setProfile({
          full_name: 'Demo Student',
          student_id: 'DEMO001',
          department: 'Computer Science',
          semester: '3',
          phone: '+1-555-123-4567',
          address: '123 University Ave, Demo City'
        });
        setLoading(false);
        return;
      }

      console.log('Fetching profile for user:', user.id);

      // First, let's try to see if the profiles table exists
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        console.log('Profile fetch result:', { profileData, profileError });

        if (profileData) {
          console.log('Setting profile data:', profileData);
          setProfile(profileData);
        } else if (profileError?.code === 'PGRST116') {
          // No profile found, try to create one
          console.log('No profile found, creating default profile');
          const defaultProfile = {
            id: user.id,
            full_name: user.email?.split('@')[0] || 'Student',
            student_id: `STU${Date.now().toString().slice(-6)}`,
            department: 'Computer Science',
            semester: '1',
            phone: '+1-234-567-8900',
            address: '123 University Ave, Campus City'
          };

          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert([defaultProfile])
            .select()
            .single();

          console.log('Profile creation result:', { newProfile, insertError });

          if (!insertError && newProfile) {
            setProfile(newProfile);
          } else {
            // If creation fails, set the default profile anyway for display
            setProfile(defaultProfile);
          }
        } else {
          // Other database error, use fallback
          console.error('Database error:', profileError);
          setProfile({
            full_name: user.email?.split('@')[0] || 'Student',
            student_id: 'TEMP001',
            department: 'Computer Science',
            semester: '1',
            phone: 'Not set',
            address: 'Not set'
          });
        }
      } catch (dbError) {
        // Table might not exist
        console.error('Database access error:', dbError);
        setProfile({
          full_name: user.email?.split('@')[0] || 'Student',
          student_id: 'TEMP001',
          department: 'Computer Science',
          semester: '1', 
          phone: 'Database not configured',
          address: 'Database not configured'
        });
      }

      // Try to fetch courses
      try {
        const { data: coursesData, error: coursesError } = await supabase
          .from('course_enrollments')
          .select(`
            *,
            courses(
              course_code,
              course_name,
              credits,
              instructor_name,
              departments(name)
            )
          `)
          .eq('student_id', user.id)
          .eq('status', 'enrolled');

        if (coursesError) {
          console.error('Error fetching courses:', coursesError.message);
        }

        if (coursesData && coursesData.length > 0) {
          setEnrolledCourses(coursesData);
          
          // Calculate stats
          const totalCredits = coursesData.reduce((sum, enrollment) => 
            sum + (enrollment.courses?.credits || 0), 0);
          
          setStats({
            totalCourses: coursesData.length,
            totalCredits,
            completedCourses: coursesData.filter(c => c.status === 'completed').length,
            currentGPA: coursesData.length > 0 ? 3.45 : 0.00 // This would be calculated from actual grades
          });
        } else {
          // Set default stats if no courses
          setStats({
            totalCourses: 0,
            totalCredits: 0,
            completedCourses: 0,
            currentGPA: 0.00
          });
        }
      } catch (coursesError) {
        console.error('Error accessing courses table:', coursesError);
        setStats({
          totalCourses: 0,
          totalCredits: 0,
          completedCourses: 0,
          currentGPA: 0.00
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error.message);
      
      // Set fallback data if everything fails
      setProfile({
        full_name: 'Demo Student',
        student_id: 'STU12345',
        department: 'Computer Science',
        semester: '3',
        phone: '+1-555-123-4567',
        address: '123 University Ave, Demo City'
      });
      
      setStats({
        totalCourses: 0,
        totalCredits: 0,
        completedCourses: 0,
        currentGPA: 0.00
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="content-wrapper">
        <div className="loading-spinner">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <h1 className="page-title">
          Welcome back, {profile?.full_name || 'Student'}!
        </h1>
        <p className="page-subtitle">
          Here's an overview of your academic progress
        </p>
      </div>

      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon">
            <FaBook />
          </div>
          <div className="stat-content">
            <h3>Current Courses</h3>
            <div className="stat-number">{stats.totalCourses}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaClipboardList />
          </div>
          <div className="stat-content">
            <h3>Total Credits</h3>
            <div className="stat-number">{stats.totalCredits}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaGraduationCap />
          </div>
          <div className="stat-content">
            <h3>Current GPA</h3>
            <div className="stat-number">{stats.currentGPA.toFixed(2)}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaCalendarAlt />
          </div>
          <div className="stat-content">
            <h3>Semester</h3>
            <div className="stat-number">{profile?.semester || 'N/A'}</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Profile Summary */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <FaUser className="card-icon" />
              Profile Summary
            </h3>
          </div>
          <div className="card-body">
            <div className="profile-summary">
              <div className="profile-item">
                <label>Student ID:</label>
                <span>{profile?.student_id || 'Not set'}</span>
              </div>
              <div className="profile-item">
                <label>Department:</label>
                <span>{profile?.department || 'Not set'}</span>
              </div>
              <div className="profile-item">
                <label>Phone:</label>
                <span>{profile?.phone || 'Not set'}</span>
              </div>
              <div className="profile-item">
                <label>Address:</label>
                <span>{profile?.address || 'Not set'}</span>
              </div>
            </div>
            <div className="card-actions">
              <Link to="/profile" className="btn btn-outline">Update Profile</Link>
            </div>
          </div>
        </div>

        {/* Current Courses */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <FaBook className="card-icon" />
              Current Courses
            </h3>
          </div>
          <div className="card-body">
            {enrolledCourses.length === 0 ? (
              <div className="empty-state">
                <p>No courses enrolled for this semester</p>
                <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
              </div>
            ) : (
              <div className="course-summary-list">
                {enrolledCourses.slice(0, 4).map(enrollment => (
                  <div key={enrollment.id} className="course-summary-item">
                    <div className="course-info">
                      <h4>{enrollment.courses?.course_code}</h4>
                      <p>{enrollment.courses?.course_name}</p>
                      <small>{enrollment.courses?.credits} credits</small>
                    </div>
                    <div className="course-status">
                      <span className={`status-badge ${enrollment.status}`}>
                        {enrollment.status}
                      </span>
                    </div>
                  </div>
                ))}
                {enrolledCourses.length > 4 && (
                  <div className="see-more">
                    <Link to="/courses">View all courses</Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <FaBell className="card-icon" />
              Recent Notifications
            </h3>
          </div>
          <div className="card-body">
            <div className="notification-list">
              {notifications.map(notification => (
                <div key={notification.id} className={`notification-item ${notification.type}`}>
                  <div className="notification-content">
                    <p>{notification.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>
          <div className="card-body">
            <div className="quick-actions">
              <Link to="/courses" className="quick-action-item">
                <FaBook />
                <span>Browse Courses</span>
              </Link>
              <Link to="/results" className="quick-action-item">
                <FaGraduationCap />
                <span>View Results</span>
              </Link>
              <Link to="/change-course" className="quick-action-item">
                <FaClipboardList />
                <span>Change Courses</span>
              </Link>
              <Link to="/forms" className="quick-action-item">
                <FaCalendarAlt />
                <span>Download Forms</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

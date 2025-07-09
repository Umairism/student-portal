import React, { useState, useEffect } from 'react';
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
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch enrolled courses
      const { data: coursesData } = await supabase
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

      if (coursesData) {
        setEnrolledCourses(coursesData);
        
        // Calculate stats
        const totalCredits = coursesData.reduce((sum, enrollment) => 
          sum + (enrollment.courses?.credits || 0), 0);
        
        setStats({
          totalCourses: coursesData.length,
          totalCredits,
          completedCourses: coursesData.filter(c => c.status === 'completed').length,
          currentGPA: 3.45 // This would be calculated from actual grades
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error.message);
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
              <a href="/profile" className="btn btn-outline">Update Profile</a>
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
                <a href="/courses" className="btn btn-primary">Browse Courses</a>
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
                    <a href="/courses">View all courses</a>
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
              <a href="/courses" className="quick-action-item">
                <FaBook />
                <span>Browse Courses</span>
              </a>
              <a href="/results" className="quick-action-item">
                <FaGraduationCap />
                <span>View Results</span>
              </a>
              <a href="/change-course" className="quick-action-item">
                <FaClipboardList />
                <span>Change Courses</span>
              </a>
              <a href="/forms" className="quick-action-item">
                <FaCalendarAlt />
                <span>Download Forms</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase.js';

const ChangeCourse = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchEnrolledCourses();
    fetchAvailableCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          courses(
            id,
            course_code,
            course_name,
            credits,
            semester,
            instructor_name,
            departments(name, code)
          )
        `)
        .eq('student_id', user.id)
        .eq('status', 'enrolled');

      if (error) throw error;
      setEnrolledCourses(data || []);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error.message);
      setMessage('Error loading enrolled courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          departments(name, code)
        `)
        .eq('is_active', true)
        .order('course_code');

      if (error) throw error;
      setAvailableCourses(data || []);
    } catch (error) {
      console.error('Error fetching available courses:', error.message);
    }
  };

  const handleDropCourse = async (enrollmentId, courseName) => {
    if (!confirm(`Are you sure you want to drop ${courseName}?`)) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('course_enrollments')
        .update({ status: 'dropped' })
        .eq('id', enrollmentId);

      if (error) throw error;

      setMessage(`Successfully dropped ${courseName}`);
      fetchEnrolledCourses(); // Refresh the list
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error dropping course:', error.message);
      setMessage('Error dropping course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (courseId, courseName) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('course_enrollments')
        .upsert({
          student_id: user.id,
          course_id: courseId,
          status: 'enrolled'
        }, {
          onConflict: 'student_id,course_id'
        });

      if (error) throw error;

      setMessage(`Successfully enrolled in ${courseName}`);
      fetchEnrolledCourses(); // Refresh the list
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error adding course:', error.message);
      setMessage('Error enrolling in course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isAlreadyEnrolled = (courseId) => {
    return enrolledCourses.some(enrollment => enrollment.courses.id === courseId);
  };

  const totalCredits = enrolledCourses.reduce((sum, enrollment) => {
    return sum + (enrollment.courses?.credits || 0);
  }, 0);

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <h1 className="page-title">Change of Course</h1>
        <p className="page-subtitle">Modify your course enrollments - drop or add courses</p>
      </div>

      {message && (
        <div className={`alert ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Enrolled Courses</h3>
          <div className="stat-number">{enrolledCourses.length}</div>
        </div>
        <div className="stat-card">
          <h3>Total Credits</h3>
          <div className="stat-number">{totalCredits}</div>
        </div>
        <div className="stat-card">
          <h3>Credit Limit</h3>
          <div className="stat-number">18</div>
        </div>
      </div>

      {/* Currently Enrolled Courses */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Currently Enrolled Courses</h3>
        </div>
        <div className="card-body">
          {loading && enrolledCourses.length === 0 ? (
            <div className="loading-spinner">Loading enrolled courses...</div>
          ) : enrolledCourses.length === 0 ? (
            <div className="empty-state">
              <p>You are not currently enrolled in any courses.</p>
            </div>
          ) : (
            <div className="course-list">
              {enrolledCourses.map(enrollment => (
                <div key={enrollment.id} className="course-item enrolled">
                  <div className="course-details">
                    <div className="course-header">
                      <h4>{enrollment.courses.course_code} - {enrollment.courses.course_name}</h4>
                      <span className="course-credits">{enrollment.courses.credits} Credits</span>
                    </div>
                    <div className="course-info">
                      <span>Department: {enrollment.courses.departments?.name || 'Unknown'}</span>
                      <span>Semester: {enrollment.courses.semester}</span>
                      <span>Instructor: {enrollment.courses.instructor_name || 'TBA'}</span>
                      <span>Status: {enrollment.status}</span>
                    </div>
                  </div>
                  <div className="course-actions">
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDropCourse(enrollment.id, enrollment.courses.course_name)}
                      disabled={loading}
                    >
                      Drop Course
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Available Courses to Add */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Available Courses to Add</h3>
        </div>
        <div className="card-body">
          {totalCredits >= 18 && (
            <div className="alert warning">
              <strong>Credit Limit Reached:</strong> You have reached the maximum credit limit (18). 
              Drop some courses to add new ones.
            </div>
          )}
          
          <div className="course-list">
            {availableCourses
              .filter(course => !isAlreadyEnrolled(course.id))
              .map(course => (
                <div key={course.id} className="course-item available">
                  <div className="course-details">
                    <div className="course-header">
                      <h4>{course.course_code} - {course.course_name}</h4>
                      <span className="course-credits">{course.credits} Credits</span>
                    </div>
                    <div className="course-info">
                      <span>Department: {course.departments?.name || 'Unknown'}</span>
                      <span>Semester: {course.semester}</span>
                      <span>Instructor: {course.instructor_name || 'TBA'}</span>
                      <span>Capacity: {course.current_enrollment || 0}/{course.max_capacity || 50}</span>
                    </div>
                    {course.description && (
                      <div className="course-description">
                        <p>{course.description}</p>
                      </div>
                    )}
                  </div>
                  <div className="course-actions">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAddCourse(course.id, course.course_name)}
                      disabled={loading || totalCredits + course.credits > 18}
                    >
                      Add Course
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangeCourse;
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase.js';

const Courses = () => {
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualCourse, setManualCourse] = useState({
    course_code: '',
    course_name: '',
    department: '',
    credits: 3,
    semester: 1,
    description: ''
  });

  useEffect(() => {
    fetchCourses();
    fetchDepartments();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
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
      console.error('Error fetching courses:', error.message);
      setMessage('Error loading courses from database');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error.message);
    }
  };

  const handleCourseSelection = (courseId) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleManualCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // First, find or create the department
      let departmentId;
      const { data: existingDept, error: deptFindError } = await supabase
        .from('departments')
        .select('id')
        .ilike('name', manualCourse.department)
        .single();

      if (existingDept) {
        departmentId = existingDept.id;
      } else {
        // Create new department
        const { data: newDept, error: deptCreateError } = await supabase
          .from('departments')
          .insert([{
            name: manualCourse.department,
            code: manualCourse.department.substring(0, 4).toUpperCase(),
            description: `${manualCourse.department} Department`
          }])
          .select()
          .single();

        if (deptCreateError) throw deptCreateError;
        departmentId = newDept.id;
        
        // Add to departments list
        setDepartments(prev => [...prev, newDept]);
      }
      
      // Insert the manual course into database
      const { data, error } = await supabase
        .from('courses')
        .insert([{
          course_code: manualCourse.course_code,
          course_name: manualCourse.course_name,
          department_id: departmentId,
          credits: manualCourse.credits,
          semester: manualCourse.semester,
          description: manualCourse.description,
          instructor_name: 'TBA',
          max_capacity: 50,
          current_enrollment: 0
        }])
        .select()
        .single();

      if (error) throw error;

      // Add to available courses and select it
      const newCourse = { ...data, departments: { name: manualCourse.department, code: manualCourse.department.substring(0, 4).toUpperCase() } };
      setAvailableCourses(prev => [...prev, newCourse]);
      setSelectedCourses(prev => [...prev, data.id]);
      
      // Reset form
      setManualCourse({
        course_code: '',
        course_name: '',
        department: '',
        credits: 3,
        semester: 1,
        description: ''
      });
      setShowManualEntry(false);
      setMessage('Course added successfully and selected for registration!');
    } catch (error) {
      console.error('Error adding manual course:', error.message);
      setMessage('Error adding course. Please check if course code already exists.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      // Get user's profile to use as student_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      // Insert enrollments
      const enrollments = selectedCourses.map(courseId => ({
        student_id: profile.id,
        course_id: courseId,
        status: 'enrolled'
      }));

      const { error } = await supabase
        .from('course_enrollments')
        .upsert(enrollments, {
          onConflict: 'student_id,course_id'
        });

      if (error) throw error;

      setMessage('Course registration completed successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error submitting course registration:', error.message);
      setMessage('Error registering for courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalCredits = availableCourses
    .filter(course => selectedCourses.includes(course.id))
    .reduce((sum, course) => sum + course.credits, 0);

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <h1 className="page-title">Course Registration</h1>
        <p className="page-subtitle">Select courses for the upcoming semester</p>
      </div>

      {message && (
        <div className={`alert ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Available Courses - Spring 2025</h3>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => setShowManualEntry(!showManualEntry)}
          >
            {showManualEntry ? 'Cancel' : 'Add Custom Course'}
          </button>
        </div>
        <div className="card-body">
          <div className="alert info">
            <strong>Selected Credits:</strong> {totalCredits} | <strong>Maximum Credits:</strong> 18
          </div>

          {showManualEntry && (
            <div className="manual-course-form">
              <h4>Add Custom Course</h4>
              <form onSubmit={handleManualCourseSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="courseCode">Course Code *</label>
                    <input
                      id="courseCode"
                      type="text"
                      value={manualCourse.course_code}
                      onChange={(e) => setManualCourse({...manualCourse, course_code: e.target.value.toUpperCase()})}
                      placeholder="e.g., CS401"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="courseName">Course Name *</label>
                    <input
                      id="courseName"
                      type="text"
                      value={manualCourse.course_name}
                      onChange={(e) => setManualCourse({...manualCourse, course_name: e.target.value})}
                      placeholder="e.g., Advanced Algorithms"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="department">Department *</label>
                    <input
                      id="department"
                      type="text"
                      value={manualCourse.department}
                      onChange={(e) => setManualCourse({...manualCourse, department: e.target.value})}
                      placeholder="e.g., Computer Science, Mathematics"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="credits">Credits *</label>
                    <select
                      id="credits"
                      value={manualCourse.credits}
                      onChange={(e) => setManualCourse({...manualCourse, credits: parseInt(e.target.value)})}
                      required
                    >
                      <option value={1}>1 Credit</option>
                      <option value={2}>2 Credits</option>
                      <option value={3}>3 Credits</option>
                      <option value={4}>4 Credits</option>
                      <option value={5}>5 Credits</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="semester">Semester *</label>
                    <select
                      id="semester"
                      value={manualCourse.semester}
                      onChange={(e) => setManualCourse({...manualCourse, semester: parseInt(e.target.value)})}
                      required
                    >
                      {[1,2,3,4,5,6,7,8].map(sem => (
                        <option key={sem} value={sem}>Semester {sem}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group form-group-full">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      value={manualCourse.description}
                      onChange={(e) => setManualCourse({...manualCourse, description: e.target.value})}
                      placeholder="Course description (optional)"
                      rows="2"
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Course & Select'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading && availableCourses.length === 0 ? (
            <div className="loading-spinner">Loading courses...</div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="course-list">
                {availableCourses.length === 0 ? (
                  <div className="empty-state">
                    <p>No courses available. Add a custom course to get started.</p>
                  </div>
                ) : (
                  availableCourses.map(course => (
                    <div 
                      key={course.id} 
                      className={`course-item ${selectedCourses.includes(course.id) ? 'selected' : ''}`}
                    >
                      <div className="course-checkbox">
                        <input
                          type="checkbox"
                          id={`course-${course.id}`}
                          checked={selectedCourses.includes(course.id)}
                          onChange={() => handleCourseSelection(course.id)}
                        />
                      </div>
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
                    </div>
                  ))
                )}
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={selectedCourses.length === 0 || loading}
                >
                  {loading ? 'Registering...' : 'Register for Selected Courses'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses;
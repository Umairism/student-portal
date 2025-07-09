import React, { useState } from 'react';

const Courses = () => {
  const [selectedCourses, setSelectedCourses] = useState([]);
  
  // Sample available courses
  const availableCourses = [
    { id: 1, code: 'CS201', name: 'Data Structures', credits: 4, instructor: 'Dr. Smith', time: 'MWF 10:00-11:00' },
    { id: 2, code: 'MATH201', name: 'Calculus II', credits: 3, instructor: 'Dr. Johnson', time: 'TTh 2:00-3:30' },
    { id: 3, code: 'PHY201', name: 'Physics II', credits: 3, instructor: 'Dr. Brown', time: 'MWF 1:00-2:00' },
    { id: 4, code: 'ENG201', name: 'Literature', credits: 2, instructor: 'Prof. Davis', time: 'TTh 11:00-12:00' },
    { id: 5, code: 'CS301', name: 'Database Systems', credits: 4, instructor: 'Dr. Wilson', time: 'MWF 3:00-4:00' },
    { id: 6, code: 'STAT201', name: 'Statistics', credits: 3, instructor: 'Dr. Taylor', time: 'TTh 9:00-10:30' }
  ];

  const handleCourseSelection = (courseId) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedCourseDetails = availableCourses.filter(course => selectedCourses.includes(course.id));
    console.log('Selected courses:', selectedCourseDetails);
    alert('Course registration submitted successfully!');
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

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Available Courses - Spring 2025</h3>
        </div>
        <div className="card-body">
          <div className="alert info">
            <strong>Selected Credits:</strong> {totalCredits} | <strong>Maximum Credits:</strong> 18
          </div>

          <form onSubmit={handleSubmit}>
            <div className="course-list">
              {availableCourses.map(course => (
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
                      <h4>{course.code} - {course.name}</h4>
                      <span className="course-credits">{course.credits} Credits</span>
                    </div>
                    <div className="course-info">
                      <span>Instructor: {course.instructor}</span>
                      <span>Time: {course.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={selectedCourses.length === 0}>
                Register for Selected Courses
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Courses;
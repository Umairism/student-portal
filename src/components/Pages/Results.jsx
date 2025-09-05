import React from 'react';

const Results = () => {
  // Sample data - in a real app this would come from the database
  const semesterResults = [
    { subject: 'Mathematics', code: 'MATH101', credits: 3, grade: 'A', gpa: 4.0 },
    { subject: 'Computer Science', code: 'CS101', credits: 4, grade: 'A-', gpa: 3.7 },
    { subject: 'Physics', code: 'PHY101', credits: 3, grade: 'B+', gpa: 3.3 },
    { subject: 'English', code: 'ENG101', credits: 2, grade: 'A', gpa: 4.0 },
    { subject: 'History', code: 'HIS101', credits: 2, grade: 'B', gpa: 3.0 }
  ];

  const totalCredits = semesterResults.reduce((sum, course) => sum + course.credits, 0);
  const totalGradePoints = semesterResults.reduce((sum, course) => sum + (course.gpa * course.credits), 0);
  const semesterGPA = (totalGradePoints / totalCredits).toFixed(2);

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <h1 className="page-title">Semester Results</h1>
        <p className="page-subtitle">View your academic performance and grades</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Current Semester - Spring 2025</h3>
        </div>
        <div className="card-body">
          <div className="alert info">
            <strong>Semester GPA:</strong> {semesterGPA} | <strong>Total Credits:</strong> {totalCredits}
          </div>
          
          <table className="data-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Course Code</th>
                <th>Credits</th>
                <th>Grade</th>
                <th>GPA</th>
              </tr>
            </thead>
            <tbody>
              {semesterResults.map((course, index) => (
                <tr key={index}>
                  <td>{course.subject}</td>
                  <td>{course.code}</td>
                  <td>{course.credits}</td>
                  <td>
                    <span className={`status-badge ${course.grade === 'A' || course.grade === 'A-' ? 'active' : course.grade.startsWith('B') ? 'pending' : 'inactive'}`}>
                      {course.grade}
                    </span>
                  </td>
                  <td>{course.gpa.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Results;
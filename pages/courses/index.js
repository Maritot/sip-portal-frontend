// pages/courses/index.js
import React from 'react';
import CourseList from '../../components/CourseList'; // Adjust path
import Layout from '../../components/Layout'; // Assuming Layout is used via _app.js
import ProtectedRoute from '../../components/ProtectedRoute'; // Protect this page

const CoursesPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Available Courses</h1>
      <CourseList />
    </div>
  );
};

// Protect this page - allow all logged-in users to view courses
// Adjust roles if only specific roles should see the main course list
export default ProtectedRoute(CoursesPage, ['Admin', 'Mentor', 'Mentee']);
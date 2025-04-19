// components/CourseList.js
import React, { useState, useEffect } from 'react';
import apiClient from '../lib/apiClient'; // Adjust path
import Link from 'next/link';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress'; // For loading state
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get('/courses'); // Fetch from /api/v1/courses
        setCourses(response.data || []); // Ensure courses is always an array
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError(err.response?.data?.message || 'Failed to load courses.');
        setCourses([]); // Reset courses on error
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center p-10"><CircularProgress /></div>;
  }

  if (error) {
    return <Alert severity="error" className="mt-4">{error}</Alert>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.length === 0 ? (
        <p className="col-span-full text-center text-gray-500 dark:text-gray-400">No courses found.</p>
      ) : (
        courses.map((course) => (
          <Card key={course._id} className="shadow-lg dark:bg-gray-800">
            <CardContent>
              <Typography variant="h5" component="div" className="font-semibold mb-2 dark:text-white">
                {course.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mb-2 dark:text-gray-300">
                {course.description.substring(0, 100)}{course.description.length > 100 ? '...' : ''}
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary" className="dark:text-gray-400">
                 Mentor: {course.mentor?.firstName} {course.mentor?.lastName}
              </Typography>
               <Typography variant="caption" display="block" color="text.secondary" className="dark:text-gray-400">
                 Status: {course.status}
               </Typography>
            </CardContent>
            <CardActions>
              <Link href={`/courses/${course._id}`} passHref>
                 <Button size="small" color="primary">View Details</Button>
              </Link>
              {/* Add Edit/Delete buttons here later, conditionally based on user role/ownership */}
            </CardActions>
          </Card>
        ))
      )}
    </div>
  );
};

export default CourseList;
// pages/mentor/courses/create.js
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import apiClient from '../../../lib/apiClient'; // Adjust path
import useAuth from '../../../hooks/useAuth'; // Adjust path
import ProtectedRoute from '../../../components/ProtectedRoute'; // Adjust path
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

const CreateCoursePage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Draft'); // Default status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const router = useRouter();
  const { user } = useAuth(); // Needed for role check, though ProtectedRoute handles access

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!title || !description) {
        setError('Title and Description are required.');
        setLoading(false);
        return;
    }

    try {
      const response = await apiClient.post('/courses', {
        title,
        description,
        status,
        // Mentor ID is added automatically on the backend from the authenticated user
      });

      if (response.data && response.status === 201) {
        setSuccess(`Course "${response.data.title}" created successfully! Redirecting...`);
        // Optionally clear form
        setTitle('');
        setDescription('');
        setStatus('Draft');
        // Redirect to the new course page or mentor dashboard after a delay
        setTimeout(() => {
          // Redirect to the course detail page or mentor's course list
          router.push(`/courses/${response.data._id}`); // Or '/mentor/dashboard'
        }, 2000);
      } else {
          throw new Error('Failed to create course: Invalid response');
      }
    } catch (err) {
      console.error("Error creating course:", err);
      setError(err.response?.data?.message || 'Failed to create course.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Create New Course</h1>
       <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
         {error && <Alert severity="error" className="mb-4">{error}</Alert>}
         {success && <Alert severity="success" className="mb-4">{success}</Alert>}

         <TextField
           fullWidth
           label="Course Title"
           variant="outlined"
           value={title}
           onChange={(e) => setTitle(e.target.value)}
           required
           disabled={loading}
         />

         <TextField
           fullWidth
           label="Course Description"
           variant="outlined"
           multiline
           rows={4}
           value={description}
           onChange={(e) => setDescription(e.target.value)}
           required
           disabled={loading}
         />

         <FormControl fullWidth>
           <InputLabel id="status-select-label">Status</InputLabel>
           <Select
             labelId="status-select-label"
             id="status-select"
             value={status}
             label="Status"
             onChange={(e) => setStatus(e.target.value)}
             disabled={loading}
           >
             <MenuItem value={'Draft'}>Draft</MenuItem>
             <MenuItem value={'Published'}>Published</MenuItem>
             <MenuItem value={'Archived'}>Archived</MenuItem>
           </Select>
         </FormControl>

         <Button
           type="submit"
           variant="contained"
           color="primary"
           disabled={loading}
           startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
         >
           {loading ? 'Creating...' : 'Create Course'}
         </Button>
       </form>
    </div>
  );
};

// Protect this page - only Mentors and Admins can create courses
export default ProtectedRoute(CreateCoursePage, ['Mentor', 'Admin']);
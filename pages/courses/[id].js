// pages/courses/[id].js
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import apiClient from '../../lib/apiClient'; // Adjust path
import useAuth from '../../hooks/useAuth'; // To check user role for editing controls
import ProtectedRoute from '../../components/ProtectedRoute'; // Adjust path
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'; // Example Icon
import EditIcon from '@mui/icons-material/Edit'; // Example Icon
import DeleteIcon from '@mui/icons-material/Delete'; // Example Icon
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// --- Component to display content items within a module ---
const ContentItemDisplay = ({ moduleId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth(); // Check role for edit/delete buttons

  useEffect(() => {
    if (!moduleId) return;
    const fetchItems = async () => {
      setLoading(true);
      setError(null);
      try {
        // Assuming endpoint GET /api/v1/modules/:moduleId/content-items exists
        const response = await apiClient.get(`/modules/${moduleId}/content-items`);
        setItems(response.data || []);
      } catch (err) {
        console.error(`Error fetching content items for module ${moduleId}:`, err);
        setError(err.response?.data?.message || 'Failed to load content items.');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [moduleId]);

  const handleAddContentItem = () => {
      alert(`TODO: Implement Add Content Item UI for Module ID: ${moduleId}`);
      // Open modal or navigate to form
  };

   const handleEditContentItem = (itemId) => {
      alert(`TODO: Implement Edit Content Item UI for Item ID: ${itemId}`);
   };

   const handleDeleteContentItem = (itemId) => {
      if (confirm(`Are you sure you want to delete content item ${itemId}?`)) {
         alert(`TODO: Implement Delete Content Item API call for Item ID: ${itemId}`);
         // Call API: apiClient.delete(`/content-items/${itemId}`);
         // Refetch items list on success
      }
   };

  if (loading) return <CircularProgress size={20} />;
  if (error) return <Alert severity="warning" size="small">{error}</Alert>;

  return (
    <List dense disablePadding>
      {items.length === 0 ? (
        <ListItem>
          <ListItemText primary="No content items yet." sx={{ fontStyle: 'italic', color: 'text.secondary' }}/>
        </ListItem>
      ) : (
        items.map((item) => (
          <ListItem
              key={item._id}
              secondaryAction={
                (user?.role === 'Mentor' || user?.role === 'Admin') && ( // Show controls only to mentor/admin
                  <>
                    <IconButton edge="end" aria-label="edit" size="small" onClick={() => handleEditContentItem(item._id)} sx={{ mr: 0.5 }}>
                      <EditIcon fontSize="inherit" />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" size="small" onClick={() => handleDeleteContentItem(item._id)}>
                      <DeleteIcon fontSize="inherit" />
                    </IconButton>
                  </>
                )
              }
              sx={{ pl: 4 }} // Indent content items
          >
             {/* Basic rendering based on type */}
              <ListItemText
                  primary={`${item.order}. ${item.title} (${item.itemType})`}
                  secondary={
                      item.itemType === 'Video' ? <a href={item.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View Video</a> :
                      item.itemType === 'Resource' ? <a href={item.resourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Download Resource</a> :
                      item.itemType === 'Lecture' ? `${item.lectureContent?.substring(0, 50)}...` : // Show snippet
                      item.itemType === 'Task' ? `${item.taskDescription?.substring(0, 50)}...` : // Show snippet
                      null
                  }
              />
          </ListItem>
        ))
      )}
       {/* Button to add new content item */}
        {(user?.role === 'Mentor' || user?.role === 'Admin') && (
             <ListItem button onClick={handleAddContentItem} sx={{ pl: 4, color: 'primary.main' }}>
                 <AddCircleOutlineIcon sx={{ mr: 1 }} fontSize="small" />
                 <ListItemText primary="Add Content Item" primaryTypographyProps={{ variant: 'body2' }}/>
             </ListItem>
        )}
    </List>
  );
};


// --- Main Course Detail Page Component ---
const CourseDetailPage = () => {
  const router = useRouter();
  const { id: courseId } = router.query; // Get course ID from URL parameter
  const { user } = useAuth(); // Get user role
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [loadingModules, setLoadingModules] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Course Details
  const fetchCourse = useCallback(async () => {
    if (!courseId) return;
    setLoadingCourse(true);
    setError(null); // Clear previous errors
    try {
      const response = await apiClient.get(`/courses/${courseId}`);
      setCourse(response.data);
    } catch (err) {
      console.error("Error fetching course details:", err);
      handleFetchError(err, 'course');
    } finally {
      setLoadingCourse(false);
    }
  }, [courseId]); // Dependency on courseId

  // Fetch Modules for the Course
  const fetchModules = useCallback(async () => {
    if (!courseId) return;
    setLoadingModules(true);
    // Don't clear course error when fetching modules
    // setError(null);
    try {
      // Assuming endpoint GET /api/v1/courses/:courseId/modules exists
      const response = await apiClient.get(`/courses/${courseId}/modules`);
      setModules(response.data || []); // Ensure modules is always an array
    } catch (err) {
      console.error("Error fetching modules:", err);
      handleFetchError(err, 'modules');
    } finally {
      setLoadingModules(false);
    }
  }, [courseId]); // Dependency on courseId

  // Combined fetch effect
  useEffect(() => {
    if (courseId) {
        fetchCourse();
        fetchModules();
    }
  }, [courseId, fetchCourse, fetchModules]); // Rerun if courseId changes

  // Helper to set specific error messages
  const handleFetchError = (err, type) => {
      const message = err.response?.data?.message || `Failed to load ${type}.`;
      if (err.response?.status === 404) {
            setError(`${type === 'course' ? 'Course' : 'Modules'} not found.`);
      } else if (err.response?.status === 403) {
            setError(`You are not authorized to view this ${type}.`);
      } else {
           setError(message);
      }
       if (type === 'course') setCourse(null);
       if (type === 'modules') setModules([]);
  }

   const handleAddModule = () => {
      alert(`TODO: Implement Add Module UI for Course ID: ${courseId}`);
      // Open modal or navigate to form
      // Needs to call POST /api/v1/courses/:courseId/modules
      // Refetch modules list on success
   };

   const handleEditModule = (moduleId) => {
      alert(`TODO: Implement Edit Module UI for Module ID: ${moduleId}`);
   };

   const handleDeleteModule = (moduleId) => {
      if (confirm(`Are you sure you want to delete module ${moduleId}? This might delete its content items too!`)) {
         alert(`TODO: Implement Delete Module API call for Module ID: ${moduleId}`);
         // Call API: apiClient.delete(`/modules/${moduleId}`);
         // Refetch modules list on success
      }
   };

  // --- Render Logic ---
  if (loadingCourse) {
    return <div className="flex justify-center items-center p-10"><CircularProgress /></div>;
  }

  if (error && !course) { // Show error only if course failed to load
    return <Alert severity="error" className="mt-4">{error}</Alert>;
  }

  if (!course) {
    return <Alert severity="warning">Course data unavailable.</Alert>;
  }

  // Check if current user is the mentor or an admin
  const canEditCourse = user && (user._id === course.mentor?._id || user.role === 'Admin');

  return (
    <div>
      {/* Course Header Info */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h4" component="h1" gutterBottom className="font-bold">
                {course.title}
            </Typography>
            {canEditCourse && (
                <Button variant="outlined" startIcon={<EditIcon />} onClick={() => alert('TODO: Implement Edit Course UI')}>
                    Edit Course
                </Button>
            )}
      </Box>
      <Paper elevation={1} className="p-4 mb-6 dark:bg-gray-800">
          <Typography variant="h6" gutterBottom>Description</Typography>
          <Typography variant="body1" paragraph className="dark:text-gray-300">{course.description}</Typography>
          <Typography variant="subtitle2" color="text.secondary" className="dark:text-gray-400">
            Mentor: {course.mentor?.firstName} {course.mentor?.lastName} ({course.mentor?.email})
          </Typography>
           <Typography variant="subtitle2" color="text.secondary" className="dark:text-gray-400">
            Status: {course.status}
           </Typography>
      </Paper>

      {/* Modules and Content Items Section */}
      <Typography variant="h5" component="h2" gutterBottom className="mt-8 font-semibold">
          Course Content
      </Typography>

      {loadingModules && <CircularProgress />}
      {!loadingModules && error && <Alert severity="warning" className="mt-4">Could not load modules: {error}</Alert>}

      {!loadingModules && modules.length === 0 && (
         <Typography sx={{ my: 2, fontStyle: 'italic', color: 'text.secondary' }}>
            No modules have been added to this course yet.
         </Typography>
      )}

      {!loadingModules && modules.length > 0 && (
         <Box sx={{ my: 2 }}>
            {modules.map((module) => (
               <Accordion key={module._id} defaultExpanded={modules.length < 5} /* Expand few modules by default */ >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`module-${module._id}-content`}
                    id={`module-${module._id}-header`}
                    sx={{
                        '& .MuiAccordionSummary-content': { // Target content area for alignment
                             display: 'flex',
                             justifyContent: 'space-between',
                             alignItems: 'center',
                             width: '100%', // Ensure content area takes full width
                         }
                     }}
                  >
                    <Typography sx={{ flexShrink: 0, fontWeight: 500 }}>
                       Module {module.order}: {module.title}
                    </Typography>
                    {/* Edit/Delete Module Buttons */}
                    {canEditCourse && (
                         <Box sx={{ ml: 2, flexShrink: 0 }} onClick={(e) => e.stopPropagation()} /* Prevent accordion toggle */ >
                             <IconButton edge="end" aria-label="edit-module" size="small" onClick={() => handleEditModule(module._id)} sx={{ mr: 0.5 }}>
                                 <EditIcon fontSize="inherit" />
                             </IconButton>
                             <IconButton edge="end" aria-label="delete-module" size="small" onClick={() => handleDeleteModule(module._id)}>
                                 <DeleteIcon fontSize="inherit" />
                             </IconButton>
                         </Box>
                    )}
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 0 }}>
                     {/* Display Content Items for this module */}
                     <ContentItemDisplay moduleId={module._id} />
                  </AccordionDetails>
               </Accordion>
            ))}
         </Box>
      )}

      {/* Button to Add New Module */}
      {canEditCourse && (
        <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={handleAddModule}
            sx={{ mt: 2 }}
        >
            Add Module
        </Button>
      )}

    </div>
  );
};

// Protect this page
export default ProtectedRoute(CourseDetailPage, ['Admin', 'Mentor', 'Mentee']);
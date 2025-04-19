// components/ScheduleList.js
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../lib/apiClient'; // Adjust path
import useAuth from '../hooks/useAuth'; // Adjust path
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse'; // For showing details like notes
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

// Helper to get status color
const getStatusColor = (status) => {
  switch (status) {
    case 'Confirmed': return 'success';
    case 'Pending': return 'warning';
    case 'Rejected':
    case 'Cancelled': return 'error';
    case 'Completed': return 'info';
    default: return 'default';
  }
};

const ScheduleList = ({ filter = 'upcoming' /* 'upcoming', 'pending', 'past', 'all' */ }) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedItem, setExpandedItem] = useState(null); // State to track expanded item
  const { user } = useAuth();

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    setError(null);
    let queryParams = {};
    if (filter === 'upcoming') queryParams.upcoming = 'true';
    else if (filter === 'pending') queryParams.status = 'Pending';
    else if (filter === 'past') queryParams.past = 'true';
    // 'all' needs no specific filter param based on current backend logic

    try {
      const response = await apiClient.get('/schedules', { params: queryParams });
      setSchedules(response.data || []);
    } catch (err) {
      console.error("Error fetching schedules:", err);
      setError(err.response?.data?.message || `Failed to load schedules (${filter}).`);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  }, [filter]); // Re-fetch when filter changes

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]); // Use the memoized fetch function

  const handleStatusUpdate = async (scheduleId, newStatus) => {
      // Add logic to prompt for confirmedTime if newStatus is 'Confirmed'
      let confirmedTimeInput = null;
      if (newStatus === 'Confirmed') {
         // Simple prompt for now, replace with a proper date/time picker modal
         const dateTimeString = prompt(`Enter confirmed date and time (YYYY-MM-DDTHH:mm):`, new Date(schedules.find(s => s._id === scheduleId)?.requestedTime).toISOString().slice(0, 16));
         if (!dateTimeString) return; // User cancelled
         confirmedTimeInput = new Date(dateTimeString).toISOString();
         if (isNaN(new Date(confirmedTimeInput).getTime())) {
             alert('Invalid date/time format.');
             return;
         }
      }

      // Add logic to prompt for mentorNotes if desired (e.g., on Reject)
      let mentorNotesInput = null;
      if (newStatus === 'Rejected') {
          mentorNotesInput = prompt("Reason for rejection (optional):");
      }

      try {
        // Show loading state for the specific item?
        await apiClient.put(`/schedules/${scheduleId}/status`, {
            status: newStatus,
            confirmedTime: confirmedTimeInput, // Will be ignored if not 'Confirmed' status
            mentorNotes: mentorNotesInput
         });
        // Refresh the list after successful update
        fetchSchedules();
      } catch (err) {
        console.error("Error updating status:", err);
        alert(err.response?.data?.message || 'Failed to update status.');
      }
  };

  const handleExpandClick = (itemId) => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };


  if (loading) {
    return <div className="flex justify-center items-center p-5"><CircularProgress /></div>;
  }

  if (error) {
    return <Alert severity="error" className="mt-4">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom className="capitalize dark:text-gray-200">
        {filter} Meetings / Requests
      </Typography>
      {schedules.length === 0 ? (
        <Typography sx={{ mt: 2, fontStyle: 'italic', color: 'text.secondary' }} className="dark:text-gray-400">
          No schedules found for this filter.
        </Typography>
      ) : (
        <List disablePadding>
          {schedules.map((schedule, index) => (
            <React.Fragment key={schedule._id}>
              <ListItem alignItems="flex-start">
                 <ListItemText
                    primary={
                        <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <Typography component="span" variant="body1" fontWeight="medium" className="dark:text-white">
                                {user?.role === 'Mentor' ? `Mentee: ${schedule.mentee?.firstName} ${schedule.mentee?.lastName}` : `Mentor: ${schedule.mentor?.firstName} ${schedule.mentor?.lastName}`}
                            </Typography>
                            <Chip
                                label={schedule.status}
                                color={getStatusColor(schedule.status)}
                                size="small"
                             />
                        </Box>
                    }
                    secondary={
                        <React.Fragment>
                            <Typography
                                sx={{ display: 'block' }}
                                component="span"
                                variant="body2"
                                color="text.primary"
                                className="dark:text-gray-300"
                            >
                                {schedule.status === 'Confirmed' && schedule.confirmedTime
                                    ? `Confirmed: ${new Date(schedule.confirmedTime).toLocaleString()} for ${schedule.durationMinutes} mins`
                                    : `Requested: ${new Date(schedule.requestedTime).toLocaleString()} for ${schedule.durationMinutes} mins`
                                }
                            </Typography>
                             {schedule.message && (
                                 <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }} className="dark:text-gray-400">
                                     Mentee Message: "{schedule.message}"
                                 </Typography>
                             )}
                             {schedule.mentorNotes && (
                                 <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }} className="dark:text-gray-400">
                                     Mentor Notes: "{schedule.mentorNotes}"
                                 </Typography>
                             )}
                             {/* Expand button if there are notes/message */}
                             {(schedule.message || schedule.mentorNotes) && (
                                 <IconButton size="small" onClick={() => handleExpandClick(schedule._id)} sx={{ ml: 'auto', p: 0.5 }}>
                                      {expandedItem === schedule._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                 </IconButton>
                             )}
                        </React.Fragment>
                    }
                 />
              </ListItem>
               {/* Collapsible section for details - simplified, adjust as needed */}
               <Collapse in={expandedItem === schedule._id} timeout="auto" unmountOnExit>
                  <Box sx={{ pl: 2, pb: 1 }}>
                    {/* Show full message/notes here if needed */}
                  </Box>
               </Collapse>

               {/* Action buttons for Mentor on Pending requests */}
              {user?.role === 'Mentor' && schedule.status === 'Pending' && (
                 <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pb: 1, pr: 2 }}>
                     <Button size="small" variant="contained" color="success" onClick={() => handleStatusUpdate(schedule._id, 'Confirmed')}>
                        Approve
                     </Button>
                     <Button size="small" variant="outlined" color="error" onClick={() => handleStatusUpdate(schedule._id, 'Rejected')}>
                        Reject
                     </Button>
                 </Box>
              )}
              {index < schedules.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
};

export default ScheduleList;
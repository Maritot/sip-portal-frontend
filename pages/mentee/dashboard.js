// pages/mentee/dashboard.js
import React, { useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute'; // Adjust path
import useAuth from '../../hooks/useAuth'; // Adjust path
import RequestMeetingForm from '../../components/RequestMeetingForm'; // Adjust path
import ScheduleList from '../../components/ScheduleList'; // Adjust path
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import AnnouncementsDisplay from '../../components/AnnouncementsDisplay'; // Adjust path

const MenteeDashboard = () => {
  const { user } = useAuth();
  // State to trigger refresh of ScheduleList after successful request
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccessfulRequest = () => {
      setRefreshKey(prevKey => prevKey + 1); // Increment key to force re-render/refetch
  };

  return (
    <div>
      <Typography variant="h4" component="h1" gutterBottom>
        Mentee Dashboard
      </Typography>
      <Typography paragraph>Welcome, {user?.firstName}!</Typography>

      {/* Request Meeting Form */}
      <RequestMeetingForm onSuccessfulRequest={handleSuccessfulRequest} />

      {/* Display Schedules */}
      <Paper elevation={1} sx={{ p: 2, mt: 3 }} className="dark:bg-gray-800">
          <ScheduleList key={refreshKey} filter="upcoming" /> {/* Use key to force refresh */}
      </Paper>
       <Paper elevation={1} sx={{ p: 2, mt: 3 }} className="dark:bg-gray-800">
          <ScheduleList key={refreshKey + 1} filter="past" /> {/* Separate list for past */}
      </Paper>
      <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>Recent Announcements</Typography>
          <AnnouncementsDisplay limit={3} /> {/* Show fewer on dashboard? */}
       </Box>

      {/* Other Mentee dashboard content (e.g., enrolled courses) */}
    </div>
  );
};

export default ProtectedRoute(MenteeDashboard, ['Mentee']);
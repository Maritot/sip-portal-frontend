// pages/mentor/dashboard.js
import React from 'react';
import ProtectedRoute from '../../components/ProtectedRoute'; // Adjust path
import useAuth from '../../hooks/useAuth'; // Adjust path
import ScheduleList from '../../components/ScheduleList'; // Adjust path
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import AnnouncementsDisplay from '../../components/AnnouncementsDisplay'; // Adjust path

const MentorDashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <Typography variant="h4" component="h1" gutterBottom>
        Mentor Dashboard
      </Typography>
      <Typography paragraph>Welcome, {user?.firstName}!</Typography>

      {/* Display Pending Requests */}
       <Paper elevation={1} sx={{ p: 2, mt: 3 }} className="dark:bg-gray-800">
           <ScheduleList filter="pending" />
       </Paper>

       {/* Display Upcoming Confirmed Schedules */}
       <Paper elevation={1} sx={{ p: 2, mt: 3 }} className="dark:bg-gray-800">
           <ScheduleList filter="upcoming" />
       </Paper>

       {/* Optionally display past schedules */}
       {/* <Paper elevation={1} sx={{ p: 2, mt: 3 }} className="dark:bg-gray-800">
           <ScheduleList filter="past" />
       </Paper> */}

<Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>Recent Announcements</Typography>
          <AnnouncementsDisplay limit={3} /> {/* Show fewer on dashboard? */}
       </Box>

      {/* Other Mentor dashboard content (e.g., assigned mentees, created courses) */}
    </div>
  );
};

export default ProtectedRoute(MentorDashboard, ['Mentor', 'Admin']); // Also allow Admin?
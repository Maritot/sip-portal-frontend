// pages/admin/dashboard.js
import React from 'react';
import ProtectedRoute from '../../components/ProtectedRoute'; // Adjust path
import useAuth from '../../hooks/useAuth'; // Adjust path
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Link from 'next/link';
import Button from '@mui/material/Button';
import GroupIcon from '@mui/icons-material/Group';
import AnnouncementForm from '../../components/admin/AnnouncementForm'; // Adjust path
import AnnouncementsDisplay from '../../components/AnnouncementsDisplay'; // Use display comp for admin too
  

const AdminDashboard = () => {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0); // To refresh announcement list
  
  const handleAnnouncementCreated = () => {
      setRefreshKey(prev => prev + 1);
  };
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography paragraph>Welcome, Administrator {user?.firstName}!</Typography>

       <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
           <Typography variant="h6" gutterBottom>Quick Actions</Typography>
           <Box sx={{ display: 'flex', gap: 2 }}>
                <Link href="/admin/users" passHref>
                    <Button variant="contained" startIcon={<GroupIcon />}>
                        Manage Users
                    </Button>
                </Link>
                {/* Add buttons/links for other admin sections */}
                {/* <Button variant="outlined">Manage Courses</Button> */}
                {/* <Button variant="outlined">View Schedules</Button> */}
                {/* <Button variant="outlined">Post Announcement</Button> */}
           </Box>
       </Paper>

      {/* TODO: Add summary widgets/stats here later */}
      <Box sx={{ mt: 4 }}>
             <Typography variant="h5" gutterBottom>Manage Announcements</Typography>
             <AnnouncementForm onAnnouncementCreated={handleAnnouncementCreated} />
             {/* Display existing announcements (admin might see all) */}
              <Box sx={{ mt: 3 }}>
                 <Typography variant="h6" gutterBottom>Recent Announcements (Visible to You)</Typography>
                 {/* Pass a key to force refresh when new one is added */}
                 <AnnouncementsDisplay key={refreshKey} limit={5} isAdminView={true} />
              </Box>
        </Box>
      {/* e.g., Total Users, Pending Requests, Recent Activity */}

    </Box>
  );
};

export default ProtectedRoute(AdminDashboard, ['Admin']);
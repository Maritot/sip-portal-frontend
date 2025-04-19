// components/AnnouncementsDisplay.js
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../lib/apiClient'; // Adjust path
import useAuth from '../hooks/useAuth'; // Adjust path for potential role check
import { Box, Typography, Paper, CircularProgress, Alert, Divider, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
// Import socket client library if using WebSockets (e.g., import io from 'socket.io-client';)

const AnnouncementsDisplay = ({ limit = 5, isAdminView = false }) => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth(); // Get user info

    const fetchAnnouncements = useCallback(async () => {
        // setLoading(true); // Optionally show loading on refetch
        setError(null);
        try {
            // Admins might see all, others see filtered by role (backend handles filtering)
            const response = await apiClient.get(`/announcements?limit=${limit}`);
            setAnnouncements(response.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load announcements.');
        } finally {
            setLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        fetchAnnouncements();

        // --- WebSocket Listener Outline ---
        // const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'); // Connect to server URL
        // socket.on('connect', () => console.log('Socket connected for announcements'));
        // socket.on('new_announcement', (newAnnouncement) => {
        //      console.log('New announcement received:', newAnnouncement);
        //      // TODO: Check if the new announcement is relevant to the current user's role
        //      if (newAnnouncement.targetRoles.includes('All') || newAnnouncement.targetRoles.includes(user?.role)) {
        //          // Add to the beginning of the list, maybe trim length
        //          setAnnouncements(prev => [newAnnouncement, ...prev.slice(0, limit - 1)]);
        //      }
        // });
        // socket.on('delete_announcement', ({ id }) => {
        //      console.log('Announcement delete request received:', id);
        //      setAnnouncements(prev => prev.filter(a => a._id !== id));
        // });
        // socket.on('disconnect', () => console.log('Socket disconnected for announcements'));
        // return () => { // Cleanup on component unmount
        //      socket.disconnect();
        // };
        // --- End WebSocket Listener ---

    }, [fetchAnnouncements, limit, user?.role]); // Include user role if needed for client-side filtering in WebSocket

    const handleDelete = async (id) => {
        if (!isAdminView || !window.confirm('Are you sure you want to delete this announcement?')) return;
        try {
            await apiClient.delete(`/announcements/${id}`);
            // Refetch or optimistically remove from state
            setAnnouncements(prev => prev.filter(a => a._id !== id));
        } catch (err) {
             alert(err.response?.data?.message || 'Failed to delete announcement.');
        }
    };

    if (loading) return <CircularProgress size={30} />;
    if (error) return <Alert severity="warning" size="small">{error}</Alert>;

    return (
        <Paper elevation={1} sx={{ p: 2 }} className="dark:bg-gray-800">
            {announcements.length === 0 ? (
                <Typography sx={{ fontStyle: 'italic', color: 'text.secondary' }} className="dark:text-gray-400">
                    No recent announcements.
                </Typography>
            ) : (
                announcements.map((announcement, index) => (
                    <Box key={announcement._id}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Box>
                                <Typography variant="subtitle1" fontWeight="medium" className="dark:text-white">{announcement.title}</Typography>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }} className="dark:text-gray-300">{announcement.content}</Typography>
                                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }} className="dark:text-gray-500">
                                    Posted by {announcement.author?.firstName || 'Admin'} on {new Date(announcement.createdAt).toLocaleDateString()}
                                    {isAdminView && ` (Targets: ${announcement.targetRoles.join(', ')})`}
                                </Typography>
                            </Box>
                            {isAdminView && (
                                <IconButton size="small" onClick={() => handleDelete(announcement._id)} aria-label="delete announcement">
                                    <DeleteIcon fontSize="small" className="dark:text-gray-400 hover:text-red-500" />
                                </IconButton>
                            )}
                        </Box>
                        {index < announcements.length - 1 && <Divider sx={{ my: 1.5 }} />}
                    </Box>
                ))
            )}
        </Paper>
    );
};

export default AnnouncementsDisplay;
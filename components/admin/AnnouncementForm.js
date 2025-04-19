// components/admin/AnnouncementForm.js
import React, { useState } from 'react';
import apiClient from '../../lib/apiClient'; // Adjust path
import { TextField, Button, Box, CircularProgress, Alert, Typography, FormGroup, FormControlLabel, Checkbox } from '@mui/material';

const AnnouncementForm = ({ onAnnouncementCreated }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [targetRoles, setTargetRoles] = useState(['All']); // Default to All
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const roles = ['All', 'Admin', 'Mentor', 'Mentee']; // Available roles + All

    const handleRoleChange = (event) => {
        const { value, checked } = event.target;
        let updatedRoles;

        if (value === 'All') {
            // If 'All' is checked, set only 'All'. If unchecked, clear roles.
            updatedRoles = checked ? ['All'] : [];
        } else {
            // Remove 'All' if a specific role is selected
            const currentRoles = targetRoles.filter(role => role !== 'All');
            if (checked) {
                // Add the role
                updatedRoles = [...currentRoles, value];
            } else {
                // Remove the role
                updatedRoles = currentRoles.filter(role => role !== value);
            }
            // If no specific roles selected, default back to 'All'? Or allow empty? Decide policy.
            // For now, let's allow empty selection, meaning no one is targeted unless 'All' is checked.
            // if (updatedRoles.length === 0) updatedRoles = ['All'];
        }
        setTargetRoles(updatedRoles);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (!title || !content || targetRoles.length === 0) {
            setError('Title, Content, and at least one Target Role are required.');
            setLoading(false);
            return;
        }

        try {
            await apiClient.post('/announcements', { title, content, targetRoles });
            setSuccess('Announcement posted successfully!');
            setTitle('');
            setContent('');
            setTargetRoles(['All']); // Reset form
            if (onAnnouncementCreated) {
                onAnnouncementCreated(); // Callback to potentially refresh list
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to post announcement.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper elevation={2} sx={{ p: 3, mt: 2 }} className="dark:bg-gray-800">
            <Typography variant="h6" gutterBottom>Create Announcement</Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ '& .MuiTextField-root': { mb: 2 } }}>
                {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}
                <TextField
                    fullWidth
                    label="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={loading}
                />
                <TextField
                    fullWidth
                    label="Content"
                    multiline
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    disabled={loading}
                />
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>Target Roles:</Typography>
                <FormGroup row>
                     {roles.map(role => (
                         <FormControlLabel
                            key={role}
                            control={
                                <Checkbox
                                    checked={targetRoles.includes(role)}
                                    onChange={handleRoleChange}
                                    value={role}
                                    disabled={loading || (role !== 'All' && targetRoles.includes('All'))} // Disable specific roles if 'All' is checked
                                />
                            }
                            label={role}
                         />
                     ))}
                </FormGroup>
                <Button
                    type="submit"
                    variant="contained"
                    sx={{ mt: 2 }}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                    {loading ? 'Posting...' : 'Post Announcement'}
                </Button>
            </Box>
        </Paper>
    );
};

export default AnnouncementForm;
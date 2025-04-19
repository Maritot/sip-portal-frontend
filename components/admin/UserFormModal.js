// components/admin/UserFormModal.js
import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
    FormControl, InputLabel, Select, MenuItem, Box, CircularProgress, Alert
} from '@mui/material';

const UserFormModal = ({ open, onClose, onSave, userData }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        role: 'Mentee', // Default role
        password: '', // Leave empty when editing unless changing
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const isEditing = !!userData;

    useEffect(() => {
        // Pre-fill form if editing
        if (isEditing) {
            setFormData({
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                email: userData.email || '',
                role: userData.role || 'Mentee',
                password: '', // Don't pre-fill password
            });
        } else {
            // Reset form if adding
            setFormData({
                firstName: '', lastName: '', email: '', role: 'Mentee', password: ''
            });
        }
        setError(null); // Clear error when opening/switching mode
    }, [userData, open]); // Depend on userData and open state

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSave = async () => {
        setLoading(true);
        setError(null);

        // Remove password field if editing and it's empty
        const dataToSave = { ...formData };
        if (isEditing && !dataToSave.password) {
            delete dataToSave.password;
        } else if (!isEditing && !dataToSave.password) {
            // Password is required when creating
            setError('Password is required when creating a new user.');
            setLoading(false);
            return;
        }

        const result = await onSave(dataToSave); // Call the save function passed from parent

        if (!result.success) {
            setError(result.message || 'An error occurred.');
        }
        // Parent component handles closing modal on success
        setLoading(false);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{isEditing ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogContent>
                 {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Box component="form" sx={{ mt: 1 }}> {/* mt: 1 to prevent content shift due to Alert */}
                    <TextField
                        margin="dense"
                        name="firstName"
                        label="First Name"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                    <TextField
                        margin="dense"
                        name="lastName"
                        label="Last Name"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                    <TextField
                        margin="dense"
                        name="email"
                        label="Email Address"
                        type="email"
                        fullWidth
                        variant="outlined"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                    <FormControl fullWidth margin="dense" required disabled={loading}>
                        <InputLabel id="role-select-label">Role</InputLabel>
                        <Select
                            labelId="role-select-label"
                            name="role"
                            value={formData.role}
                            label="Role"
                            onChange={handleChange}
                        >
                            <MenuItem value={'Mentee'}>Mentee</MenuItem>
                            <MenuItem value={'Mentor'}>Mentor</MenuItem>
                            <MenuItem value={'Admin'}>Admin</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        margin="dense"
                        name="password"
                        label={isEditing ? "New Password (leave blank to keep current)" : "Password"}
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={formData.password}
                        onChange={handleChange}
                        required={!isEditing} // Required only when creating
                        disabled={loading}
                        helperText={isEditing ? "" : "Minimum 6 characters"}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button onClick={handleSave} variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={20}/> : null}>
                    {loading ? 'Saving...' : 'Save'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserFormModal;
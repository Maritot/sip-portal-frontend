// pages/admin/users.js
import React, { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute'; // Adjust path
import useAuth from '../../hooks/useAuth'; // Adjust path
import apiClient from '../../lib/apiClient'; // Adjust path
import UserTable from '../../components/admin/UserTable'; // Create this component
import UserFormModal from '../../components/admin/UserFormModal'; // Create this component
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';

const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null); // User being edited

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get('/users');
            setUsers(response.data || []);
        } catch (err) {
            console.error("Error fetching users:", err);
            setError(err.response?.data?.message || 'Failed to load users.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleOpenModal = (user = null) => { // Pass user for editing, null for adding
        setCurrentUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentUser(null); // Clear current user on close
    };

    const handleSaveUser = async (userData) => {
        // This function will be passed to the modal
        // It will call either POST /users (create) or PUT /users/:id (update)
        const isEditing = !!currentUser;
        const url = isEditing ? `/users/${currentUser._id}` : '/users';
        const method = isEditing ? 'put' : 'post';

        try {
            const response = await apiClient[method](url, userData);
            // Refresh user list on success
            fetchUsers();
            handleCloseModal();
            return { success: true }; // Indicate success to modal
        } catch (err) {
            console.error(`Error ${isEditing ? 'updating' : 'creating'} user:`, err);
            return { success: false, message: err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} user.` };
        }
    };

     const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await apiClient.delete(`/users/${userId}`);
                fetchUsers(); // Refresh list
            } catch (err) {
                 console.error("Error deleting user:", err);
                 setError(err.response?.data?.message || 'Failed to delete user.');
            }
        }
     };


    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">User Management</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenModal(null)} // Open modal for adding
                >
                    Add User
                </Button>
            </Box>

            {loading && <CircularProgress />}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {!loading && !error && (
                <UserTable
                    users={users}
                    onEdit={handleOpenModal} // Pass function to handle edit click
                    onDelete={handleDeleteUser} // Pass function to handle delete click
                />
            )}

            {isModalOpen && (
                <UserFormModal
                    open={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveUser}
                    userData={currentUser} // Pass current user data for editing, null for adding
                />
            )}
        </Box>
    );
};

export default ProtectedRoute(AdminUsersPage, ['Admin']); // Only Admins access this page
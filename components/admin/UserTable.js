// components/admin/UserTable.js
import React from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    IconButton, Chip, Box, Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Helper to get role color
const getRoleColor = (role) => {
  switch (role) {
    case 'Admin': return 'secondary';
    case 'Mentor': return 'primary';
    case 'Mentee': return 'info';
    default: return 'default';
  }
};


const UserTable = ({ users, onEdit, onDelete }) => {

    if (!users || users.length === 0) {
        return <Typography>No users found.</Typography>;
    }

    return (
        <TableContainer component={Paper} className="dark:bg-gray-800">
            <Table sx={{ minWidth: 650 }} aria-label="user table">
                <TableHead>
                    <TableRow>
                        <TableCell className="dark:text-gray-300">Name</TableCell>
                        <TableCell className="dark:text-gray-300">Email</TableCell>
                        <TableCell className="dark:text-gray-300">Role</TableCell>
                        <TableCell className="dark:text-gray-300">Created At</TableCell>
                        <TableCell align="right" className="dark:text-gray-300">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {users.map((user) => (
                        <TableRow
                            key={user._id}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            className="dark:text-gray-100"
                        >
                            <TableCell component="th" scope="row" className="dark:text-gray-100">
                                {user.firstName} {user.lastName}
                            </TableCell>
                            <TableCell className="dark:text-gray-100">{user.email}</TableCell>
                            <TableCell>
                                <Chip label={user.role} color={getRoleColor(user.role)} size="small" />
                            </TableCell>
                             <TableCell className="dark:text-gray-100">
                                {new Date(user.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell align="right">
                                <IconButton size="small" onClick={() => onEdit(user)} aria-label="edit">
                                    <EditIcon fontSize="inherit" className="dark:text-gray-300 hover:text-blue-500" />
                                </IconButton>
                                <IconButton size="small" onClick={() => onDelete(user._id)} aria-label="delete" sx={{ ml: 1 }}>
                                    <DeleteIcon fontSize="inherit" className="dark:text-gray-300 hover:text-red-500" />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default UserTable;
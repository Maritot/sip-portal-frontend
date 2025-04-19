// components/RequestMeetingForm.js
import React, { useState } from 'react';
import apiClient from '../lib/apiClient'; // Adjust path
import useAuth from '../hooks/useAuth'; // Adjust path
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const RequestMeetingForm = ({ onSuccessfulRequest }) => {
  // Get current date and time + 1 hour as default suggestion
  const now = new Date();
  now.setHours(now.getHours() + 1);
  now.setMinutes(0); // Reset minutes for a cleaner default
  const defaultDateTime = now.toISOString().slice(0, 16); // Format for datetime-local input

  const [requestedTime, setRequestedTime] = useState(defaultDateTime);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { user } = useAuth(); // Assuming this is used within a Mentee context

  // Only Mentees should see/use this form
  if (user?.role !== 'Mentee') {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Basic validation
    if (!requestedTime || !durationMinutes || durationMinutes <= 0) {
        setError('Please provide a valid requested time and positive duration.');
        setLoading(false);
        return;
    }
    if (new Date(requestedTime) < new Date()) {
        setError('Cannot request a meeting in the past.');
        setLoading(false);
        return;
    }


    try {
      const response = await apiClient.post('/schedules/request', {
        requestedTime: new Date(requestedTime).toISOString(), // Ensure ISO format
        durationMinutes: Number(durationMinutes),
        message,
      });

      if (response.data && response.status === 201) {
        setSuccess('Meeting request sent successfully!');
        // Optionally clear form
        setRequestedTime(defaultDateTime);
        setDurationMinutes(30);
        setMessage('');
        // Notify parent component if needed (e.g., to refresh schedule list)
        if (onSuccessfulRequest) {
            onSuccessfulRequest();
        }
      } else {
        throw new Error('Failed to send request: Invalid response');
      }
    } catch (err) {
      console.error("Error requesting meeting:", err);
      setError(err.response?.data?.message || 'Failed to send meeting request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 2, mb: 4, maxWidth: 'sm', mx: 'auto' }} className="dark:bg-gray-800">
      <Typography variant="h6" component="h3" gutterBottom>
        Request a Meeting with Your Mentor
      </Typography>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
        {success && <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>}

        <TextField
          fullWidth
          label="Requested Date and Time"
          type="datetime-local"
          InputLabelProps={{ shrink: true }}
          value={requestedTime}
          onChange={(e) => setRequestedTime(e.target.value)}
          required
          disabled={loading}
        />

        <TextField
          fullWidth
          label="Suggested Duration (minutes)"
          type="number"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(e.target.value)}
          inputProps={{ min: 15, step: 15 }} // Example: min 15 mins, steps of 15
          required
          disabled={loading}
        />

        <TextField
          fullWidth
          label="Message (Optional)"
          multiline
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={loading}
          inputProps={{ maxLength: 500 }}
          helperText={`${message.length}/500 characters`}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Sending Request...' : 'Send Request'}
        </Button>
      </form>
    </Paper>
  );
};

export default RequestMeetingForm;
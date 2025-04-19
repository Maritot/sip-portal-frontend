// pages/login.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useAuth from '../hooks/useAuth';
import TextField from '@mui/material/TextField'; // Example MUI form components
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, user, loading, error, setError } = useAuth();
  const router = useRouter();

  // Clear error when component mounts or credentials change
  useEffect(() => {
      setError(null);
  }, [setError]); // Dependency on setError ensures stable function reference

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      // Redirect based on role (logic might be centralized in AuthContext)
      const role = user.role.toLowerCase();
      router.push(`/${role}/dashboard`);
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    await login(email, password);
    // Redirect logic is now handled by the useEffect above or within login function
  };

  // Prevent rendering login form if user is already known
  if (user) {
      return <div>Redirecting...</div>; // Or null/spinner
  }


  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"> {/* Adjust height based on layout */}
      <form
        onSubmit={handleSubmit}
        className="p-8 bg-white dark:bg-gray-800 shadow-md rounded-lg w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        {error && <Alert severity="error" className="mb-4">{error}</Alert>}
        <div className="mb-4">
           <TextField
             fullWidth
             type="email"
             label="Email Address"
             variant="outlined"
             value={email}
             onChange={(e) => setEmail(e.target.value)}
             required
             disabled={loading}
           />
        </div>
        <div className="mb-6">
           <TextField
              fullWidth
              type="password"
              label="Password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
           />
        </div>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
    </div>
  );
};

export default LoginPage;
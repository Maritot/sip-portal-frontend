// context/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../lib/apiClient';
import { useRouter } from 'next/router';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Check initial auth status
  const [error, setError] = useState(null);
  const router = useRouter();

  // Function to check auth status on initial load
  const checkUserLoggedIn = useCallback(async () => {
    setLoading(true);
    setError(null);
    const storedToken = localStorage.getItem('sip_token');
    if (storedToken) {
      try {
         // Set token for subsequent requests via interceptor
         setToken(storedToken);
        // Verify token by fetching user profile
        const response = await apiClient.get('/auth/me'); // Assumes /auth/me endpoint exists
        if (response.data) {
          setUser(response.data);
        } else {
           // Token might be invalid/expired
           logout(); // Clear invalid state
        }
      } catch (err) {
        console.error("Error verifying token:", err);
        logout(); // Clear invalid state if verification fails
      }
    }
    setLoading(false);
  }, []); // No dependencies needed here for useCallback

  useEffect(() => {
    checkUserLoggedIn();
  }, [checkUserLoggedIn]); // Run only once on mount

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      if (response.data && response.data.token) {
        setUser(response.data); // Store user info excluding token here
        setToken(response.data.token);
        localStorage.setItem('sip_token', response.data.token); // Persist token
        redirectToDashboard(response.data.role);
      } else {
          setError("Login failed: Invalid response from server.");
      }
    } catch (err) {
      console.error("Login error:", err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
      setUser(null);
      setToken(null);
      localStorage.removeItem('sip_token');
    } finally {
      setLoading(false);
    }
  };

  // Register function (Example)
   const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/register', userData);
      if (response.data && response.data.token) {
         // Decide if login immediately after register or redirect to login page
        setUser(response.data);
        setToken(response.data.token);
        localStorage.setItem('sip_token', response.data.token);
        redirectToDashboard(response.data.role); // Or router.push('/login');
      } else {
         setError("Registration failed: Invalid response.");
      }
    } catch (err) {
       console.error("Registration error:", err.response ? err.response.data : err.message);
       setError(err.response?.data?.message || 'Registration failed.');
       // Clear any potential partial state
       setUser(null);
       setToken(null);
       localStorage.removeItem('sip_token');
    } finally {
        setLoading(false);
    }
   };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('sip_token');
    // Optionally call backend logout endpoint if needed (e.g., invalidate refresh tokens)
    router.push('/login'); // Redirect to login page
  };

  // Redirect helper
  const redirectToDashboard = (role) => {
    switch (role) {
      case 'Admin':
        router.push('/admin/dashboard');
        break;
      case 'Mentor':
        router.push('/mentor/dashboard');
        break;
      case 'Mentee':
      default:
        router.push('/mentee/dashboard');
        break;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
// lib/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token to requests if available
apiClient.interceptors.request.use(
  (config) => {
    // Check if localStorage is available (client-side)
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('sip_token'); // Or get from secure cookie/state management
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
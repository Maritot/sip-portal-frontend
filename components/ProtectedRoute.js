// components/ProtectedRoute.js
// Note: Next.js Middleware (pages/_middleware.js or middleware.js in root) is often
// a better approach for route protection as it runs on the edge/server-side.
// This HOC example runs client-side.

import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import useAuth from '../hooks/useAuth';

const ProtectedRoute = (WrappedComponent, allowedRoles = []) => {
  const Wrapper = (props) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        // If not loading and no user, redirect to login
        router.replace('/login'); // Use replace to avoid back button to protected route
      } else if (!loading && user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // If user exists but role not allowed, redirect to their default dashboard or an unauthorized page
        console.warn(`User role '${user.role}' not authorized for this route.`);
        // Simple redirect to home/mentee dashboard as fallback
        router.replace(`/${user.role.toLowerCase()}/dashboard` || '/');
      }
    }, [user, loading, router, allowedRoles]);

    // Render loading state or null while checking auth
    if (loading || !user) {
      return <div>Loading authentication...</div>; // Or a proper spinner component
    }

    // Render component if user exists and role is allowed (or if no specific roles required)
    if (user && (allowedRoles.length === 0 || allowedRoles.includes(user.role))) {
      return <WrappedComponent {...props} />;
    }

    // Fallback if role check somehow fails after loading (should ideally redirect above)
    return <div>Checking authorization...</div>;
  };

  // Assign display name for debugging in React DevTools
  Wrapper.displayName = `ProtectedRoute(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return Wrapper;
};

export default ProtectedRoute;
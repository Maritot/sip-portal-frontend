// components/Layout.js
import React from 'react';
import Link from 'next/link';
import useAuth from '../hooks/useAuth';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress'; // Spinner for loading

const Layout = ({ children }) => {
  const { user, logout, loading } = useAuth();

  // Don't render layout content during initial auth check
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    ); // You can replace this with a more customized loading component or spinner
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 dark:bg-gray-800 text-white p-4 shadow-md">
        <nav className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            SIP Portal
          </Link>
          <div>
            {!user ? (
              <>
                <Link href="/login" className="mr-4 hover:text-gray-300">
                  Login
                </Link>
                {/* Add Register link if needed */}
                {/* <Link href="/register" className="hover:text-gray-300">Register</Link> */}
              </>
            ) : (
              <>
                <span className="mr-4">Welcome, {user.firstName}! ({user.role})</span>

                {/* Navigation links based on role */}
                {user.role === 'Admin' && (
                  <Link href="/admin/dashboard" className="mr-4 hover:text-gray-300">
                    Admin Dashboard
                  </Link>
                )}
                {user.role === 'Mentor' && (
                  <Link href="/mentor/dashboard" className="mr-4 hover:text-gray-300">
                    Mentor Dashboard
                  </Link>
                )}
                {/* Display Logout button */}
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={logout}
                  size="small"
                >
                  Logout
                </Button>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="flex-grow container mx-auto p-4">
        {children}
      </main>

      <footer className="bg-gray-200 dark:bg-gray-700 text-center p-4 mt-auto">
        © {new Date().getFullYear()} SIP Portal
      </footer>
    </div>
  );
};

export default Layout;

import { useMemo, useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Layout from '../components/Layout';
import { AuthProvider } from '../context/AuthContext';

const DynamicBackground = dynamic(() => import('../components/ThreeBackground'), {
  ssr: false,
  loading: () => null
});

const getTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: mode === 'dark' ? '#90caf9' : '#1976d2',
    },
    secondary: {
      main: mode === 'dark' ? '#f48fb1' : '#d81b60',
    },
    background: {
      default: mode === 'dark' ? '#121212' : '#f5f5f5',
      paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)'
          }
        },
      },
    },
  },
});

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [themeMode, setThemeMode] = useState('light');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedTheme = localStorage.getItem('theme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setThemeMode(storedTheme);
  }, []);

  useEffect(() => {
    if (isMounted) {
      document.documentElement.classList.toggle('dark', themeMode === 'dark');
      localStorage.setItem('theme', themeMode);
    }
  }, [themeMode, isMounted]);

  const theme = useMemo(() => getTheme(themeMode), [themeMode]);

  const toggleTheme = () => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  const pageVariants = {
    initial: { 
      opacity: 0, 
      y: 20,
    },
    in: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 120
      }
    },
    out: { 
      opacity: 0, 
      y: -20,
      transition: {
        ease: 'easeIn'
      }
    },
  };

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {router.pathname === '/login' || router.pathname === '/register' ? (
          <div className="fixed inset-0 z-0 opacity-10 dark:opacity-15">
            <DynamicBackground theme={themeMode} />
          </div>
        ) : null}
        
        <Layout toggleTheme={toggleTheme} themeMode={themeMode}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={router.asPath}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              className="min-h-screen"
            >
              <Component {...pageProps} themeMode={themeMode} toggleTheme={toggleTheme} />
            </motion.div>
          </AnimatePresence>
        </Layout>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default MyApp;
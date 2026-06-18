import React, { useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import store from './store';
import useDarkMode from './hooks/useDarkMode';
import AppRoutes from './routes/AppRoutes';
import ToastProvider from './components/ToastNotification';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  const [theme, setTheme] = useDarkMode();

  // Material UI dynamic Theme Mode calculation
  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: theme,
          primary: {
            main: '#06b6d4', // Steamax Cyan
          },
          secondary: {
            main: '#6366f1', // Indigo Accent
          },
          background: {
            default: theme === 'dark' ? '#020617' : '#f8fafc',
            paper: theme === 'dark' ? '#0f172a' : '#ffffff',
          },
          text: {
            primary: theme === 'dark' ? '#f8fafc' : '#0f172a',
            secondary: theme === 'dark' ? '#94a3b8' : '#475569',
          },
        },
        typography: {
          fontFamily: 'Inter, sans-serif',
          h1: { fontFamily: 'Outfit, sans-serif' },
          h2: { fontFamily: 'Outfit, sans-serif' },
          h3: { fontFamily: 'Outfit, sans-serif' },
          h4: { fontFamily: 'Outfit, sans-serif' },
          h5: { fontFamily: 'Outfit, sans-serif' },
          h6: { fontFamily: 'Outfit, sans-serif' },
        },
        shape: {
          borderRadius: 20,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                textTransform: 'none',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                boxShadow: theme === 'dark' ? '0 10px 15px -3px rgba(0, 0, 0, 0.5)' : '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
              },
            },
          },
        },
      }),
    [theme]
  );

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <HelmetProvider>
          <ThemeProvider theme={muiTheme}>
            <CssBaseline />
            <ToastProvider>
              <BrowserRouter>
                <AppRoutes theme={theme} onThemeToggle={handleThemeToggle} />
              </BrowserRouter>
            </ToastProvider>
          </ThemeProvider>
        </HelmetProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;

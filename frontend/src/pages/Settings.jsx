import React, { useState, useEffect } from 'react';
import { Paper, Typography, Switch, FormControlLabel, Button, Box, CircularProgress, Alert } from '@mui/material';
import api from '../services/api';
import { useToast } from '../components/ToastNotification';
import SEO from '../components/SEO';

export const Settings = ({ theme, onThemeToggle }) => {
  const showToast = useToast();
  const [health, setHealth] = useState(null);
  const [checking, setChecking] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const checkApiHealth = async () => {
    setChecking(true);
    try {
      const start = Date.now();
      // Call health check directly
      const response = await api.get('/health');
      const latency = Date.now() - start;
      setHealth({
        success: true,
        message: response.message,
        timestamp: response.timestamp,
        env: response.env,
        latency: `${latency}ms`,
      });
    } catch (err) {
      setHealth({
        success: false,
        message: err.message || 'Could not connect to the API server.',
      });
      showToast('API health check failed.', 'error');
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      checkApiHealth();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6 max-w-3xl">
      <SEO title="Settings" description="Customize display theme preferences and check live MERN backend API status." />

      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          System Settings
        </h1>
        <p className="text-sm text-slate-400">
          Manage system parameters and verify server connections
        </p>
      </div>

      <Paper
        elevation={12}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6"
        style={{ backgroundColor: '#1e293b' }}
      >
        <div>
          <Typography variant="h6" className="text-white font-bold mb-4">
            Preferences
          </Typography>
          <div className="flex flex-col space-y-3">
            <FormControlLabel
              control={
                <Switch
                  checked={theme === 'dark'}
                  onChange={onThemeToggle}
                  color="cyan"
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#06b6d4' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#06b6d4' },
                  }}
                />
              }
              label={
                <Typography className="text-slate-300">
                  Dark Mode UI theme ({theme})
                </Typography>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notifications}
                  onChange={(e) => {
                    setNotifications(e.target.checked);
                    showToast('Notification settings saved.', 'success');
                  }}
                  color="cyan"
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#06b6d4' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#06b6d4' },
                  }}
                />
              }
              label={
                <Typography className="text-slate-300">
                  Enable system logs alerts & toasts
                </Typography>
              }
            />
          </div>
        </div>

        <hr className="border-slate-800" />

        <div>
          <div className="flex justify-between items-center mb-4">
            <Typography variant="h6" className="text-white font-bold">
              API Connection Health
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={checkApiHealth}
              disabled={checking}
              className="text-cyan-400 border-cyan-400 hover:bg-cyan-400/10 rounded-xl"
              style={{ color: '#06b6d4', borderColor: '#06b6d4', textTransform: 'none' }}
            >
              {checking ? <CircularProgress size={16} color="inherit" /> : 'Run Check'}
            </Button>
          </div>

          {health ? (
            health.success ? (
              <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-4 space-y-2 text-sm">
                <div className="flex items-center space-x-2 text-green-400 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-green-400 animate-ping"></span>
                  <span>API Server Connected</span>
                </div>
                <div className="text-slate-400 grid grid-cols-2 gap-2 mt-2">
                  <div>Status: <span className="text-slate-200">{health.message}</span></div>
                  <div>Response Latency: <span className="text-slate-200">{health.latency}</span></div>
                  <div>Environment Mode: <span className="text-slate-200 font-mono text-xs">{health.env}</span></div>
                  <div>Timestamp: <span className="text-slate-200 font-mono text-xs">{new Date(health.timestamp).toLocaleTimeString()}</span></div>
                </div>
              </div>
            ) : (
              <Alert severity="error" className="rounded-2xl font-semibold">
                Connection Failed: {health.message}
              </Alert>
            )
          ) : (
            <div className="flex items-center space-x-2 text-slate-400 text-sm">
              <CircularProgress size={16} />
              <span>Checking endpoint connection status...</span>
            </div>
          )}
        </div>
      </Paper>
    </div>
  );
};

export default Settings;

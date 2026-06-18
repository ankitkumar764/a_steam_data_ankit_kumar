import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Badge,
  Avatar,
  Box,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Brightness4,
  Brightness7,
  Notifications,
  AccountCircle,
  SportsEsports,
} from '@mui/icons-material';
import { logoutUser } from '../store/slices/authSlice';

export const Navbar = ({ onMobileNavToggle, currentTheme, onThemeToggle }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileRedirect = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleSettingsRedirect = () => {
    handleMenuClose();
    navigate('/settings');
  };

  const handleLogout = () => {
    handleMenuClose();
    dispatch(logoutUser()).then(() => {
      navigate('/login');
    });
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      className="bg-slate-900 border-b border-slate-800 text-white z-40"
      sx={{ backgroundColor: '#0f172a' }} // Force dark background matching Slate 900
    >
      <Toolbar className="flex justify-between px-4 sm:px-6">
        <Box className="flex items-center space-x-2">
          {isAuthenticated && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={onMobileNavToggle}
              className="lg:hidden mr-2"
            >
              <MenuIcon />
            </IconButton>
          )}
          <SportsEsports className="text-cyan-400 h-8 w-8" />
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            className="font-bold tracking-wider text-xl bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent hover:opacity-90"
            style={{ textDecoration: 'none' }}
          >
            STEAMAX
          </Typography>
        </Box>

        <Box className="flex items-center space-x-4">
          <IconButton color="inherit" onClick={onThemeToggle} className="text-slate-300 hover:text-white">
            {currentTheme === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          {isAuthenticated ? (
            <>
              <IconButton color="inherit" className="text-slate-300 hover:text-white">
                <Badge badgeContent={3} color="error">
                  <Notifications />
                </Badge>
              </IconButton>

              <Box className="flex items-center space-x-2 cursor-pointer" onClick={handleMenuOpen}>
                <Avatar
                  className="bg-cyan-600 hover:scale-105 transition-transform"
                  sx={{ width: 36, height: 36, fontSize: '0.95rem' }}
                >
                  {user?.username?.substring(0, 2).toUpperCase() || 'U'}
                </Avatar>
                <span className="hidden md:inline-block font-medium text-sm text-slate-300 hover:text-white">
                  {user?.username || 'User'}
                </span>
              </Box>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    backgroundColor: '#1e293b',
                    color: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px border rgba(255,255,255,0.08)',
                    minWidth: 160,
                    '& .MuiMenuItem-root': {
                      fontSize: '0.875rem',
                      fontFamily: 'Inter',
                      '&:hover': {
                        backgroundColor: '#334155',
                      },
                    },
                  },
                }}
              >
                <MenuItem onClick={handleProfileRedirect}>My Profile</MenuItem>
                <MenuItem onClick={handleSettingsRedirect}>Settings</MenuItem>
                <hr className="my-1 border-slate-700" />
                <MenuItem onClick={handleLogout} className="text-red-400 hover:text-red-300">
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500 transition-all hover:scale-105 active:scale-95"
            >
              Sign In
            </Link>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

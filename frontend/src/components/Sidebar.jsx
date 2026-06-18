import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Drawer, Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import {
  Dashboard,
  SportsEsports,
  Person,
  Settings,
  ExitToApp,
  AdminPanelSettings,
  Analytics
} from '@mui/icons-material';
import { logoutUser } from '../store/slices/authSlice';

export const Sidebar = ({ mobileOpen, onMobileClose, drawerWidth = 240 }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const navItems = [
    {
      text: 'Dashboard',
      path: user?.role === 'admin' ? '/admin/dashboard' : '/dashboard',
      icon: <Dashboard />
    },
    {
      text: 'Games Catalog',
      path: '/games',
      icon: <SportsEsports />
    },
    {
      text: 'My Profile',
      path: '/profile',
      icon: <Person />
    },
    {
      text: 'Settings',
      path: '/settings',
      icon: <Settings />
    }
  ];

  const drawerContent = (
    <Box className="flex flex-col h-full bg-slate-900 text-slate-300 border-r border-slate-800" sx={{ backgroundColor: '#0f172a' }}>
      <Box className="p-6 border-b border-slate-800 flex flex-col items-center">
        <Typography variant="h6" className="font-bold text-white tracking-wide">
          {user?.username || 'Gamer Session'}
        </Typography>
        <Typography variant="body2" className="text-slate-500 font-medium capitalize mt-1 px-3 py-0.5 rounded-full bg-slate-800 text-xs">
          {user?.role || 'user'}
        </Typography>
      </Box>

      <Box className="flex-1 py-4">
        <List className="space-y-1 px-3">
          {navItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={NavLink}
                to={item.path}
                className={({ isActive }) =>
                  `rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 font-semibold border-l-4 border-cyan-400'
                      : 'hover:bg-slate-800/50 text-slate-400'
                  }`
                }
                onClick={onMobileClose}
              >
                <ListItemIcon className="min-w-[40px] text-inherit">
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.875rem' }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {user?.role === 'admin' && (
          <Box className="mt-6 pt-6 border-t border-slate-800/80 px-6">
            <Typography variant="overline" className="text-slate-500 font-bold tracking-widest text-[0.7rem] uppercase">
              Admin Area
            </Typography>
            <List className="mt-2 space-y-1">
              <ListItem disablePadding>
                <ListItemButton
                  component={NavLink}
                  to="/admin/dashboard"
                  className={({ isActive }) =>
                    `rounded-xl transition-all ${
                      isActive
                        ? 'bg-indigo-500/10 text-indigo-400 font-semibold border-l-4 border-indigo-400'
                        : 'hover:bg-slate-800/50 text-slate-400'
                    }`
                  }
                  onClick={onMobileClose}
                >
                  <ListItemIcon className="min-w-[40px] text-inherit">
                    <AdminPanelSettings />
                  </ListItemIcon>
                  <ListItemText primary="Admin Panel" primaryTypographyProps={{ fontSize: '0.875rem' }} />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        )}
      </Box>

      <Box className="p-4 border-t border-slate-800">
        <ListItemButton
          onClick={handleLogout}
          className="rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <ListItemIcon className="min-w-[40px] text-inherit">
            <ExitToApp />
          </ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.875rem' }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
      aria-label="mailbox folders"
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }} // Better open performance on mobile
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            backgroundColor: '#0f172a',
            border: 'none',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Pinned Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', lg: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            backgroundColor: '#0f172a',
            border: 'none',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;

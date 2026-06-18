import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { TextField, Button, Box, Typography, Paper, CircularProgress, Grid } from '@mui/material';
import { updateProfile, changePassword } from '../store/slices/authSlice';
import { useToast } from '../components/ToastNotification';
import SEO from '../components/SEO';

export const Profile = () => {
  const dispatch = useDispatch();
  const showToast = useToast();
  const { user, loading } = useSelector((state) => state.auth);

  // Formik for Profile Details
  const profileForm = useFormik({
    initialValues: {
      username: user?.username || '',
      email: user?.email || '',
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      username: Yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
    }),
    onSubmit: (values) => {
      dispatch(updateProfile(values))
        .unwrap()
        .then(() => {
          showToast('Profile details updated successfully!', 'success');
        })
        .catch((err) => {
          showToast(err || 'Failed to update profile.', 'error');
        });
    },
  });

  // Formik for Password Change
  const passwordForm = useFormik({
    initialValues: {
      oldPassword: '',
      newPassword: '',
    },
    validationSchema: Yup.object({
      oldPassword: Yup.string().required('Old password is required'),
      newPassword: Yup.string().required('New password is required').min(6, 'New password must be at least 6 characters'),
    }),
    onSubmit: (values, { resetForm }) => {
      dispatch(changePassword(values))
        .unwrap()
        .then(() => {
          showToast('Password changed successfully!', 'success');
          resetForm();
        })
        .catch((err) => {
          showToast(err || 'Failed to change password.', 'error');
        });
    },
  });

  return (
    <div className="space-y-6">
      <SEO title="My Profile" description="Update your user settings, edit profile username, and reset your password." />
      
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Account Profile
        </h1>
        <p className="text-sm text-slate-400">
          Manage your personal details and password credentials
        </p>
      </div>

      <Grid container spacing={6}>
        {/* Profile Details Card */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={12}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 h-full"
            style={{ backgroundColor: '#1e293b' }}
          >
            <Typography variant="h6" className="text-white font-bold mb-4">
              Profile Information
            </Typography>
            <form onSubmit={profileForm.handleSubmit} className="space-y-4">
              <TextField
                fullWidth
                id="username"
                name="username"
                label="Username"
                value={profileForm.values.username}
                onChange={profileForm.handleChange}
                onBlur={profileForm.handleBlur}
                error={profileForm.touched.username && Boolean(profileForm.errors.username)}
                helperText={profileForm.touched.username && profileForm.errors.username}
                variant="outlined"
                InputLabelProps={{ style: { color: '#94a3b8' } }}
                inputProps={{ style: { color: '#f8fafc' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#475569' },
                    '&:hover fieldset': { borderColor: '#06b6d4' },
                    '&.Mui-focused fieldset': { borderColor: '#06b6d4' },
                  },
                }}
              />

              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email Address"
                value={profileForm.values.email}
                onChange={profileForm.handleChange}
                onBlur={profileForm.handleBlur}
                error={profileForm.touched.email && Boolean(profileForm.errors.email)}
                helperText={profileForm.touched.email && profileForm.errors.email}
                variant="outlined"
                InputLabelProps={{ style: { color: '#94a3b8' } }}
                inputProps={{ style: { color: '#f8fafc' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#475569' },
                    '&:hover fieldset': { borderColor: '#06b6d4' },
                    '&.Mui-focused fieldset': { borderColor: '#06b6d4' },
                  },
                }}
              />

              <Box className="flex justify-between items-center pt-2">
                <Typography variant="body2" className="text-slate-400">
                  Role: <span className="font-semibold capitalize text-cyan-400">{user?.role}</span>
                </Typography>
                <Typography variant="body2" className="text-slate-400">
                  Status:{' '}
                  <span className={`font-semibold ${user?.isVerified ? 'text-green-400' : 'text-yellow-400'}`}>
                    {user?.isVerified ? 'Verified' : 'Unverified'}
                  </span>
                </Typography>
              </Box>

              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                className="bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold py-2.5 px-6 transition-all"
                style={{ backgroundColor: '#0891b2', color: '#ffffff', textTransform: 'none', fontWeight: 'bold' }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Save Details'}
              </Button>
            </form>
          </Paper>
        </Grid>

        {/* Change Password Card */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={12}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 h-full"
            style={{ backgroundColor: '#1e293b' }}
          >
            <Typography variant="h6" className="text-white font-bold mb-4">
              Security Credentials
            </Typography>
            <form onSubmit={passwordForm.handleSubmit} className="space-y-4">
              <TextField
                fullWidth
                id="oldPassword"
                name="oldPassword"
                label="Current Password"
                type="password"
                value={passwordForm.values.oldPassword}
                onChange={passwordForm.handleChange}
                onBlur={passwordForm.handleBlur}
                error={passwordForm.touched.oldPassword && Boolean(passwordForm.errors.oldPassword)}
                helperText={passwordForm.touched.oldPassword && passwordForm.errors.oldPassword}
                variant="outlined"
                InputLabelProps={{ style: { color: '#94a3b8' } }}
                inputProps={{ style: { color: '#f8fafc' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#475569' },
                    '&:hover fieldset': { borderColor: '#06b6d4' },
                    '&.Mui-focused fieldset': { borderColor: '#06b6d4' },
                  },
                }}
              />

              <TextField
                fullWidth
                id="newPassword"
                name="newPassword"
                label="New Password"
                type="password"
                value={passwordForm.values.newPassword}
                onChange={passwordForm.handleChange}
                onBlur={passwordForm.handleBlur}
                error={passwordForm.touched.newPassword && Boolean(passwordForm.errors.newPassword)}
                helperText={passwordForm.touched.newPassword && passwordForm.errors.newPassword}
                variant="outlined"
                InputLabelProps={{ style: { color: '#94a3b8' } }}
                inputProps={{ style: { color: '#f8fafc' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#475569' },
                    '&:hover fieldset': { borderColor: '#06b6d4' },
                    '&.Mui-focused fieldset': { borderColor: '#06b6d4' },
                  },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                className="bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold py-2.5 px-6 transition-all"
                style={{ backgroundColor: '#4f46e5', color: '#ffffff', textTransform: 'none', fontWeight: 'bold' }}
              >
                Change Password
              </Button>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Profile;

import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography, Paper, CircularProgress, MenuItem } from '@mui/material';
import { registerUser, sendOtp } from '../store/slices/authSlice';
import { useToast } from '../components/ToastNotification';
import SEO from '../components/SEO';

export const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const showToast = useToast();
  const { loading, isAuthenticated } = useSelector((state) => state.auth);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      role: 'user', // Default role selection
    },
    validationSchema: Yup.object({
      username: Yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      password: Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
      role: Yup.string().oneOf(['user', 'admin']).required('Role is required'),
    }),
    onSubmit: (values) => {
      dispatch(registerUser(values))
        .unwrap()
        .then((res) => {
          showToast('Account registered successfully! Generating verification code...', 'success');
          // Automatically trigger OTP dispatch to the new user's email
          dispatch(sendOtp({ email: values.email }))
            .unwrap()
            .then((otpRes) => {
              showToast(`OTP generated: ${otpRes.otp} (Shown for development testing convenience)`, 'info');
              navigate('/verify-email');
            });
        })
        .catch((err) => {
          showToast(err || 'Registration failed.', 'error');
        });
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
      <SEO title="Create Account" description="Sign up to access Steamax and analyze catalog details and statistics charts." />

      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <h2 className="mt-6 text-center text-4xl font-extrabold tracking-tight text-white">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Sign up to track and aggregate game metrics
          </p>
        </div>

        <Paper
          elevation={24}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-8"
          style={{ backgroundColor: '#1e293b' }}
        >
          <form onSubmit={formik.handleSubmit} className="space-y-5">
            <TextField
              fullWidth
              id="username"
              name="username"
              label="Username"
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
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
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
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
              id="password"
              name="password"
              label="Password"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
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
              id="role"
              name="role"
              select
              label="Account Role"
              value={formik.values.role}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.role && Boolean(formik.errors.role)}
              helperText={formik.touched.role && formik.errors.role}
              variant="outlined"
              InputLabelProps={{ style: { color: '#94a3b8' } }}
              SelectProps={{ style: { color: '#f8fafc' } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#475569' },
                  '&:hover fieldset': { borderColor: '#06b6d4' },
                  '&.Mui-focused fieldset': { borderColor: '#06b6d4' },
                },
                '& .MuiSvgIcon-root': { color: '#94a3b8' },
              }}
            >
              <MenuItem value="user">Standard Gamer (User)</MenuItem>
              <MenuItem value="admin">Administrator (Admin)</MenuItem>
            </TextField>

            <Button
              color="primary"
              variant="contained"
              fullWidth
              type="submit"
              disabled={loading}
              className="bg-cyan-600 hover:bg-cyan-500 py-3 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: '#0891b2', color: '#ffffff', textTransform: 'none', fontWeight: 'bold' }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline">
              Sign In here
            </Link>
          </div>
        </Paper>
      </div>
    </div>
  );
};

export default Register;

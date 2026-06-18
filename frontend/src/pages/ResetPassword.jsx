import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Paper, Typography, CircularProgress, Alert } from '@mui/material';
import { resetPassword } from '../store/slices/authSlice';
import { useToast } from '../components/ToastNotification';
import SEO from '../components/SEO';

export const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const showToast = useToast();
  const { loading, otpEmail, devOtp } = useSelector((state) => state.auth);

  const formik = useFormik({
    initialValues: {
      email: otpEmail || '',
      otp: '',
      newPassword: '',
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Email is required'),
      otp: Yup.string().required('OTP code is required').length(6, 'OTP must be exactly 6 digits'),
      newPassword: Yup.string().required('New password is required').min(6, 'Password must be at least 6 characters'),
    }),
    onSubmit: (values) => {
      dispatch(resetPassword(values))
        .unwrap()
        .then(() => {
          showToast('Password reset successfully! Please log in with your new credentials.', 'success');
          navigate('/login');
        })
        .catch((err) => {
          showToast(err || 'Failed to reset password. Please check inputs or OTP code.', 'error');
        });
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
      <SEO title="Confirm Reset" description="Set your new account password using the recovery verification code." />

      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-white">
            Set New Password
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Submit your OTP code and input your new password below
          </p>
        </div>

        <Paper
          elevation={24}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-8"
          style={{ backgroundColor: '#1e293b' }}
        >
          {devOtp && (
            <Alert severity="info" className="mb-6 rounded-xl font-mono text-sm">
              Dev Mode OTP: <strong>{devOtp}</strong>
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-5">
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
              id="otp"
              name="otp"
              label="6-Digit OTP Code"
              value={formik.values.otp}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.otp && Boolean(formik.errors.otp)}
              helperText={formik.touched.otp && formik.errors.otp}
              variant="outlined"
              placeholder="123456"
              InputLabelProps={{ style: { color: '#94a3b8' } }}
              inputProps={{ style: { color: '#f8fafc', letterSpacing: '0.25em', textAlign: 'center' } }}
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
              value={formik.values.newPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
              helperText={formik.touched.newPassword && formik.errors.newPassword}
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
              color="primary"
              variant="contained"
              fullWidth
              type="submit"
              disabled={loading}
              className="bg-cyan-600 hover:bg-cyan-500 py-3 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: '#0891b2', color: '#ffffff', textTransform: 'none', fontWeight: 'bold' }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Update Password'}
            </Button>
          </form>
        </Paper>
      </div>
    </div>
  );
};

export default ResetPassword;

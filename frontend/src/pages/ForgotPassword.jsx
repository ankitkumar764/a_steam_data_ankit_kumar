import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button, Paper, Typography, CircularProgress } from '@mui/material';
import { forgotPassword } from '../store/slices/authSlice';
import { useToast } from '../components/ToastNotification';
import SEO from '../components/SEO';

export const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const showToast = useToast();
  const { loading } = useSelector((state) => state.auth);

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Email is required'),
    }),
    onSubmit: (values) => {
      dispatch(forgotPassword(values))
        .unwrap()
        .then((res) => {
          showToast('Password reset code generated successfully!', 'success');
          showToast(`Reset OTP: ${res.otp} (Shown for testing)`, 'info');
          navigate('/reset-password');
        })
        .catch((err) => {
          showToast(err || 'Failed to trigger reset flow.', 'error');
        });
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
      <SEO title="Forgot Password" description="Request a password recovery OTP to securely log back in to your account." />

      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-white">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Enter your email to receive a recovery verification code
          </p>
        </div>

        <Paper
          elevation={24}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-8"
          style={{ backgroundColor: '#1e293b' }}
        >
          <form onSubmit={formik.handleSubmit} className="space-y-6">
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

            <Button
              color="primary"
              variant="contained"
              fullWidth
              type="submit"
              disabled={loading}
              className="bg-cyan-600 hover:bg-cyan-500 py-3 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: '#0891b2', color: '#ffffff', textTransform: 'none', fontWeight: 'bold' }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Code'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 hover:underline">
              Back to Login
            </Link>
          </div>
        </Paper>
      </div>
    </div>
  );
};

export default ForgotPassword;

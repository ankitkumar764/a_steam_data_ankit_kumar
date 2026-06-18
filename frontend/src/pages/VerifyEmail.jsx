import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Paper, Typography, CircularProgress, Alert } from '@mui/material';
import { verifyEmail, sendOtp } from '../store/slices/authSlice';
import { useToast } from '../components/ToastNotification';
import SEO from '../components/SEO';

export const VerifyEmail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const showToast = useToast();
  const { loading, otpEmail, devOtp, user } = useSelector((state) => state.auth);

  const targetEmail = otpEmail || user?.email || '';

  const formik = useFormik({
    initialValues: {
      email: targetEmail,
      otp: '',
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Email is required'),
      otp: Yup.string().required('OTP code is required').length(6, 'OTP must be exactly 6 digits'),
    }),
    onSubmit: (values) => {
      dispatch(verifyEmail(values))
        .unwrap()
        .then(() => {
          showToast('Email verified successfully!', 'success');
          navigate('/dashboard');
        })
        .catch((err) => {
          showToast(err || 'Verification failed. Please check the code.', 'error');
        });
    },
  });

  const handleResendOtp = () => {
    if (!targetEmail) {
      showToast('Please provide an email address first.', 'warning');
      return;
    }
    dispatch(sendOtp({ email: targetEmail }))
      .unwrap()
      .then((res) => {
        showToast('A new OTP verification code has been dispatched.', 'success');
        showToast(`OTP generated: ${res.otp} (Shown for testing)`, 'info');
      })
      .catch((err) => {
        showToast(err || 'Failed to dispatch verification code.', 'error');
      });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
      <SEO title="Verify Email" description="Confirm your email verification code to unlock access to the full Steamax toolset." />

      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-white">
            Verify Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            A 6-digit verification code has been sent to {targetEmail || 'your email'}
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

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {!otpEmail && !user?.email && (
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
            )}

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

            <Button
              color="primary"
              variant="contained"
              fullWidth
              type="submit"
              disabled={loading}
              className="bg-cyan-600 hover:bg-cyan-500 py-3 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: '#0891b2', color: '#ffffff', textTransform: 'none', fontWeight: 'bold' }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Confirm Code'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={handleResendOtp}
              className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 hover:underline bg-transparent border-none cursor-pointer"
            >
              Resend verification code
            </button>
          </div>
        </Paper>
      </div>
    </div>
  );
};

export default VerifyEmail;

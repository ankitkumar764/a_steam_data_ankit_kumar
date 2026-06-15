import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link } from 'react-router-dom';
import { 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  Box, 
  IconButton, 
  InputAdornment 
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { ROUTES } from '../constants/routes';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .min(3, 'Username must be at least 3 characters')
        .required('Username is required'),
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm your password'),
    }),
    onSubmit: (values) => {
      console.log('Register Form Submit:', values);
      // Register API logic will be integrated in PR 6
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md">
        <Paper 
          elevation={6}
          className="p-8 rounded-2xl border border-slate-800 bg-slate-900"
          sx={{ 
            bgcolor: '#0f172a', 
            color: '#f8fafc', 
            borderRadius: '1.25rem', 
            border: '1px solid #1e293b',
            p: 4 
          }}
        >
          {/* Header */}
          <Box className="flex flex-col items-center mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 mb-3 border border-indigo-500/20">
              <PersonAddIcon sx={{ fontSize: 32 }} />
            </div>
            <Typography variant="h5" component="h1" className="font-bold text-white text-center">
              Create Account
            </Typography>
            <Typography variant="body2" className="text-slate-400 text-center mt-1">
              Join to check Steam game statistics
            </Typography>
          </Box>

          {/* Form */}
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <TextField
              fullWidth
              id="username"
              name="username"
              label="Username"
              variant="outlined"
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
              slotProps={{
                input: { className: 'text-white' },
                inputLabel: { className: 'text-slate-400' }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#334155' },
                  '&:hover fieldset': { borderColor: '#475569' },
                  '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#6366f1' },
                '& .MuiFormHelperText-root': { color: '#ef4444' }
              }}
            />

            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email Address"
              variant="outlined"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              slotProps={{
                input: { className: 'text-white' },
                inputLabel: { className: 'text-slate-400' }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#334155' },
                  '&:hover fieldset': { borderColor: '#475569' },
                  '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#6366f1' },
                '& .MuiFormHelperText-root': { color: '#ef4444' }
              }}
            />

            <TextField
              fullWidth
              id="password"
              name="password"
              label="Password (min 6 chars)"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              slotProps={{
                input: {
                  className: 'text-white',
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: '#94a3b8' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                },
                inputLabel: { className: 'text-slate-400' }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#334155' },
                  '&:hover fieldset': { borderColor: '#475569' },
                  '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#6366f1' },
                '& .MuiFormHelperText-root': { color: '#ef4444' }
              }}
            />

            <TextField
              fullWidth
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              variant="outlined"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
              helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
              slotProps={{
                input: {
                  className: 'text-white',
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        sx={{ color: '#94a3b8' }}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                },
                inputLabel: { className: 'text-slate-400' }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#334155' },
                  '&:hover fieldset': { borderColor: '#475569' },
                  '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#6366f1' },
                '& .MuiFormHelperText-root': { color: '#ef4444' }
              }}
            />

            <Button
              color="primary"
              variant="contained"
              fullWidth
              type="submit"
              className="py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 transition-colors uppercase tracking-wider"
              sx={{ 
                bgcolor: '#4f46e5', 
                color: '#ffffff', 
                textTransform: 'none', 
                fontWeight: 'bold', 
                py: 1.5,
                borderRadius: '0.75rem',
                '&:hover': { bgcolor: '#6366f1' } 
              }}
            >
              Sign Up
            </Button>
          </form>

          {/* Login Link */}
          <Box className="mt-6 text-center">
            <Typography variant="body2" className="text-slate-400">
              Already have an account?{' '}
              <Link to={ROUTES.LOGIN} className="text-indigo-400 hover:text-indigo-300 font-semibold hover:underline">
                Sign In
              </Link>
            </Typography>
          </Box>
        </Paper>
      </div>
    </div>
  );
};

export default Register;

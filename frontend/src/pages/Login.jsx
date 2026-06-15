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
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import { ROUTES } from '../constants/routes';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .required('Password is required'),
    }),
    onSubmit: (values) => {
      console.log('Login Form Submit:', values);
      // Auth service logic will be integrated in PR 6
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
          {/* Logo / Header */}
          <Box className="flex flex-col items-center mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 mb-3 border border-cyan-500/20">
              <SportsEsportsIcon sx={{ fontSize: 32 }} />
            </div>
            <Typography variant="h5" component="h1" className="font-bold text-white text-center">
              Welcome Back
            </Typography>
            <Typography variant="body2" className="text-slate-400 text-center mt-1">
              Sign in to manage your Steam games data
            </Typography>
          </Box>

          {/* Form */}
          <form onSubmit={formik.handleSubmit} className="space-y-4">
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
                  '&.Mui-focused fieldset': { borderColor: '#06b6d4' },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#06b6d4' },
                '& .MuiFormHelperText-root': { color: '#ef4444' }
              }}
            />

            <TextField
              fullWidth
              id="password"
              name="password"
              label="Password"
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
                  '&.Mui-focused fieldset': { borderColor: '#06b6d4' },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#06b6d4' },
                '& .MuiFormHelperText-root': { color: '#ef4444' }
              }}
            />

            <Button
              color="primary"
              variant="contained"
              fullWidth
              type="submit"
              className="py-3 rounded-xl font-bold bg-cyan-600 hover:bg-cyan-500 transition-colors uppercase tracking-wider"
              sx={{ 
                bgcolor: '#0891b2', 
                color: '#ffffff', 
                textTransform: 'none', 
                fontWeight: 'bold', 
                py: 1.5,
                borderRadius: '0.75rem',
                '&:hover': { bgcolor: '#06b6d4' } 
              }}
            >
              Sign In
            </Button>
          </form>

          {/* Registration Redirect Link */}
          <Box className="mt-6 text-center">
            <Typography variant="body2" className="text-slate-400">
              Don't have an account?{' '}
              <Link to={ROUTES.REGISTER} className="text-cyan-400 hover:text-cyan-300 font-semibold hover:underline">
                Create one here
              </Link>
            </Typography>
          </Box>
        </Paper>
      </div>
    </div>
  );
};

export default Login;

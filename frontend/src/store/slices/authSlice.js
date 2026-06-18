import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async Thunks for auth actions
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data; // contains user and token
    } catch (err) {
      return rejectWithValue(err.message || 'Registration failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data; // contains user and token
    } catch (err) {
      return rejectWithValue(err.message || 'Login failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout');
      return null;
    } catch (err) {
      return rejectWithValue(err.message || 'Logout failed');
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.patch('/auth/profile', profileData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update profile');
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwords, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/change-password', passwords);
      return response.message;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to change password');
    }
  }
);

export const sendOtp = createAsyncThunk(
  'auth/sendOtp',
  async (emailData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/send-otp', emailData);
      return { email: emailData.email, otp: response.otp }; // return OTP for dev convenience
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to send OTP');
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (verifyData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/verify-email', verifyData);
      return response.message;
    } catch (err) {
      return rejectWithValue(err.message || 'Verification failed');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (emailData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/forgot-password', emailData);
      return { email: emailData.email, otp: response.otp };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to send reset OTP');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (resetData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/reset-password', resetData);
      return response.message;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to reset password');
    }
  }
);

// Decode token utility to extract role and user ID
const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

const token = localStorage.getItem('token');
const savedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

const initialState = {
  user: savedUser,
  token: token,
  isAuthenticated: !!token && !!savedUser,
  loading: false,
  error: null,
  otpSent: false,
  otpEmail: '',
  devOtp: '', // Saved generated OTP for dev/testing testing convenience
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetOtpState: (state) => {
      state.otpSent = false;
      state.otpEmail = '';
      state.devOtp = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      })
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      // Send OTP
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.otpSent = true;
        state.otpEmail = action.payload.email;
        state.devOtp = action.payload.otp;
      })
      // Forgot Password OTP
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.otpSent = true;
        state.otpEmail = action.payload.email;
        state.devOtp = action.payload.otp;
      })
      // Verify Email
      .addCase(verifyEmail.fulfilled, (state) => {
        if (state.user) {
          state.user.isVerified = true;
          localStorage.setItem('user', JSON.stringify(state.user));
        }
        state.otpSent = false;
        state.devOtp = '';
      });
  },
});

export const { clearError, resetOtpState } = authSlice.actions;
export default authSlice.reducer;

const authService = require('../services/authService');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');

// Helper to extract user ID from auth headers
const getUserIdFromReq = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded.id;
    } catch (err) {
      return null;
    }
  }
  return req.headers['x-user-id'] || null; // Fallback for easier dev testing
};

// Register new user
const register = catchAsync(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username, email, and password are required fields'
    });
  }

  const result = await authService.registerUser(req.body);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: result
  });
});

// Login user
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required fields'
    });
  }

  const result = await authService.loginUser(email, password);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result
  });
});

// Logout user
const logout = catchAsync(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

// Send verification OTP
const sendOtp = catchAsync(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required to send OTP'
    });
  }

  const otp = await authService.sendOtpCode(email);

  res.status(200).json({
    success: true,
    message: 'OTP verification code generated successfully',
    otp: otp // Returning OTP for development/testing ease
  });
});

// Verify registered email
const verifyEmail = catchAsync(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: 'Email and OTP code are required fields'
    });
  }

  await authService.verifyOtpEmail(email, otp);

  res.status(200).json({
    success: true,
    message: 'Email verified successfully'
  });
});

// Request password reset OTP
const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  const otp = await authService.forgotUserPassword(email);

  res.status(200).json({
    success: true,
    message: 'Password reset OTP sent successfully',
    otp: otp
  });
});

// Reset forgotten password
const resetPassword = catchAsync(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Email, OTP, and newPassword are required fields'
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 6 characters long'
    });
  }

  await authService.resetUserPassword(email, otp, newPassword);

  res.status(200).json({
    success: true,
    message: 'Password reset successfully'
  });
});

// Change user password
const changePassword = catchAsync(async (req, res) => {
  const userId = getUserIdFromReq(req);
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Authentication required'
    });
  }

  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'oldPassword and newPassword are required fields'
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 6 characters long'
    });
  }

  await authService.changeUserPassword(userId, oldPassword, newPassword);

  res.status(200).json({
    success: true,
    message: 'Password updated successfully'
  });
});

// Fetch authenticated profile
const getProfile = catchAsync(async (req, res) => {
  const userId = getUserIdFromReq(req);
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Authentication required'
    });
  }

  const user = await User.findById(userId).select('-password');
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User profile not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Profile retrieved successfully',
    data: user
  });
});

// Update authenticated profile
const updateProfile = catchAsync(async (req, res) => {
  const userId = getUserIdFromReq(req);
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Authentication required'
    });
  }

  const { username, email } = req.body;
  const updates = {};
  if (username) updates.username = username;
  
  if (email) {
    // Check email uniqueness if changing
    const existing = await User.findOne({ email, _id: { $ne: userId } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This email is already in use by another user'
      });
    }
    updates.email = email;
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  ).select('-password');

  if (!updatedUser) {
    return res.status(404).json({
      success: false,
      message: 'User profile not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: updatedUser
  });
});

module.exports = {
  register,
  login,
  logout,
  sendOtp,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  getProfile,
  updateProfile
};

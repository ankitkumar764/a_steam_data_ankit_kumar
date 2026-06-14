const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for user
 * @param {string} userId - User Object ID string
 * @returns {string} - Signed JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '1d'
  });
};

/**
 * Register a new user account
 * @param {Object} userData - User registration fields
 * @returns {Promise<Object>} - Registration details with token
 */
const registerUser = async (userData) => {
  const { username, email, password, role } = userData;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('User with this email already exists');
    error.status = 400;
    throw error;
  }

  const user = await User.create({
    username,
    email,
    password,
    role: role || 'user'
  });

  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    },
    token
  };
};

/**
 * Log in an existing user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - Authentication details with token
 */
const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    },
    token
  };
};

/**
 * Generate and save a 6-digit verification OTP
 * @param {string} email - User email
 * @returns {Promise<string>} - Generated OTP code
 */
const sendOtpCode = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  // Generate 6-digit numeric OTP
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  await user.save();
  return otp;
};

/**
 * Verify registered email using OTP
 * @param {string} email - User email
 * @param {string} otp - OTP code
 * @returns {Promise<boolean>} - True if verified
 */
const verifyOtpEmail = async (email, otp) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  if (!user.otp || user.otp !== otp || new Date() > user.otpExpires) {
    const error = new Error('Invalid or expired OTP code');
    error.status = 400;
    throw error;
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;

  await user.save();
  return true;
};

/**
 * Initialize password reset flow
 * @param {string} email - User email
 * @returns {Promise<string>} - Reset OTP code
 */
const forgotUserPassword = async (email) => {
  return await sendOtpCode(email);
};

/**
 * Complete password reset using OTP
 * @param {string} email - User email
 * @param {string} otp - OTP code
 * @param {string} newPassword - New password
 * @returns {Promise<boolean>} - True if reset successfully
 */
const resetUserPassword = async (email, otp, newPassword) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  if (!user.otp || user.otp !== otp || new Date() > user.otpExpires) {
    const error = new Error('Invalid or expired OTP code');
    error.status = 400;
    throw error;
  }

  user.password = newPassword; // Pre-save hook hashes this
  user.otp = undefined;
  user.otpExpires = undefined;

  await user.save();
  return true;
};

/**
 * Change authenticated user password
 * @param {string} userId - User Object ID
 * @param {string} oldPassword - Old password
 * @param {string} newPassword - New password
 * @returns {Promise<boolean>} - True if updated
 */
const changeUserPassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    const error = new Error('Incorrect old password');
    error.status = 400;
    throw error;
  }

  user.password = newPassword; // Pre-save hook hashes this
  await user.save();
  return true;
};

module.exports = {
  registerUser,
  loginUser,
  sendOtpCode,
  verifyOtpEmail,
  forgotUserPassword,
  resetUserPassword,
  changeUserPassword,
  generateToken
};

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../users/user.model.js';
import { generateToken } from '../../config/jwt.js';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../../utils/email.js';

const SALT_ROUNDS = 10;

/**
 * 📝 Register new user
 */
const register = async (userData) => {
  const { fullName, name, email, password } = userData;
  
  // Validation
  if (!email || !password) {
    throw new Error('Email and password are required');
  }
  
  const userName = fullName || name;
  if (!userName) {
    throw new Error('Full name is required');
  }
  
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }
  
  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new Error('Email already registered');
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  
  // Create user
  const user = new User({
    name: userName,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: 'user',
    subscriptionPlan: 'free',
    subscriptionStatus: 'inactive'
  });
  
  await user.save();
  
  // Generate token for auto-login
  const token = generateToken({
    userId: user._id,
    userType: 'user',
    role: user.role,
    subscriptionPlan: user.subscriptionPlan,
    subscriptionExpiry: user.subscriptionExpiry
  });
  
  // Send welcome email (non-blocking)
  sendWelcomeEmail(user.email, user.name).catch(err => {
    console.error('Failed to send welcome email:', err.message);
  });
  
  return { 
    message: 'User registered successfully',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      role: user.role,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionStatus: user.subscriptionStatus
    }
  };
};

/**
 * 🔐 Login user
 */
const login = async (email, password) => {
  // Validation
  if (!email || !password) {
    throw new Error('Email and password are required');
  }
  
  // Find user by email
  const user = await User.findOne({ email: email.toLowerCase() })
    .populate('subscription.plan', 'name price duration');
  
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  // Compare passwords
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }
  
  // Generate JWT token
  const token = generateToken({
    userId: user._id,
    userType: 'user',
    role: user.role,
    subscriptionPlan: user.subscriptionPlan,
    subscriptionExpiry: user.subscriptionExpiry
  });
  
  // Return user data (without password)
  return {
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      role: user.role,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionExpiry: user.subscriptionExpiry,
      subscription: user.subscription
    }
  };
};

/**
 * 📧 Request password reset
 */
const forgotPassword = async (email) => {
  if (!email) {
    throw new Error('Email is required');
  }
  
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // Don't reveal if email exists for security
    return {
      message: 'If your email is registered, you will receive a password reset code'
    };
  }
  
  // Generate 4-digit code
  const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
  
  // Save code and expiry (10 minutes)
  user.resetPasswordCode = resetCode;
  user.resetPasswordExpiry = Date.now() + 600000; // 10 minutes
  await user.save();
  
  // Send password reset email with code
  try {
    await sendPasswordResetEmail(user.email, resetCode, user.name);
    console.log(`✅ Password reset code sent to: ${user.email}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${user.email}:`, error.message);
    // Continue anyway - code is saved in DB
  }
  
  // Log reset code for development
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔐 Password reset code: ${resetCode}`);
  }
  
  return {
    message: 'Password reset code sent to your email',
    // For development only - remove in production
    ...(process.env.NODE_ENV === 'development' && { resetCode })
  };
};

/**
 * 🔄 Reset password with code
 */
const resetPassword = async (code, newPassword) => {
  if (!code || !newPassword) {
    throw new Error('Code and new password are required');
  }
  
  if (newPassword.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }
  
  // Find user with valid code
  const user = await User.findOne({
    resetPasswordCode: code,
    resetPasswordExpiry: { $gt: Date.now() }
  });
  
  if (!user) {
    throw new Error('Invalid or expired reset code');
  }
  
  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  
  // Update password and clear reset code
  user.password = hashedPassword;
  user.resetPasswordCode = undefined;
  user.resetPasswordExpiry = undefined;
  await user.save();
  
  return {
    message: 'Password reset successful. You can now login with your new password'
  };
};

/**
 * 👤 Get user profile
 */
const getProfile = async (userId) => {
  const user = await User.findById(userId)
    .select('-password -resetPasswordCode -resetPasswordExpiry');
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Get active subscription from Subscription collection
  const Subscription = (await import('../subscriptions/subscription.model.js')).default;
  const subscription = await Subscription.findOne({ 
    userId: user._id, 
    status: 'active' 
  }).populate('planId');
  
  let subscriptionData = null;
  if (subscription && subscription.planId) {
    // Filter subscription options to show only enabled ones
    const filteredOptions = {};
    if (subscription.planId.subscriptionOptions) {
      Object.keys(subscription.planId.subscriptionOptions).forEach(key => {
        if (subscription.planId.subscriptionOptions[key]?.enabled) {
          filteredOptions[key] = {
            price: subscription.planId.subscriptionOptions[key].price,
            enabled: true
          };
        }
      });
    }
    
    subscriptionData = {
      plan: {
        id: subscription.planId._id,
        key: subscription.planId.key,
        translations: subscription.planId.translations,
        subscriptionOptions: filteredOptions
      },
      type: subscription.type,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      status: subscription.status
    };
  }
  
  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      role: user.role,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionStatus: user.subscriptionStatus,
      subscription: subscriptionData,
      createdAt: user.createdAt
    }
  };
};

/**
 * ✏️ Update user profile
 */
const updateProfile = async (userId, updateData) => {
  const { fullName, name, email, currentPassword, newPassword, profileImage } = updateData;
  
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Update name if provided
  if (fullName || name) {
    user.name = fullName || name;
  }
  
  // Update profile image if provided
  if (profileImage) {
    user.profileImage = profileImage;
  }
  
  // Update email if provided
  if (email && email !== user.email) {
    // Check if new email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error('Email already in use');
    }
    user.email = email.toLowerCase();
  }
  
  // Update password if provided
  if (newPassword) {
    if (!currentPassword) {
      throw new Error('Current password is required to set new password');
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }
    
    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters');
    }
    
    // Hash and update password
    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
  }
  
  await user.save();
  
  return {
    message: 'Profile updated successfully',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      role: user.role,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionStatus: user.subscriptionStatus
    }
  };
};

export { 
  register, 
  login, 
  forgotPassword, 
  resetPassword,
  getProfile,
  updateProfile
};
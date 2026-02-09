import express from 'express';
import { 
  register, 
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile
} from './auth.controller.js';
import { getCurrentUserPermissions, getAllPermissions } from './rbac.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Public Authentication Routes
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 * @body    { fullName, email, password }
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 * @body    { email, password }
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 * @body    { email }
 */
router.post('/forgot-password', forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 * @body    { token, password }
 */
router.post('/reset-password', resetPassword);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Protected Routes (Require Authentication)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 * @body    { fullName?, email?, currentPassword?, newPassword? }
 */
router.put('/profile', authenticate, updateProfile);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RBAC Endpoints
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * @route   GET /api/auth/me/permissions
 * @desc    Get current user permissions
 * @access  Private
 */
router.get('/me/permissions', authenticate, getCurrentUserPermissions);

/**
 * @route   GET /api/auth/permissions/all
 * @desc    Get all available permissions
 * @access  Public
 */
router.get('/permissions/all', getAllPermissions);

export default router; 
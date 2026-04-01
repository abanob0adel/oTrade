import express from 'express';
import {
  // Settings
  createOrUpdateSettings,
  getSettingsByKey,
  getAllSettings,
  // Team
  createTeamMember,
  getAllTeamMembers,
  getTeamMemberById,
  updateTeamMember,
  deleteTeamMember
} from './about.controller.js';
import { authenticate, checkPermission } from '../../middlewares/rbac.middleware.js';
import upload from '../../middlewares/upload.middleware.js';

const router = express.Router();

// ==================== SETTINGS ROUTES ====================

// Public routes
router.get('/settings', getAllSettings);
router.get('/settings/:key', getSettingsByKey);

// Admin routes - POST creates or updates automatically
router.post(
  '/settings',
  authenticate(['admin', 'super_admin']),
  checkPermission('support', 'create'),
  upload.none(), // Parse form-data without files
  createOrUpdateSettings
);

// ==================== TEAM ROUTES ====================

// Public routes
router.get('/team', getAllTeamMembers);
router.get('/team/:id', getTeamMemberById);

// Admin routes
router.post(
  '/team',
  authenticate(['admin', 'super_admin']),
  checkPermission('support', 'create'),
  upload.fields([{ name: 'image', maxCount: 1 }]),
  createTeamMember
);

router.put(
  '/team/:id',
  authenticate(['admin', 'super_admin']),
  checkPermission('support', 'update'),
  upload.fields([{ name: 'image', maxCount: 1 }]),
  updateTeamMember
);

router.delete(
  '/team/:id',
  authenticate(['admin', 'super_admin']),
  checkPermission('support', 'delete'),
  deleteTeamMember
);

export default router;

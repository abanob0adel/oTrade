import express from 'express';
import {
  sendBulkEmail,
  getRecipientCount,
  getAllUsersForEmail
} from './email.controller.js';
import { authenticate, checkPermission } from '../../middlewares/rbac.middleware.js';

const router = express.Router();

/**
 * Email Routes
 * Base URL: /api/emails
 * All routes require admin authentication
 */

// Send bulk email
router.post('/send', authenticate(['admin', 'super_admin']), checkPermission('courses', 'create'), sendBulkEmail);

// Get recipient count
router.post('/recipients/count', authenticate(['admin', 'super_admin']), checkPermission('courses', 'read'), getRecipientCount);

// Get all users for selection
router.get('/users', authenticate(['admin', 'super_admin']), checkPermission('courses', 'read'), getAllUsersForEmail);

export default router;

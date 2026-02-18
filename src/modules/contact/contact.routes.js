import express from 'express';
import {
  createContactRequest,
  getAllContactRequests,
  getContactRequestById,
  deleteContactRequest
} from './contact.controller.js';
import { authenticate, checkPermission } from '../../middlewares/rbac.middleware.js';
import { pagination } from '../../middlewares/pagination.middleware.js';

const router = express.Router();

/**
 * Contact Us Routes
 * Base URL: /api/contact-us
 */

// Public route - anyone can submit contact request
router.post('/', createContactRequest);

// Admin routes - require authentication and permissions
router.get('/', authenticate(['admin', 'super_admin']), checkPermission('support', 'read'), pagination(), getAllContactRequests);
router.get('/:id', authenticate(['admin', 'super_admin']), checkPermission('support', 'read'), getContactRequestById);
router.delete('/:id', authenticate(['admin', 'super_admin']), checkPermission('support', 'delete'), deleteContactRequest);

export default router;

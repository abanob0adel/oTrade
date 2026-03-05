import express from 'express';
import optionalAuthenticate, { authenticate, checkPermission } from '../../middlewares/rbac.middleware.js';
import upload, { uploadWebinar, uploadWithOptionalImage } from '../../middlewares/upload.middleware.js';
import { createWebinarIndependent,deleteWebinar, getAllWebinarsIndependent, getWebinarByIdIndependent, registerForWebinarIndependent ,getWebinarSubmissions } from './webinars.independent.controller.js';

const router = express.Router();
router.get('/admin', authenticate(['admin', 'super_admin']), checkPermission('webinars', 'view'), getAllWebinarsIndependent);

// Public routes with optional authentication for subscription check
router.get('/', optionalAuthenticate, getAllWebinarsIndependent);
router.get('/:id', optionalAuthenticate, getWebinarByIdIndependent);

// Register for webinar (Public)
router.post('/:id/register', registerForWebinarIndependent);


// Admin routes
router.post('/', authenticate(['admin', 'super_admin']), checkPermission('webinars', 'create'), uploadWebinar, createWebinarIndependent);
router.get(
  '/:id/submissions',
  authenticate(['admin', 'super_admin']),
  checkPermission('webinars', 'view'),
  getWebinarSubmissions
);
router.delete(
  '/:id',
  authenticate(['admin', 'super_admin']),
  checkPermission('webinars', 'view'),
  deleteWebinar
);
export default router; 
import express from 'express';
import {
  createPartner,
  getAllPartners,
  getPartnerById,
  updatePartner,
  deletePartner
} from './partner.controller.js';
import { authenticate, checkPermission } from '../../middlewares/rbac.middleware.js';
import upload from '../../middlewares/upload.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllPartners);
router.get('/:id', getPartnerById);

// Admin routes
router.post(
  '/',
  authenticate(['admin', 'super_admin']),
  checkPermission('partners', 'create'),
  upload.fields([{ name: 'image', maxCount: 1 }]),
  createPartner
);

router.put(
  '/:id',
  authenticate(['admin', 'super_admin']),
  checkPermission('partners', 'update'),
  upload.fields([{ name: 'image', maxCount: 1 }]),
  updatePartner
);

router.delete(
  '/:id',
  authenticate(['admin', 'super_admin']),
  checkPermission('partners', 'delete'),
  deletePartner
);

export default router;

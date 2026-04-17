import express from 'express';
import optionalAuthenticate, { authenticate, checkPermission } from '../../middlewares/rbac.middleware.js';
import { detectLanguage } from '../../middlewares/lang.middleware.js';
import { uploadWithOptionalImage } from '../../middlewares/upload.middleware.js';
import {
  createIndicator,
  updateIndicator,
  deleteIndicator,
  getAllIndicators,
  getIndicatorById,
  addIndicatorUpdate,
  deleteIndicatorUpdate
} from './indicators.controller.js';

const router = express.Router();

// Public
router.get('/', optionalAuthenticate, detectLanguage, getAllIndicators);
router.get('/:id', optionalAuthenticate, detectLanguage, getIndicatorById);

// Admin - CRUD
router.post('/', authenticate(['admin', 'super_admin']), checkPermission('indicators', 'create'), uploadWithOptionalImage, createIndicator);
router.put('/:id', authenticate(['admin', 'super_admin']), checkPermission('indicators', 'update'), uploadWithOptionalImage, updateIndicator);
router.delete('/:id', authenticate(['admin', 'super_admin']), checkPermission('indicators', 'delete'), deleteIndicator);

// Admin - Updates
router.post('/:id/updates', authenticate(['admin', 'super_admin']), uploadWithOptionalImage, addIndicatorUpdate);
router.delete('/:id/updates/:updateId', authenticate(['admin', 'super_admin']), deleteIndicatorUpdate);

export default router;

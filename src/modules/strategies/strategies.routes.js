import express from 'express';
import { authenticate, checkPermission } from '../../middlewares/rbac.middleware.js';
import optionalAuthenticate from '../../middlewares/rbac.middleware.js';
import { pagination } from '../../middlewares/pagination.middleware.js';
import {
  createStrategy,
  getAllStrategies,
  getStrategyById,
  updateStrategy,
  deleteStrategy,
  getFreeStrategies,
  getPaidStrategies
} from './strategies.controller.js';
import { uploadWithOptionalImage } from '../../middlewares/upload.middleware.js';

const router = express.Router();

/**
 * Public routes (with optional authentication to check subscription)
 */
router.get('/', optionalAuthenticate, pagination(), getAllStrategies);
router.get('/free', optionalAuthenticate, pagination(), getFreeStrategies);
router.get('/paid', optionalAuthenticate, pagination(), getPaidStrategies);
router.get('/:id', optionalAuthenticate, getStrategyById);

/**
 * Admin routes
 */
router.route('/')
  .post(
    authenticate(['admin', 'super_admin']),
    checkPermission('strategies', 'create'),
    uploadWithOptionalImage, 
    createStrategy
  );

router.route('/:id')
  .put(
    authenticate(['admin', 'super_admin']),
    checkPermission('strategies', 'update'),
     uploadWithOptionalImage,
    updateStrategy
  )
  .delete(
    authenticate(['admin', 'super_admin']),
    checkPermission('strategies', 'delete'),
    
    deleteStrategy
  );

export default router;

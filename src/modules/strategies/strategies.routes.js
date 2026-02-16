import express from 'express';
import { authenticate, checkPermission } from '../../middlewares/rbac.middleware.js';
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
 * Public routes
 */
router.get('/', pagination(), getAllStrategies);
router.get('/free', pagination(), getFreeStrategies);
router.get('/paid', pagination(), getPaidStrategies);
router.get('/:id', getStrategyById);

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

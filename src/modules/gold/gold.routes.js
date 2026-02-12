import express from 'express';
import { getGoldPrice, getGoldPriceWithCache, getGoldInfo, upsertGoldInfo } from './gold.controller.js';
import { authenticate } from '../../middlewares/rbac.middleware.js';
import { checkPermission } from '../../middlewares/rbac.middleware.js';
import { uploadWithOptionalImage } from '../../middlewares/upload.middleware.js';

const router = express.Router();

/**
 * Gold Price Routes
 * Base URL: /api/gold
 */

// Public routes - Get gold price
router.get('/', getGoldPrice);
router.get('/cached', getGoldPriceWithCache);

// Public route - Get gold info
router.get('/info', getGoldInfo);

// Admin route - Create/Update gold info (with image upload support)
router.post('/info', authenticate(['admin', 'super_admin']), checkPermission('courses', 'create'), uploadWithOptionalImage, upsertGoldInfo);

export default router;

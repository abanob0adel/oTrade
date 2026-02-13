import express from 'express';
import { getForexPrice, getForexPriceWithCache, getForexInfo, upsertForexInfo } from './forex.controller.js';
import { authenticate, checkPermission } from '../../middlewares/rbac.middleware.js';
import { uploadWithOptionalImage } from '../../middlewares/upload.middleware.js';

const router = express.Router();

/**
 * Forex Routes
 * Base URL: /api/forex
 */

// Public routes - Get forex rate
router.get('/', getForexPrice);
router.get('/cached', getForexPriceWithCache);

// Public route - Get forex info
router.get('/info', getForexInfo);

// Admin route - Create/Update forex info (with image upload support)
router.post('/info', authenticate(['admin', 'super_admin']), checkPermission('courses', 'create'), uploadWithOptionalImage, upsertForexInfo);

export default router;

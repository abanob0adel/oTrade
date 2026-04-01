import express from 'express';
import { getBitcoinPrice, getBitcoinPriceWithCache, getBitcoinInfo, upsertBitcoinInfo } from './bitcoin.controller.js';
import { authenticate, checkPermission } from '../../middlewares/rbac.middleware.js';
import { uploadWithOptionalImage } from '../../middlewares/upload.middleware.js';

const router = express.Router();

/**
 * Bitcoin Routes
 * Base URL: /api/bitcoin
 */

// Public routes - Get bitcoin price
router.get('/', getBitcoinPrice);
router.get('/cached', getBitcoinPriceWithCache);

// Public route - Get bitcoin info
router.get('/info', getBitcoinInfo);

// Admin route - Create/Update bitcoin info (with image upload support)
router.post('/info', authenticate(['admin', 'super_admin']), checkPermission('analysis', 'create'), uploadWithOptionalImage, upsertBitcoinInfo);

export default router;

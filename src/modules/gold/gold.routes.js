import express from 'express';
import { getGoldPrice, getGoldPriceWithCache, getGoldConfig, updateGoldConfig, createGoldConfig } from './gold.controller.js';
import { authenticate } from '../../middlewares/rbac.middleware.js';
import { checkPermission } from '../../middlewares/rbac.middleware.js';

const router = express.Router();

/**
 * Gold Price Routes
 * Base URL: /api/gold
 */

// Public routes - Get gold price
router.get('/', getGoldPrice);
router.get('/cached', getGoldPriceWithCache);

// Public route - Get gold config
router.get('/config', getGoldConfig);

// Admin routes - Manage gold config
router.post('/config', authenticate(['admin', 'super_admin']), checkPermission('courses', 'create'), createGoldConfig);
router.put('/config', authenticate(['admin', 'super_admin']), checkPermission('courses', 'update'), updateGoldConfig);

export default router;

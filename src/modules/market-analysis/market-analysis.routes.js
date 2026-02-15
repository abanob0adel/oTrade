import express from 'express';
import {
  getAnalysesByCategory,
  getAnalysisBySlug,
  getAnalysisById,
  createAnalysis,
  updateAnalysis,
  deleteAnalysis,
  addAnalysisUpdate
} from './market-analysis.controller.js';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from './category.controller.js';
import { authenticate, checkPermission } from '../../middlewares/rbac.middleware.js';
import multer from 'multer';

const router = express.Router();

// Multer configuration for image uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const uploadImages = upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]);

const uploadUpdateImage = upload.fields([
  { name: 'updateImage', maxCount: 1 }
]);

const uploadCategoryImage = upload.fields([
  { name: 'coverImage', maxCount: 1 }
]);

/**
 * Market Analysis Routes
 * Base URL: /api/market-analysis
 */

// Category Management Routes
router.get('/categories', getAllCategories);
router.post('/categories', authenticate(['admin', 'super_admin']), checkPermission('courses', 'create'), uploadCategoryImage, createCategory);
router.put('/categories/:id', authenticate(['admin', 'super_admin']), checkPermission('courses', 'update'), uploadCategoryImage, updateCategory);
router.delete('/categories/:id', authenticate(['admin', 'super_admin']), checkPermission('courses', 'delete'), deleteCategory);

// Analysis Routes
router.get('/single/:id', getAnalysisById);
router.get('/:category', getAnalysesByCategory);
router.get('/:category/:slug', getAnalysisBySlug);
router.post('/', authenticate(['admin', 'super_admin']), checkPermission('courses', 'create'), uploadImages, createAnalysis);
router.post('/:id/updates', authenticate(['admin', 'super_admin']), checkPermission('courses', 'create'), uploadUpdateImage, addAnalysisUpdate);
router.put('/:id', authenticate(['admin', 'super_admin']), checkPermission('courses', 'update'), uploadImages, updateAnalysis);
router.delete('/:id', authenticate(['admin', 'super_admin']), checkPermission('courses', 'delete'), deleteAnalysis);

export default router;

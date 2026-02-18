import express from 'express';
import {
  getAnalysesByCategory,
  getAnalysisBySlug,
  getAnalysisById,
  createAnalysis,
  updateAnalysis,
  deleteAnalysis,
  addAnalysisUpdate,
  getAnalysisUpdates,
  updateAnalysisUpdate,
  deleteAnalysisUpdate
} from './market-analysis.controller.js';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from './category.controller.js';
import { authenticate, checkPermission } from '../../middlewares/rbac.middleware.js';
import { pagination } from '../../middlewares/pagination.middleware.js';
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
router.post('/categories', authenticate(['admin', 'super_admin']), checkPermission('analysis', 'create'), uploadCategoryImage, createCategory);
router.put('/categories/:id', authenticate(['admin', 'super_admin']), checkPermission('analysis', 'update'), uploadCategoryImage, updateCategory);
router.delete('/categories/:id', authenticate(['admin', 'super_admin']), checkPermission('analysis', 'delete'), deleteCategory);

// Analysis Routes
router.get('/single/:slug', getAnalysisBySlug);
router.get('/:category', pagination(), getAnalysesByCategory);
router.get('/:category/:slug', getAnalysisBySlug);
router.post('/', authenticate(['admin', 'super_admin']), checkPermission('analysis', 'create'), uploadImages, createAnalysis);
router.put('/:id', authenticate(['admin', 'super_admin']), checkPermission('analysis', 'update'), uploadImages, updateAnalysis);
router.delete('/:id', authenticate(['admin', 'super_admin']), checkPermission('analysis', 'delete'), deleteAnalysis);

// Updates CRUD Routes
router.get('/updates/:id/all', getAnalysisUpdates);
router.post('/updates/:id/add', authenticate(['admin', 'super_admin']), checkPermission('analysis', 'create'), uploadUpdateImage, addAnalysisUpdate);
router.put('/updates/:id/edit/:updateId', authenticate(['admin', 'super_admin']), checkPermission('analysis', 'update'), uploadUpdateImage, updateAnalysisUpdate);
router.delete('/updates/:id/delete/:updateId', authenticate(['admin', 'super_admin']), checkPermission('analysis', 'delete'), deleteAnalysisUpdate);

export default router;

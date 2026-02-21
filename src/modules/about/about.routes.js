import express from 'express';
import {
  createAboutItem,
  getAllAboutItems,
  getAboutItemById,
  updateAboutItem,
  deleteAboutItem
} from './about.controller.js';
import { authenticate, checkPermission } from '../../middlewares/rbac.middleware.js';
import multer from 'multer';

const router = express.Router();

// Multer configuration
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
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

const uploadImage = upload.fields([
  { name: 'image', maxCount: 1 }
]);

/**
 * About Routes
 * Base URL: /api/about
 */

// Public routes
router.get('/', getAllAboutItems);
router.get('/:id', getAboutItemById);

// Admin routes
router.post('/', authenticate(['admin', 'super_admin']), checkPermission('support', 'create'), uploadImage, createAboutItem);
router.put('/:id', authenticate(['admin', 'super_admin']), checkPermission('support', 'update'), uploadImage, updateAboutItem);
router.delete('/:id', authenticate(['admin', 'super_admin']), checkPermission('support', 'delete'), deleteAboutItem);

export default router;

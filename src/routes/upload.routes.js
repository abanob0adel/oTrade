import express from 'express';
import { 
  generateUploadUrl,
  uploadBookPDF, 
  uploadImage, 
  uploadVideo,
  deleteFile,
  uploadMultipleFiles
} from '../controllers/upload.controller.js';
import { 
  uploadBooks, 
  uploadVideo as uploadVideoMiddleware,
  uploadAllMediaFiles
} from '../middlewares/upload.middleware.js';
import upload from '../middlewares/upload.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @route   POST /api/upload/generate-url
 * @desc    Generate signed upload URL for direct frontend upload to BunnyCDN
 * @access  Private (Admin only)
 */
router.post('/generate-url', authenticate, generateUploadUrl);

/**
 * @route   POST /api/upload/book
 * @desc    Upload book PDF and cover image
 * @access  Private (add auth middleware as needed)
 */
router.post('/book', uploadBooks, uploadBookPDF);

/**
 * @route   POST /api/upload/image
 * @desc    Upload single image
 * @access  Private
 */
router.post('/image', upload.single('image'), uploadImage);

/**
 * @route   POST /api/upload/video
 * @desc    Upload video file
 * @access  Private
 */
router.post('/video', uploadVideoMiddleware, uploadVideo);

/**
 * @route   POST /api/upload/multiple
 * @desc    Upload multiple files
 * @access  Private
 */
router.post('/multiple', upload.array('files', 10), uploadMultipleFiles);

/**
 * @route   POST /api/upload/media
 * @desc    Upload mixed media (image, video, PDF)
 * @access  Private
 */
router.post('/media', uploadAllMediaFiles, uploadBookPDF);

/**
 * @route   DELETE /api/upload/delete
 * @desc    Delete file from BunnyCDN
 * @access  Private
 */
router.delete('/delete', deleteFile);

export default router;

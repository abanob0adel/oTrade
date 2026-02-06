import express from 'express';
import { authenticate, checkPermission } from '../../middlewares/rbac.middleware.js';
import { detectLanguage } from '../../middlewares/lang.middleware.js';
import { uploadBooks } from '../../middlewares/upload.middleware.js';
import { createBook, updateBook, deleteBook, getAllBooks, getBookById } from './books.controller.js';

const router = express.Router();

// Admin routes
router.get('/admin', authenticate(['admin', 'super_admin']), checkPermission('books', 'view'), getAllBooks);
router.post('/', authenticate(['admin', 'super_admin']), checkPermission('books', 'create'), uploadBooks, createBook);
router.put('/:id', authenticate(['admin', 'super_admin']), checkPermission('books', 'update'), uploadBooks, updateBook);
router.delete('/:id', authenticate(['admin', 'super_admin']), checkPermission('books', 'delete'), deleteBook);

// Public routes with language detection
router.get('/', detectLanguage, getAllBooks);
router.get('/:id', detectLanguage, getBookById);

export default router;  //kiro 
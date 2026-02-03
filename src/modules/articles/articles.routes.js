import express from 'express';
import { authenticate, checkPermission } from '../../middlewares/rbac.middleware.js';
import { detectLanguage } from '../../middlewares/lang.middleware.js';
import { uploadBooks } from '../../middlewares/upload.middleware.js';
import { createArticle, updateArticle, deleteArticle, getAllArticles, getArticleById } from './articles.controller.js';

const router = express.Router();

// Admin routes
router.get('/admin', authenticate(['admin', 'super_admin']), checkPermission('articles', 'view'), getAllArticles);
router.post('/', authenticate(['admin', 'super_admin']), checkPermission('articles', 'create'), uploadBooks, createArticle);
router.put('/:id', authenticate(['admin', 'super_admin']), checkPermission('articles', 'update'), uploadBooks, updateArticle);
router.delete('/:id', authenticate(['admin', 'super_admin']), checkPermission('articles', 'delete'), deleteArticle);

// Public routes with language detection
router.get('/', detectLanguage, getAllArticles);
router.get('/:id', detectLanguage, getArticleById);

export default router;
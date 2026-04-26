import express from 'express';
import optionalAuthenticate, { authenticate, checkPermission } from '../../middlewares/rbac.middleware.js';
import { detectLanguage } from '../../middlewares/lang.middleware.js';
import { uploadWithOptionalImage } from '../../middlewares/upload.middleware.js';
import {
  createExpertAdvisor, updateExpertAdvisor, deleteExpertAdvisor,
  getAllExpertAdvisors, getExpertAdvisorById,
  addUpdate, editUpdate, deleteUpdate,
  addKeyFeature, editKeyFeature, deleteKeyFeature,
  addRecommendation, editRecommendation, deleteRecommendation,
  addProCon, editProCon, deleteProCon
} from './expert-advisors.controller.js';

const router = express.Router();
const auth = authenticate(['admin', 'super_admin']);
const perm = (action) => checkPermission('expert-advisors', action);

// Public
router.get('/', optionalAuthenticate, detectLanguage, getAllExpertAdvisors);
router.get('/:id', optionalAuthenticate, detectLanguage, getExpertAdvisorById);

// Main CRUD
router.post('/', auth, perm('create'), uploadWithOptionalImage, createExpertAdvisor);
router.put('/:id', auth, perm('update'), uploadWithOptionalImage, updateExpertAdvisor);
router.delete('/:id', auth, perm('delete'), deleteExpertAdvisor);

// Updates
router.post('/:id/updates', auth, perm('create'), uploadWithOptionalImage, addUpdate);
router.put('/:id/updates/:updateId', auth, perm('update'), uploadWithOptionalImage, editUpdate);
router.delete('/:id/updates/:updateId', auth, perm('delete'), deleteUpdate);

// Key Features
router.post('/:id/key-features', auth, perm('create'), addKeyFeature);
router.put('/:id/key-features/:featureId', auth, perm('update'), editKeyFeature);
router.delete('/:id/key-features/:featureId', auth, perm('delete'), deleteKeyFeature);

// Recommendations
router.post('/:id/recommendations', auth, perm('create'), addRecommendation);
router.put('/:id/recommendations/:recId', auth, perm('update'), editRecommendation);
router.delete('/:id/recommendations/:recId', auth, perm('delete'), deleteRecommendation);

// Pros & Cons
router.post('/:id/items', auth, perm('create'), addProCon);
router.put('/:id/items/:itemId', auth, perm('update'), editProCon);
router.delete('/:id/items/:itemId', auth, perm('delete'), deleteProCon);

export default router;

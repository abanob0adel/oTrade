import express from 'express';
import optionalAuthenticate, { authenticate } from '../../middlewares/rbac.middleware.js';
import { checkPermission } from '../../middlewares/rbac.middleware.js';
import { detectLanguage } from '../../middlewares/lang.middleware.js';
import { requirePlan } from '../../middlewares/subscription.middleware.js';
import { pagination } from '../../middlewares/pagination.middleware.js';
import upload, { uploadWithOptionalImage, uploadAny } from '../../middlewares/upload.middleware.js';
import { createCourse, updateCourse, deleteCourse, getAllCourses, getCourseById, getFreeCourses, getPaidCourses } from './courses.controller.js';
import { addLesson, getLessons, getLessonById, updateLesson, deleteLesson } from './lessons.controller.js';

const router = express.Router();

// Public routes with language detection
router.get('/', pagination(), detectLanguage, getAllCourses);//done           
router.get('/free', pagination(), detectLanguage, getFreeCourses);
router.get('/paid', pagination(), detectLanguage, getPaidCourses);
router.get('/:id',optionalAuthenticate, detectLanguage, getCourseById);

// Authenticated routes with subscription plan requirements

// Admin routes
router.post('/addcourse', authenticate(['admin', 'super_admin']), checkPermission('courses', 'create'), uploadWithOptionalImage, createCourse); //done
router.put('/updatecourse/:id', authenticate(['admin', 'super_admin']), checkPermission('courses', 'update'), uploadWithOptionalImage, updateCourse);//done
router.delete('/deletecourse/:id', authenticate(['admin', 'super_admin']), checkPermission('courses', 'delete'), deleteCourse);//done
router.get('/admin/allcourses', pagination(), authenticate(['admin', 'super_admin']), checkPermission('courses', 'view'), getAllCourses);//done

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Lessons Routes
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Admin - Manage lessons (with multipart/form-data support)
router.post('/:courseId/lessons', authenticate(['admin', 'super_admin']), checkPermission('courses', 'create'), uploadAny, addLesson);
router.put('/:courseId/lessons/:lessonId', authenticate(['admin', 'super_admin']), checkPermission('courses', 'update'), uploadAny, updateLesson);
router.delete('/:courseId/lessons/:lessonId', authenticate(['admin', 'super_admin']), checkPermission('courses', 'delete'), deleteLesson);

// Public/Authenticated - View lessons
router.get('/:courseId/lessons', optionalAuthenticate, getLessons);
router.get('/:courseId/lessons/:lessonId', optionalAuthenticate, getLessonById);

export default router;    
import Course from './course.model.js';
import Translation from '../translations/translation.model.js';
import { createOrUpdateTranslation, getTranslationsByEntity } from '../translations/translation.service.js';
import mongoose from 'mongoose';

/**
 * Add lesson to course
 * POST /courses/:courseId/lessons
 */
export const addLesson = async (req, res) => {
  try {
    const { courseId } = req.params;

    console.log('\n===== ADD LESSON DEBUG =====');
    console.log('Course ID:', courseId);
    console.log('req.body:', req.body);
    console.log('req.body type:', typeof req.body);
    console.log('req.body keys:', Object.keys(req.body));
    console.log('Content-Type:', req.get('Content-Type'));
    console.log('req.headers:', req.headers);
    console.log('\n--- Checking individual fields ---');
    console.log('req.body.title:', req.body.title);
    console.log('req.body.title_en:', req.body.title_en);
    console.log('req.body.title_ar:', req.body.title_ar);
    console.log('req.body["title[en]"]:', req.body['title[en]']);
    console.log('req.body["title[ar]"]:', req.body['title[ar]']);
    console.log('============================\n');

    // Validate courseId
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid course ID'
      });
    }

    // Parse title, description, content (support both JSON and FormData)
    let title = {};
    let description = {};
    let content = {};

    console.log('--- Parsing title ---');
    
    // Check if title is JSON string or object
    if (typeof req.body.title === 'string') {
      console.log('title is string, trying to parse as JSON...');
      try {
        title = JSON.parse(req.body.title);
        console.log('Parsed title from JSON:', title);
      } catch (e) {
        // If not JSON, treat as plain text (assume English)
        console.log('Not JSON, treating as plain English text');
        title = { en: req.body.title };
      }
    } else if (typeof req.body.title === 'object') {
      console.log('title is object:', req.body.title);
      title = req.body.title;
    } else {
      console.log('title is neither string nor object, type:', typeof req.body.title);
    }

    // Support individual fields (title_en, title_ar, title[en], title[ar])
    console.log('Checking individual title fields...');
    if (req.body.title_en) {
      console.log('Found title_en:', req.body.title_en);
      title.en = req.body.title_en;
    }
    if (req.body.title_ar) {
      console.log('Found title_ar:', req.body.title_ar);
      title.ar = req.body.title_ar;
    }
    if (req.body['title[en]']) {
      console.log('Found title[en]:', req.body['title[en]']);
      title.en = req.body['title[en]'];
    }
    if (req.body['title[ar]']) {
      console.log('Found title[ar]:', req.body['title[ar]']);
      title.ar = req.body['title[ar]'];
    }

    console.log('Final title object:', title);

    // Same for description
    if (typeof req.body.description === 'string') {
      try {
        description = JSON.parse(req.body.description);
      } catch (e) {
        description = { en: req.body.description };
      }
    } else if (typeof req.body.description === 'object') {
      description = req.body.description;
    }
    if (req.body.description_en) description.en = req.body.description_en;
    if (req.body.description_ar) description.ar = req.body.description_ar;
    if (req.body['description[en]']) description.en = req.body['description[en]'];
    if (req.body['description[ar]']) description.ar = req.body['description[ar]'];

    // Same for content
    if (typeof req.body.content === 'string') {
      try {
        content = JSON.parse(req.body.content);
      } catch (e) {
        content = { en: req.body.content };
      }
    } else if (typeof req.body.content === 'object') {
      content = req.body.content;
    }
    if (req.body.content_en) content.en = req.body.content_en;
    if (req.body.content_ar) content.ar = req.body.content_ar;
    if (req.body['content[en]']) content.en = req.body['content[en]'];
    if (req.body['content[ar]']) content.ar = req.body['content[ar]'];

    console.log('Final parsed data:');
    console.log('- title:', title);
    console.log('- description:', description);
    console.log('- content:', content);

    // Validate required fields (title in at least one language)
    if (!title.en && !title.ar) {
      console.log('❌ Validation failed: No title in any language');
      return res.status(400).json({
        success: false,
        error: 'Lesson title is required in at least one language (en or ar)'
      });
    }

    console.log('✅ Validation passed, proceeding...');

    // Find course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Get other fields
    const videoUrl = req.body.videoUrl || null;
    const order = req.body.order ? parseInt(req.body.order) : (course.lessons.length + 1);

    // Create new lesson (without title - stored in translations)
    const newLesson = {
      videoUrl,
      order,
      createdAt: new Date()
    };

    // Add lesson to course
    course.lessons.push(newLesson);
    await course.save();

    // Get the added lesson (last one)
    const addedLesson = course.lessons[course.lessons.length - 1];
    const lessonId = addedLesson._id;

    // Save translations
    if (title.en || description.en || content.en) {
      await createOrUpdateTranslation(
        'lesson',
        lessonId,
        'en',
        title.en || '',
        description.en || '',
        content.en || ''
      );
    }

    if (title.ar || description.ar || content.ar) {
      await createOrUpdateTranslation(
        'lesson',
        lessonId,
        'ar',
        title.ar || '',
        description.ar || '',
        content.ar || ''
      );
    }

    // Get translations for response
    const translations = await getTranslationsByEntity('lesson', lessonId);
    const translationsObject = {};
    translations.forEach(t => {
      translationsObject[t.language] = {
        title: t.title,
        description: t.description,
        content: t.content
      };
    });

    res.status(201).json({
      success: true,
      message: 'Lesson added successfully',
      lesson: {
        id: lessonId,
        translations: translationsObject,
        videoUrl: addedLesson.videoUrl,
        order: addedLesson.order,
        createdAt: addedLesson.createdAt
      }
    });

  } catch (error) {
    console.error('ADD LESSON ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Get all lessons for a course
 * GET /courses/:courseId/lessons
 */
export const getLessons = async (req, res) => {
  try {
    const { courseId } = req.params;

    console.log('\n===== GET LESSONS DEBUG =====');
    console.log('Course ID:', courseId);
    console.log('Accept-Language:', req.get('Accept-Language'));
    console.log('=============================\n');

    // Get requested language
    const requestedLang = req.get('Accept-Language') || 'en';

    // Validate courseId
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid course ID'
      });
    }

    // Find course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Sort lessons by order
    const sortedLessons = course.lessons.sort((a, b) => a.order - b.order);

    // Get translations for each lesson
    const lessonsWithTranslations = await Promise.all(
      sortedLessons.map(async (lesson) => {
        const translations = await getTranslationsByEntity('lesson', lesson._id);
        
        // Get translation for requested language
        const translation = translations.find(t => t.language === requestedLang) ||
                           translations.find(t => t.language === 'en') ||
                           translations[0];

        return {
          id: lesson._id,
          title: translation?.title || '',
          description: translation?.description || '',
          content: translation?.content || '',
          videoUrl: lesson.videoUrl,
          order: lesson.order,
          createdAt: lesson.createdAt
        };
      })
    );

    res.status(200).json({
      success: true,
      count: lessonsWithTranslations.length,
      lessons: lessonsWithTranslations
    });

  } catch (error) {
    console.error('GET LESSONS ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Get single lesson by ID
 * GET /courses/:courseId/lessons/:lessonId
 */
export const getLessonById = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;

    // Get requested language
    const requestedLang = req.get('Accept-Language') || 'en';

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid course ID'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid lesson ID'
      });
    }

    // Find course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Find lesson
    const lesson = course.lessons.id(lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: 'Lesson not found'
      });
    }

    // Get translations
    const translations = await getTranslationsByEntity('lesson', lessonId);
    const translation = translations.find(t => t.language === requestedLang) ||
                       translations.find(t => t.language === 'en') ||
                       translations[0];

    res.status(200).json({
      success: true,
      lesson: {
        id: lesson._id,
        title: translation?.title || '',
        description: translation?.description || '',
        content: translation?.content || '',
        videoUrl: lesson.videoUrl,
        order: lesson.order,
        createdAt: lesson.createdAt
      }
    });

  } catch (error) {
    console.error('GET LESSON BY ID ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Update lesson
 * PUT /courses/:courseId/lessons/:lessonId
 */
export const updateLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const { title, description, content, videoUrl, order } = req.body;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid course ID'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid lesson ID'
      });
    }

    // Find course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Find lesson
    const lesson = course.lessons.id(lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: 'Lesson not found'
      });
    }

    // Update lesson fields
    if (videoUrl !== undefined) lesson.videoUrl = videoUrl;
    if (order !== undefined) lesson.order = order;

    await course.save();

    // Update translations
    if (title || description || content) {
      if (title?.en || description?.en || content?.en) {
        await createOrUpdateTranslation(
          'lesson',
          lessonId,
          'en',
          title?.en || undefined,
          description?.en || undefined,
          content?.en || undefined
        );
      }

      if (title?.ar || description?.ar || content?.ar) {
        await createOrUpdateTranslation(
          'lesson',
          lessonId,
          'ar',
          title?.ar || undefined,
          description?.ar || undefined,
          content?.ar || undefined
        );
      }
    }

    // Get updated translations
    const translations = await getTranslationsByEntity('lesson', lessonId);
    const translationsObject = {};
    translations.forEach(t => {
      translationsObject[t.language] = {
        title: t.title,
        description: t.description,
        content: t.content
      };
    });

    res.status(200).json({
      success: true,
      message: 'Lesson updated successfully',
      lesson: {
        id: lesson._id,
        translations: translationsObject,
        videoUrl: lesson.videoUrl,
        order: lesson.order,
        createdAt: lesson.createdAt
      }
    });

  } catch (error) {
    console.error('UPDATE LESSON ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Delete lesson
 * DELETE /courses/:courseId/lessons/:lessonId
 */
export const deleteLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid course ID'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid lesson ID'
      });
    }

    // Find course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Find and remove lesson
    const lesson = course.lessons.id(lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: 'Lesson not found'
      });
    }

    // Delete translations
    await Translation.deleteMany({
      entityType: 'lesson',
      entityId: lessonId
    });

    // Remove lesson from course
    lesson.deleteOne();
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Lesson deleted successfully'
    });

  } catch (error) {
    console.error('DELETE LESSON ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

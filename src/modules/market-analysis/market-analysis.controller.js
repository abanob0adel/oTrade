import MarketAnalysis from './market-analysis.model.js';
import Category from './category.model.js';
import { createOrUpdateTranslation, getTranslationsByEntity, deleteTranslationsByEntity } from '../translations/translation.service.js';
import bunnycdn from '../../utils/bunnycdn.js';
import mongoose from 'mongoose';

/**
 * Get all market analyses by category
 * GET /api/market-analysis/:category
 */
export const getAnalysesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const requestedLang = req.get('Accept-Language') || 'en';
    const requestMultipleLangs = requestedLang.includes('|');

    // Check if category exists (by slug or ID)
    let categoryDoc;
    if (mongoose.Types.ObjectId.isValid(category)) {
      categoryDoc = await Category.findOne({ _id: category, isActive: true });
    } else {
      categoryDoc = await Category.findOne({ slug: category, isActive: true });
    }
    
    if (!categoryDoc) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Get pagination info if available
    const skip = req.pagination?.skip || 0;
    const limit = req.pagination?.limit || 0;

    // Get total count
    const total = await MarketAnalysis.countDocuments({ 
      category: categoryDoc._id, 
      isActive: true 
    });

    // Get paginated analyses
    let query = MarketAnalysis.find({ category: categoryDoc._id, isActive: true })
      .sort({ updatedAt: -1 });

    // Apply pagination if middleware is used
    if (limit > 0) {
      query = query.skip(skip).limit(limit);
    }

    const analyses = await query;

    // Get translations for all analyses
    const analysesWithTranslations = await Promise.all(
      analyses.map(async (analysis) => {
        const translations = await getTranslationsByEntity('market-analysis', analysis._id);

        if (requestMultipleLangs) {
          const translationsObject = {};
          translations.forEach(t => {
            translationsObject[t.language] = {
              title: t.title,
              description: t.description,
              content: t.content
            };
          });

          return {
            id: analysis._id,
            categoryId: analysis.category,
            slug: analysis.slug,
            coverImage: analysis.coverImage,
            image: analysis.image,
            translations: translationsObject,
            updatedAt: analysis.updatedAt
          };
        }

        // Single language
        const translation = translations.find(t => t.language === requestedLang) ||
                           translations.find(t => t.language === 'en') ||
                           translations[0];

        return {
          id: analysis._id,
          categoryId: analysis.category,
          slug: analysis.slug,
          title: translation?.title || '',
          description: translation?.description || '',
          content: translation?.content || '',
          coverImage: analysis.coverImage,
          image: analysis.image,
          updatedAt: analysis.updatedAt
        };
      })
    );

    // Send response with or without pagination
    if (req.paginatedResponse) {
      res.status(200).json(req.paginatedResponse(analysesWithTranslations, total));
    } else {
      res.status(200).json({
        success: true,
        data: analysesWithTranslations
      });
    }
  } catch (error) {
    console.error('Get Analyses Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get market analyses'
    });
  }
};

/**
 * Get single market analysis by slug
 * GET /api/market-analysis/:category/:slug
 * GET /api/market-analysis/single/:slug
 */
export const getAnalysisBySlug = async (req, res) => {
  try {
    const { category, slug } = req.params;
    const requestedLang = req.get('Accept-Language') || 'en';
    const requestMultipleLangs = requestedLang.includes('|');

    let analysis;

    // If category is provided, search within that category
    if (category && category !== 'single') {
      // Check if category exists (by slug or ID)
      let categoryDoc;
      if (mongoose.Types.ObjectId.isValid(category)) {
        categoryDoc = await Category.findOne({ _id: category, isActive: true });
      } else {
        categoryDoc = await Category.findOne({ slug: category, isActive: true });
      }
      
      if (!categoryDoc) {
        return res.status(404).json({
          success: false,
          error: 'Category not found'
        });
      }

      // Find analysis in specific category
      analysis = await MarketAnalysis.findOne({ category: categoryDoc._id, slug, isActive: true });
    } else {
      // No category provided (from /single/:slug), search all categories
      analysis = await MarketAnalysis.findOne({ slug, isActive: true });
    }

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Market analysis not found'
      });
    }

    // Get translations
    const translations = await getTranslationsByEntity('market-analysis', analysis._id);

    if (requestMultipleLangs) {
      const translationsObject = {};
      translations.forEach(t => {
        translationsObject[t.language] = {
          title: t.title,
          description: t.description,
          content: t.content
        };
      });

      return res.status(200).json({
        success: true,
        data: {
          id: analysis._id,
          categoryId: analysis.category,
          slug: analysis.slug,
          coverImage: analysis.coverImage,
          image: analysis.image,
          updates: analysis.updates || [],
          translations: translationsObject,
          updatedAt: analysis.updatedAt,
          createdAt: analysis.createdAt
        }
      });
    }

    // Single language
    const translation = translations.find(t => t.language === requestedLang) ||
                       translations.find(t => t.language === 'en') ||
                       translations[0];

    res.status(200).json({
      success: true,
      data: {
        id: analysis._id,
        categoryId: analysis.category,
        slug: analysis.slug,
        title: translation?.title || '',
        description: translation?.description || '',
        content: translation?.content || '',
        coverImage: analysis.coverImage,
        image: analysis.image,
        updates: analysis.updates || [],
        updatedAt: analysis.updatedAt,
        createdAt: analysis.createdAt
      }
    });
  } catch (error) {
    console.error('Get Analysis Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get market analysis'
    });
  }
};

/**
 * Create market analysis
 * POST /api/market-analysis
 * Admin only
 */
export const createAnalysis = async (req, res) => {
  try {
    console.log('\n===== CREATE MARKET ANALYSIS DEBUG =====');
    console.log('Body:', req.body);
    console.log('Files:', req.files);
    console.log('========================================\n');

    const { categoryId } = req.body;

    // Validate category ID
    if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        error: 'Valid category ID is required'
      });
    }

    // Check if category exists
    const categoryDoc = await Category.findOne({ _id: categoryId, isActive: true });
    if (!categoryDoc) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category. Category does not exist or is not active.'
      });
    }

    // Parse translations
    let title = {};
    let description = {};
    let content = {};

    // Parse title
    if (typeof req.body.title === 'string') {
      try {
        title = JSON.parse(req.body.title);
      } catch (e) {
        title = { en: req.body.title };
      }
    } else if (typeof req.body.title === 'object') {
      title = req.body.title;
    }
    if (req.body.title_en) title.en = req.body.title_en;
    if (req.body.title_ar) title.ar = req.body.title_ar;
    if (req.body['title[en]']) title.en = req.body['title[en]'];
    if (req.body['title[ar]']) title.ar = req.body['title[ar]'];

    // Parse description
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

    // Parse content
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

    // Validate required fields
    if (!title.en && !title.ar) {
      return res.status(400).json({
        success: false,
        error: 'Title is required in at least one language'
      });
    }

    // Upload images
    if (!req.files?.coverImage || !req.files?.image) {
      return res.status(400).json({
        success: false,
        error: 'Both coverImage and image are required'
      });
    }

    const coverImageFile = req.files.coverImage[0];
    const imageFile = req.files.image[0];

    console.log('Uploading images to BunnyCDN...');
    const coverImageUrl = await bunnycdn.uploadImage(coverImageFile.buffer, coverImageFile.originalname, `market-analysis/${categoryDoc.slug}`);
    const imageUrl = await bunnycdn.uploadImage(imageFile.buffer, imageFile.originalname, `market-analysis/${categoryDoc.slug}`);
    console.log('Images uploaded:', { coverImageUrl, imageUrl });

    // Generate slug
    const baseSlug = (title.en || title.ar || 'analysis')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    
    let slug = baseSlug;
    let counter = 1;
    while (await MarketAnalysis.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create analysis
    const analysis = await MarketAnalysis.create({
      category: categoryDoc._id,
      slug,
      coverImage: coverImageUrl,
      image: imageUrl
    });

    // Save translations
    if (title.en || description.en || content.en) {
      await createOrUpdateTranslation(
        'market-analysis',
        analysis._id,
        'en',
        title.en || '',
        description.en || '',
        content.en || ''
      );
    }

    if (title.ar || description.ar || content.ar) {
      await createOrUpdateTranslation(
        'market-analysis',
        analysis._id,
        'ar',
        title.ar || '',
        description.ar || '',
        content.ar || ''
      );
    }

    // Get translations for response
    const translations = await getTranslationsByEntity('market-analysis', analysis._id);
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
      message: 'Market analysis created successfully',
      data: {
        id: analysis._id,
        categoryId: analysis.category,
        slug: analysis.slug,
        coverImage: analysis.coverImage,
        image: analysis.image,
        updates: [],
        translations: translationsObject,
        updatedAt: analysis.updatedAt,
        createdAt: analysis.createdAt
      }
    });
  } catch (error) {
    console.error('Create Analysis Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create market analysis'
    });
  }
};

/**
 * Update market analysis
 * PUT /api/market-analysis/:id
 * Admin only
 */
export const updateAnalysis = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('\n===== UPDATE MARKET ANALYSIS DEBUG =====');
    console.log('ID:', id);
    console.log('Body:', req.body);
    console.log('Files:', req.files);
    console.log('========================================\n');

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid analysis ID'
      });
    }

    const analysis = await MarketAnalysis.findById(id);
    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Market analysis not found'
      });
    }

    // Parse translations
    let title = {};
    let description = {};
    let content = {};

    // Parse title
    if (typeof req.body.title === 'string') {
      try {
        title = JSON.parse(req.body.title);
      } catch (e) {
        title = { en: req.body.title };
      }
    } else if (typeof req.body.title === 'object') {
      title = req.body.title;
    }
    if (req.body.title_en) title.en = req.body.title_en;
    if (req.body.title_ar) title.ar = req.body.title_ar;
    if (req.body['title[en]']) title.en = req.body['title[en]'];
    if (req.body['title[ar]']) title.ar = req.body['title[ar]'];

    // Parse description
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

    // Parse content
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

    // Get category for folder path
    const categoryDoc = await Category.findById(analysis.category);
    const categorySlug = categoryDoc?.slug || 'uncategorized';

    // Upload new images if provided
    if (req.files?.coverImage) {
      const coverImageFile = req.files.coverImage[0];
      console.log('Uploading new cover image...');
      analysis.coverImage = await bunnycdn.uploadImage(coverImageFile.buffer, coverImageFile.originalname, `market-analysis/${categorySlug}`);
    }

    if (req.files?.image) {
      const imageFile = req.files.image[0];
      console.log('Uploading new image...');
      analysis.image = await bunnycdn.uploadImage(imageFile.buffer, imageFile.originalname, `market-analysis/${categorySlug}`);
    }

    // Update analysis
    analysis.updatedAt = new Date();
    await analysis.save();

    // Update translations
    if (title.en || description.en || content.en) {
      await createOrUpdateTranslation(
        'market-analysis',
        analysis._id,
        'en',
        title.en || '',
        description.en || '',
        content.en || ''
      );
    }

    if (title.ar || description.ar || content.ar) {
      await createOrUpdateTranslation(
        'market-analysis',
        analysis._id,
        'ar',
        title.ar || '',
        description.ar || '',
        content.ar || ''
      );
    }

    // Get translations for response
    const translations = await getTranslationsByEntity('market-analysis', analysis._id);
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
      message: 'Market analysis updated successfully',
      data: {
        id: analysis._id,
        categoryId: analysis.category,
        slug: analysis.slug,
        coverImage: analysis.coverImage,
        image: analysis.image,
        updates: analysis.updates || [],
        translations: translationsObject,
        updatedAt: analysis.updatedAt,
        createdAt: analysis.createdAt
      }
    });
  } catch (error) {
    console.error('Update Analysis Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update market analysis'
    });
  }
};

/**
 * Delete market analysis
 * DELETE /api/market-analysis/:id
 * Admin only
 */
export const deleteAnalysis = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid analysis ID'
      });
    }

    const analysis = await MarketAnalysis.findById(id);
    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Market analysis not found'
      });
    }

    // Delete translations
    await deleteTranslationsByEntity('market-analysis', analysis._id);

    // Delete analysis
    await MarketAnalysis.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Market analysis deleted successfully'
    });
  } catch (error) {
    console.error('Delete Analysis Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete market analysis'
    });
  }
};

/**
 * Add update to market analysis
 * POST /api/market-analysis/:id/updates
 * Admin only
 */
export const addAnalysisUpdate = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('\n===== ADD ANALYSIS UPDATE DEBUG =====');
    console.log('ID:', id);
    console.log('Files:', req.files);
    console.log('=====================================\n');

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid analysis ID'
      });
    }

    const analysis = await MarketAnalysis.findById(id);
    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Market analysis not found'
      });
    }

    // Validate update image
    if (!req.files?.updateImage) {
      return res.status(400).json({
        success: false,
        error: 'Update image is required'
      });
    }

    // Get category for folder path
    const categoryDoc = await Category.findById(analysis.category);
    const categorySlug = categoryDoc?.slug || 'uncategorized';

    // Upload update image
    const updateImageFile = req.files.updateImage[0];
    console.log('Uploading update image...');
    const updateImageUrl = await bunnycdn.uploadImage(
      updateImageFile.buffer, 
      updateImageFile.originalname, 
      `market-analysis/${categorySlug}/updates`
    );
    console.log('Update image uploaded:', updateImageUrl);

    // Add update entry
    analysis.updates.push({
      image: updateImageUrl,
      updatedAt: new Date()
    });

    // Update the main updatedAt timestamp
    analysis.updatedAt = new Date();
    await analysis.save();

    console.log('Added new update entry');

    res.status(201).json({
      success: true,
      message: 'Update added successfully',
      data: {
        id: analysis._id,
        updates: analysis.updates,
        updatedAt: analysis.updatedAt
      }
    });
  } catch (error) {
    console.error('Add Analysis Update Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add update to market analysis'
    });
  }
};

/**
 * Get single market analysis by ID
 * GET /api/market-analysis/single/:id
 */
export const getAnalysisById = async (req, res) => {
  try {
    const { id } = req.params;
    const requestedLang = req.get('Accept-Language') || 'en';
    const requestMultipleLangs = requestedLang.includes('|');

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid analysis ID'
      });
    }

    // Find analysis
    const analysis = await MarketAnalysis.findOne({ _id: id, isActive: true });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Market analysis not found'
      });
    }

    // Get translations
    const translations = await getTranslationsByEntity('market-analysis', analysis._id);

    if (requestMultipleLangs) {
      const translationsObject = {};
      translations.forEach(t => {
        translationsObject[t.language] = {
          title: t.title,
          description: t.description,
          content: t.content
        };
      });

      return res.status(200).json({
        success: true,
        data: {
          id: analysis._id,
          categoryId: analysis.category,
          slug: analysis.slug,
          coverImage: analysis.coverImage,
          image: analysis.image,
          updates: analysis.updates || [],
          translations: translationsObject,
          updatedAt: analysis.updatedAt,
          createdAt: analysis.createdAt
        }
      });
    }

    // Single language
    const translation = translations.find(t => t.language === requestedLang) ||
                       translations.find(t => t.language === 'en') ||
                       translations[0];

    res.status(200).json({
      success: true,
      data: {
        id: analysis._id,
        categoryId: analysis.category,
        slug: analysis.slug,
        title: translation?.title || '',
        description: translation?.description || '',
        content: translation?.content || '',
        coverImage: analysis.coverImage,
        image: analysis.image,
        updates: analysis.updates || [],
        updatedAt: analysis.updatedAt,
        createdAt: analysis.createdAt
      }
    });
  } catch (error) {
    console.error('Get Analysis By ID Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get market analysis'
    });
  }
};

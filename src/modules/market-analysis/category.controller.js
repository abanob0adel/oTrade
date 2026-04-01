import Category from './category.model.js';
import { createOrUpdateTranslation, getTranslationsByEntity, deleteTranslationsByEntity } from '../translations/translation.service.js';
import bunnycdn from '../../utils/bunnycdn.js';
import mongoose from 'mongoose';

/**
 * Get all categories
 * GET /api/market-analysis/categories
 */
export const getAllCategories = async (req, res) => {
  try {
    const requestedLang = req.get('Accept-Language') || 'en';
    const requestMultipleLangs = requestedLang.includes('|');

    // Get all active categories
    const categories = await Category.find({ isActive: true }).sort({ createdAt: 1 });

    // Get translations for all categories
    const categoriesWithTranslations = await Promise.all(
      categories.map(async (category) => {
        const translations = await getTranslationsByEntity('market-category', category._id);

        if (requestMultipleLangs) {
          const translationsObject = {};
          translations.forEach(t => {
            translationsObject[t.language] = {
              name: t.title,
              description: t.description
            };
          });

          return {
            id: category._id,
            slug: category.slug,
            coverImage: category.coverImage,
            translations: translationsObject
          };
        }

        // Single language
        const translation = translations.find(t => t.language === requestedLang) ||
                           translations.find(t => t.language === 'en') ||
                           translations[0];

        return {
          id: category._id,
          slug: category.slug,
          name: translation?.title || category.slug,
          description: translation?.description || '',
          coverImage: category.coverImage
        };
      })
    );

    res.status(200).json({
      success: true,
      data: categoriesWithTranslations
    });
  } catch (error) {
    console.error('Get Categories Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get categories'
    });
  }
};

/**
 * Create category
 * POST /api/market-analysis/categories
 * Admin only
 */
export const createCategory = async (req, res) => {
  try {
    console.log('\n===== CREATE CATEGORY DEBUG =====');
    console.log('Body:', req.body);
    console.log('Files:', req.files);
    console.log('=================================\n');

    // Parse translations
    let name = {};
    let description = {};

    // Parse name
    if (typeof req.body.name === 'string') {
      try {
        name = JSON.parse(req.body.name);
      } catch (e) {
        name = { en: req.body.name };
      }
    } else if (typeof req.body.name === 'object') {
      name = req.body.name;
    }
    if (req.body.name_en) name.en = req.body.name_en;
    if (req.body.name_ar) name.ar = req.body.name_ar;
    if (req.body['name[en]']) name.en = req.body['name[en]'];
    if (req.body['name[ar]']) name.ar = req.body['name[ar]'];

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

    // Validate required fields
    if (!name.en && !name.ar) {
      return res.status(400).json({
        success: false,
        error: 'Name is required in at least one language'
      });
    }

    // Validate coverImage
    const coverImageFile = req.files?.find(f => f.fieldname === 'coverImage');
    
    if (!coverImageFile) {
      return res.status(400).json({
        success: false,
        error: 'Cover image is required'
      });
    }

    // Generate slug from name
    const baseSlug = (name.en || name.ar || 'category')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    
    let slug = baseSlug;
    let counter = 1;
    while (await Category.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Upload cover image
    console.log('Uploading cover image to BunnyCDN...');
    const coverImageUrl = await bunnycdn.uploadImage(coverImageFile.buffer, coverImageFile.originalname, 'market-categories');
    console.log('Cover image uploaded:', coverImageUrl);

    // Create category
    const category = await Category.create({
      slug,
      coverImage: coverImageUrl
    });

    // Save translations
    if (name.en || description.en) {
      await createOrUpdateTranslation(
        'market-category',
        category._id,
        'en',
        name.en || '',
        description.en || '',
        ''
      );
    }

    if (name.ar || description.ar) {
      await createOrUpdateTranslation(
        'market-category',
        category._id,
        'ar',
        name.ar || '',
        description.ar || '',
        ''
      );
    }

    // Get translations for response
    const translations = await getTranslationsByEntity('market-category', category._id);
    const translationsObject = {};
    translations.forEach(t => {
      translationsObject[t.language] = {
        name: t.title,
        description: t.description
      };
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: {
        id: category._id,
        slug: category.slug,
        coverImage: category.coverImage,
        translations: translationsObject
      }
    });
  } catch (error) {
    console.error('Create Category Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create category'
    });
  }
};

/**
 * Update category
 * PUT /api/market-analysis/categories/:id
 * Admin only
 */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('\n===== UPDATE CATEGORY DEBUG =====');
    console.log('ID:', id);
    console.log('Body:', req.body);
    console.log('=================================\n');

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category ID'
      });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Update basic fields
    if (req.body.isActive !== undefined) category.isActive = req.body.isActive;

    // Upload new cover image if provided
    const coverImageFile = req.files?.find(f => f.fieldname === 'coverImage');
    
    if (coverImageFile) {
      console.log('Uploading new cover image...');
      category.coverImage = await bunnycdn.uploadImage(coverImageFile.buffer, coverImageFile.originalname, 'market-categories');
      console.log('Cover image uploaded:', category.coverImage);
    }

    // Parse translations
    let name = {};
    let description = {};

    // Parse name
    if (typeof req.body.name === 'string') {
      try {
        name = JSON.parse(req.body.name);
      } catch (e) {
        name = { en: req.body.name };
      }
    } else if (typeof req.body.name === 'object') {
      name = req.body.name;
    }
    if (req.body.name_en) name.en = req.body.name_en;
    if (req.body.name_ar) name.ar = req.body.name_ar;
    if (req.body['name[en]']) name.en = req.body['name[en]'];
    if (req.body['name[ar]']) name.ar = req.body['name[ar]'];

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

    // Update category
    category.updatedAt = new Date();
    await category.save();

    // Update translations
    if (name.en || description.en) {
      await createOrUpdateTranslation(
        'market-category',
        category._id,
        'en',
        name.en || '',
        description.en || '',
        ''
      );
    }

    if (name.ar || description.ar) {
      await createOrUpdateTranslation(
        'market-category',
        category._id,
        'ar',
        name.ar || '',
        description.ar || '',
        ''
      );
    }

    // Get translations for response
    const translations = await getTranslationsByEntity('market-category', category._id);
    const translationsObject = {};
    translations.forEach(t => {
      translationsObject[t.language] = {
        name: t.title,
        description: t.description
      };
    });

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: {
        id: category._id,
        slug: category.slug,
        coverImage: category.coverImage,
        isActive: category.isActive,
        translations: translationsObject
      }
    });
  } catch (error) {
    console.error('Update Category Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update category'
    });
  }
};

/**
 * Delete category
 * DELETE /api/market-analysis/categories/:id
 * Admin only
 */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category ID'
      });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Delete translations
    await deleteTranslationsByEntity('market-category', category._id);

    // Delete category
    await Category.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete Category Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete category'
    });
  }
};

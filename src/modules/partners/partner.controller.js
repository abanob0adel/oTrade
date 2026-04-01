import Partner from './partner.model.js';
import bunnycdn from '../../utils/bunnycdn.js';
import mongoose from 'mongoose';
import { createOrUpdateTranslation, getTranslationsByEntity, deleteTranslationsByEntity } from '../translations/translation.service.js';

/**
 * Create Partner
 * POST /api/partners
 * Admin only
 */
export const createPartner = async (req, res) => {
  try {
    console.log('\n===== CREATE PARTNER DEBUG =====');
    console.log('Body:', req.body);
    console.log('Files:', req.files);
    console.log('================================\n');

    const { category, websiteUrl, order } = req.body;

    // Validate category
    if (!category || !['people', 'company'].includes(category)) {
      return res.status(400).json({
        success: false,
        error: 'Valid category is required (people or company)'
      });
    }

    // Parse title and description translations
    let title = {};
    let description = {};

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

    // Validate required fields
    if (!title.en && !title.ar) {
      return res.status(400).json({
        success: false,
        error: 'Title is required in at least one language'
      });
    }

    if (!description.en && !description.ar) {
      return res.status(400).json({
        success: false,
        error: 'Description is required in at least one language'
      });
    }

    // Validate image
    if (!req.files?.image) {
      return res.status(400).json({
        success: false,
        error: 'Image is required'
      });
    }

    // Upload image
    const imageFile = req.files.image[0];
    const imageUrl = await bunnycdn.uploadImage(imageFile.buffer, imageFile.originalname, `partners/${category}`);

    // Parse links
    let links = [];
    if (req.body.links) {
      try {
        links = typeof req.body.links === 'string' ? JSON.parse(req.body.links) : req.body.links;
        if (!Array.isArray(links)) links = [];
      } catch (e) {
        links = [];
      }
    }

    // Create partner
    const partner = await Partner.create({
      category,
      image: imageUrl,
      websiteUrl: websiteUrl?.trim() || '',
      links: links,
      order: order || 0
    });

    // Save translations (title and description)
    if (title.en || description.en) {
      await createOrUpdateTranslation(
        'partner',
        partner._id,
        'en',
        title.en || '',
        description.en || '',
        ''
      );
    }

    if (title.ar || description.ar) {
      await createOrUpdateTranslation(
        'partner',
        partner._id,
        'ar',
        title.ar || '',
        description.ar || '',
        ''
      );
    }

    // Get translations for response
    const translations = await getTranslationsByEntity('partner', partner._id);
    const translationsObject = {};
    translations.forEach(t => {
      translationsObject[t.language] = {
        title: t.title,
        description: t.description
      };
    });

    res.status(201).json({
      success: true,
      message: 'Partner created successfully',
      data: {
        id: partner._id,
        category: partner.category,
        image: partner.image,
        websiteUrl: partner.websiteUrl,
        links: partner.links,
        order: partner.order,
        translations: translationsObject,
        isActive: partner.isActive,
        createdAt: partner.createdAt,
        updatedAt: partner.updatedAt
      }
    });
  } catch (error) {
    console.error('Create Partner Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create partner'
    });
  }
};

/**
 * Get All Partners
 * GET /api/partners
 * Public
 */
export const getAllPartners = async (req, res) => {
  try {
    const { category } = req.query;
    const requestedLang = req.get('Accept-Language') || 'en';
    const requestMultipleLangs = requestedLang.includes('|');

    const filter = { isActive: true };
    if (category && ['people', 'company'].includes(category)) {
      filter.category = category;
    }

    const partners = await Partner.find(filter).sort({ order: 1, createdAt: 1 });

    const partnersWithTranslations = await Promise.all(
      partners.map(async (partner) => {
        const translations = await getTranslationsByEntity('partner', partner._id);

        if (requestMultipleLangs) {
          const translationsObject = {};
          translations.forEach(t => {
            translationsObject[t.language] = {
              title: t.title,
              description: t.description
            };
          });

          return {
            id: partner._id,
            category: partner.category,
            image: partner.image,
            websiteUrl: partner.websiteUrl,
            links: partner.links,
            order: partner.order,
            translations: translationsObject
          };
        }

        // Single language
        const translation = translations.find(t => t.language === requestedLang) ||
                           translations.find(t => t.language === 'en') ||
                           translations[0];

        return {
          id: partner._id,
          category: partner.category,
          title: translation?.title || '',
          description: translation?.description || '',
          image: partner.image,
          websiteUrl: partner.websiteUrl,
          links: partner.links,
          order: partner.order
        };
      })
    );

    res.status(200).json({
      success: true,
      data: partnersWithTranslations
    });
  } catch (error) {
    console.error('Get Partners Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get partners'
    });
  }
};

/**
 * Get Partner by ID
 * GET /api/partners/:id
 * Public
 */
export const getPartnerById = async (req, res) => {
  try {
    const { id } = req.params;
    const requestedLang = req.get('Accept-Language') || 'en';
    const requestMultipleLangs = requestedLang.includes('|');

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid partner ID'
      });
    }

    const partner = await Partner.findOne({ _id: id, isActive: true });

    if (!partner) {
      return res.status(404).json({
        success: false,
        error: 'Partner not found'
      });
    }

    // Get translations
    const translations = await getTranslationsByEntity('partner', partner._id);

    if (requestMultipleLangs) {
      const translationsObject = {};
      translations.forEach(t => {
        translationsObject[t.language] = {
          title: t.title,
          description: t.description
        };
      });

      return res.status(200).json({
        success: true,
        data: {
          id: partner._id,
          category: partner.category,
          image: partner.image,
          websiteUrl: partner.websiteUrl,
          links: partner.links,
          order: partner.order,
          translations: translationsObject,
          createdAt: partner.createdAt,
          updatedAt: partner.updatedAt
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
        id: partner._id,
        category: partner.category,
        title: translation?.title || '',
        description: translation?.description || '',
        image: partner.image,
        websiteUrl: partner.websiteUrl,
        links: partner.links,
        order: partner.order,
        createdAt: partner.createdAt,
        updatedAt: partner.updatedAt
      }
    });
  } catch (error) {
    console.error('Get Partner Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get partner'
    });
  }
};

/**
 * Update Partner
 * PUT /api/partners/:id
 * Admin only
 */
export const updatePartner = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('\n===== UPDATE PARTNER DEBUG =====');
    console.log('ID:', id);
    console.log('Body:', req.body);
    console.log('Files:', req.files);
    console.log('================================\n');

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid partner ID'
      });
    }

    const partner = await Partner.findById(id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        error: 'Partner not found'
      });
    }

    // Parse title and description translations
    let title = {};
    let description = {};

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

    // Update translations
    if (title.en || description.en) {
      await createOrUpdateTranslation(
        'partner',
        partner._id,
        'en',
        title.en || '',
        description.en || '',
        ''
      );
    }

    if (title.ar || description.ar) {
      await createOrUpdateTranslation(
        'partner',
        partner._id,
        'ar',
        title.ar || '',
        description.ar || '',
        ''
      );
    }

    // Update other fields
    if (req.body.category && ['people', 'company'].includes(req.body.category)) {
      partner.category = req.body.category;
    }
    if (req.body.websiteUrl !== undefined) partner.websiteUrl = req.body.websiteUrl.trim();
    if (req.body.order !== undefined) partner.order = req.body.order;

    // Parse and update links
    if (req.body.links !== undefined) {
      try {
        const links = typeof req.body.links === 'string' ? JSON.parse(req.body.links) : req.body.links;
        partner.links = Array.isArray(links) ? links : [];
      } catch (e) {
        partner.links = [];
      }
    }

    // Upload new image if provided
    if (req.files?.image) {
      const imageFile = req.files.image[0];
      partner.image = await bunnycdn.uploadImage(imageFile.buffer, imageFile.originalname, `partners/${partner.category}`);
    }

    if (req.body.isActive !== undefined) {
      partner.isActive = req.body.isActive;
    }

    partner.updatedAt = new Date();
    await partner.save();

    // Get translations for response
    const translations = await getTranslationsByEntity('partner', partner._id);
    const translationsObject = {};
    translations.forEach(t => {
      translationsObject[t.language] = {
        title: t.title,
        description: t.description
      };
    });

    res.status(200).json({
      success: true,
      message: 'Partner updated successfully',
      data: {
        id: partner._id,
        category: partner.category,
        image: partner.image,
        websiteUrl: partner.websiteUrl,
        links: partner.links,
        order: partner.order,
        translations: translationsObject,
        isActive: partner.isActive,
        createdAt: partner.createdAt,
        updatedAt: partner.updatedAt
      }
    });
  } catch (error) {
    console.error('Update Partner Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update partner'
    });
  }
};

/**
 * Delete Partner
 * DELETE /api/partners/:id
 * Admin only
 */
export const deletePartner = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid partner ID'
      });
    }

    const partner = await Partner.findById(id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        error: 'Partner not found'
      });
    }

    // Delete translations
    await deleteTranslationsByEntity('partner', partner._id);

    // Delete partner
    await Partner.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Partner deleted successfully'
    });
  } catch (error) {
    console.error('Delete Partner Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete partner'
    });
  }
};

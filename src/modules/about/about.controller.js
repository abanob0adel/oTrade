import About from './about.model.js';
import bunnycdn from '../../utils/bunnycdn.js';
import mongoose from 'mongoose';
import { createOrUpdateTranslation, getTranslationsByEntity, deleteTranslationsByEntity } from '../translations/translation.service.js';

/**
 * Create about item
 * POST /api/about
 * Admin only
 */
export const createAboutItem = async (req, res) => {
  try {
    const { key } = req.body;

    if (!key || !['vision', 'team'].includes(key)) {
      return res.status(400).json({
        success: false,
        error: 'Valid key is required (vision or team)'
      });
    }

    let itemData = { key };

    if (key === 'vision') {
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

      // Create vision item
      const aboutItem = await About.create(itemData);

      // Save translations
      if (title.en || description.en) {
        await createOrUpdateTranslation(
          'about',
          aboutItem._id,
          'en',
          title.en || '',
          description.en || '',
          ''
        );
      }

      if (title.ar || description.ar) {
        await createOrUpdateTranslation(
          'about',
          aboutItem._id,
          'ar',
          title.ar || '',
          description.ar || '',
          ''
        );
      }

      // Get translations for response
      const translations = await getTranslationsByEntity('about', aboutItem._id);
      const translationsObject = {};
      translations.forEach(t => {
        translationsObject[t.language] = {
          title: t.title,
          description: t.description
        };
      });

      return res.status(201).json({
        success: true,
        message: 'About item created successfully',
        data: {
          id: aboutItem._id,
          key: aboutItem.key,
          translations: translationsObject,
          isActive: aboutItem.isActive,
          createdAt: aboutItem.createdAt,
          updatedAt: aboutItem.updatedAt
        }
      });

    } else if (key === 'team') {
      // Parse name and description translations
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

      if (!description.en && !description.ar) {
        return res.status(400).json({
          success: false,
          error: 'Description is required in at least one language'
        });
      }

      if (!req.files?.image) {
        return res.status(400).json({
          success: false,
          error: 'Image is required for team member'
        });
      }

      // Upload image
      const imageFile = req.files.image[0];
      const imageUrl = await bunnycdn.uploadImage(imageFile.buffer, imageFile.originalname, 'about/team');

      itemData.image = imageUrl;
      itemData.linkedIn = req.body.linkedIn?.trim() || '';
      itemData.order = req.body.order || 0;

      // Create team item
      const aboutItem = await About.create(itemData);

      // Save translations (name goes to title, description to description)
      if (name.en || description.en) {
        await createOrUpdateTranslation(
          'about',
          aboutItem._id,
          'en',
          name.en || '',
          description.en || '',
          ''
        );
      }

      if (name.ar || description.ar) {
        await createOrUpdateTranslation(
          'about',
          aboutItem._id,
          'ar',
          name.ar || '',
          description.ar || '',
          ''
        );
      }

      // Get translations for response
      const translations = await getTranslationsByEntity('about', aboutItem._id);
      const translationsObject = {};
      translations.forEach(t => {
        translationsObject[t.language] = {
          name: t.title,
          description: t.description
        };
      });

      return res.status(201).json({
        success: true,
        message: 'About item created successfully',
        data: {
          id: aboutItem._id,
          key: aboutItem.key,
          image: aboutItem.image,
          linkedIn: aboutItem.linkedIn,
          order: aboutItem.order,
          translations: translationsObject,
          isActive: aboutItem.isActive,
          createdAt: aboutItem.createdAt,
          updatedAt: aboutItem.updatedAt
        }
      });
    }
  } catch (error) {
    console.error('Create About Item Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create about item'
    });
  }
};

/**
 * Get all about items
 * GET /api/about
 * Public
 */
export const getAllAboutItems = async (req, res) => {
  try {
    const { key } = req.query;
    const requestedLang = req.get('Accept-Language') || 'en';
    const requestMultipleLangs = requestedLang.includes('|');

    const filter = { isActive: true };
    if (key && ['vision', 'team'].includes(key)) {
      filter.key = key;
    }

    const items = await About.find(filter).sort({ order: 1, createdAt: 1 });

    // Get translations for all items
    const itemsWithTranslations = await Promise.all(
      items.map(async (item) => {
        const translations = await getTranslationsByEntity('about', item._id);

        if (requestMultipleLangs) {
          const translationsObject = {};
          translations.forEach(t => {
            if (item.key === 'vision') {
              translationsObject[t.language] = {
                title: t.title,
                description: t.description
              };
            } else if (item.key === 'team') {
              translationsObject[t.language] = {
                name: t.title,
                description: t.description
              };
            }
          });

          const result = {
            id: item._id,
            key: item.key,
            translations: translationsObject
          };

          if (item.key === 'team') {
            result.image = item.image;
            result.linkedIn = item.linkedIn;
            result.order = item.order;
          }

          return result;
        }

        // Single language
        const translation = translations.find(t => t.language === requestedLang) ||
                           translations.find(t => t.language === 'en') ||
                           translations[0];

        const result = {
          id: item._id,
          key: item.key
        };

        if (item.key === 'vision') {
          result.title = translation?.title || '';
          result.description = translation?.description || '';
        } else if (item.key === 'team') {
          result.name = translation?.title || '';
          result.description = translation?.description || '';
          result.image = item.image;
          result.linkedIn = item.linkedIn;
          result.order = item.order;
        }

        return result;
      })
    );

    res.status(200).json({
      success: true,
      data: itemsWithTranslations
    });
  } catch (error) {
    console.error('Get About Items Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get about items'
    });
  }
};

/**
 * Get about item by ID
 * GET /api/about/:id
 * Public
 */
export const getAboutItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const requestedLang = req.get('Accept-Language') || 'en';
    const requestMultipleLangs = requestedLang.includes('|');

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid item ID'
      });
    }

    const item = await About.findOne({ _id: id, isActive: true });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'About item not found'
      });
    }

    // Get translations
    const translations = await getTranslationsByEntity('about', item._id);

    if (requestMultipleLangs) {
      const translationsObject = {};
      translations.forEach(t => {
        if (item.key === 'vision') {
          translationsObject[t.language] = {
            title: t.title,
            description: t.description
          };
        } else if (item.key === 'team') {
          translationsObject[t.language] = {
            name: t.title,
            description: t.description
          };
        }
      });

      const result = {
        id: item._id,
        key: item.key,
        translations: translationsObject,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      };

      if (item.key === 'team') {
        result.image = item.image;
        result.linkedIn = item.linkedIn;
        result.order = item.order;
      }

      return res.status(200).json({
        success: true,
        data: result
      });
    }

    // Single language
    const translation = translations.find(t => t.language === requestedLang) ||
                       translations.find(t => t.language === 'en') ||
                       translations[0];

    const result = {
      id: item._id,
      key: item.key,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    };

    if (item.key === 'vision') {
      result.title = translation?.title || '';
      result.description = translation?.description || '';
    } else if (item.key === 'team') {
      result.name = translation?.title || '';
      result.description = translation?.description || '';
      result.image = item.image;
      result.linkedIn = item.linkedIn;
      result.order = item.order;
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get About Item Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get about item'
    });
  }
};

/**
 * Update about item
 * PUT /api/about/:id
 * Admin only
 */
export const updateAboutItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid item ID'
      });
    }

    const item = await About.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'About item not found'
      });
    }

    if (item.key === 'vision') {
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
          'about',
          item._id,
          'en',
          title.en || '',
          description.en || '',
          ''
        );
      }

      if (title.ar || description.ar) {
        await createOrUpdateTranslation(
          'about',
          item._id,
          'ar',
          title.ar || '',
          description.ar || '',
          ''
        );
      }

    } else if (item.key === 'team') {
      // Parse name and description translations
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

      // Update translations (name goes to title)
      if (name.en || description.en) {
        await createOrUpdateTranslation(
          'about',
          item._id,
          'en',
          name.en || '',
          description.en || '',
          ''
        );
      }

      if (name.ar || description.ar) {
        await createOrUpdateTranslation(
          'about',
          item._id,
          'ar',
          name.ar || '',
          description.ar || '',
          ''
        );
      }

      // Update other fields
      if (req.body.linkedIn !== undefined) item.linkedIn = req.body.linkedIn.trim();
      if (req.body.order !== undefined) item.order = req.body.order;

      // Upload new image if provided
      if (req.files?.image) {
        const imageFile = req.files.image[0];
        item.image = await bunnycdn.uploadImage(imageFile.buffer, imageFile.originalname, 'about/team');
      }
    }

    if (req.body.isActive !== undefined) {
      item.isActive = req.body.isActive;
    }

    item.updatedAt = new Date();
    await item.save();

    // Get translations for response
    const translations = await getTranslationsByEntity('about', item._id);
    const translationsObject = {};
    translations.forEach(t => {
      if (item.key === 'vision') {
        translationsObject[t.language] = {
          title: t.title,
          description: t.description
        };
      } else if (item.key === 'team') {
        translationsObject[t.language] = {
          name: t.title,
          description: t.description
        };
      }
    });

    const result = {
      id: item._id,
      key: item.key,
      translations: translationsObject,
      isActive: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    };

    if (item.key === 'team') {
      result.image = item.image;
      result.linkedIn = item.linkedIn;
      result.order = item.order;
    }

    res.status(200).json({
      success: true,
      message: 'About item updated successfully',
      data: result
    });
  } catch (error) {
    console.error('Update About Item Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update about item'
    });
  }
};

/**
 * Delete about item
 * DELETE /api/about/:id
 * Admin only
 */
export const deleteAboutItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid item ID'
      });
    }

    const item = await About.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'About item not found'
      });
    }

    // Delete translations
    await deleteTranslationsByEntity('about', item._id);

    // Delete item
    await About.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'About item deleted successfully'
    });
  } catch (error) {
    console.error('Delete About Item Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete about item'
    });
  }
};

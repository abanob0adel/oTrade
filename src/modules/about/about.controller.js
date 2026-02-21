import { Settings, Team } from './about.model.js';
import bunnycdn from '../../utils/bunnycdn.js';
import mongoose from 'mongoose';
import { createOrUpdateTranslation, getTranslationsByEntity, deleteTranslationsByEntity } from '../translations/translation.service.js';

// ==================== SETTINGS ENDPOINTS ====================

/**
 * Create or Update Settings by Key
 * POST /api/about/settings
 * Admin only
 */
export const createOrUpdateSettings = async (req, res) => {
  try {
    console.log('\n===== CREATE/UPDATE SETTINGS DEBUG =====');
    console.log('Body:', req.body);
    console.log('Key:', req.body.key);
    console.log('========================================\n');

    const { key } = req.body;

    if (!key || !key.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Key is required'
      });
    }

    // Parse content translations
    let content = {};

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
    if (!content.en && !content.ar) {
      return res.status(400).json({
        success: false,
        error: 'Content is required in at least one language'
      });
    }

    // Find or create settings
    let settings = await Settings.findOne({ key: key.trim() });
    
    if (!settings) {
      settings = await Settings.create({ key: key.trim() });
    } else {
      settings.updatedAt = new Date();
      await settings.save();
    }

    // Save translations (content goes to content field)
    if (content.en) {
      await createOrUpdateTranslation(
        'about-settings',
        settings._id,
        'en',
        '',
        '',
        content.en
      );
    }

    if (content.ar) {
      await createOrUpdateTranslation(
        'about-settings',
        settings._id,
        'ar',
        '',
        '',
        content.ar
      );
    }

    // Get translations for response
    const translations = await getTranslationsByEntity('about-settings', settings._id);
    const translationsObject = {};
    translations.forEach(t => {
      translationsObject[t.language] = {
        content: t.content
      };
    });

    res.status(200).json({
      success: true,
      message: 'Settings saved successfully',
      data: {
        id: settings._id,
        key: settings.key,
        translations: translationsObject,
        isActive: settings.isActive,
        createdAt: settings.createdAt,
        updatedAt: settings.updatedAt
      }
    });
  } catch (error) {
    console.error('Create/Update Settings Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save settings'
    });
  }
};

/**
 * Get Settings by Key
 * GET /api/about/settings/:key
 * Public
 */
export const getSettingsByKey = async (req, res) => {
  try {
    const { key } = req.params;
    const requestedLang = req.get('Accept-Language') || 'en';
    const requestMultipleLangs = requestedLang.includes('|');

    const settings = await Settings.findOne({ key, isActive: true });

    if (!settings) {
      return res.status(404).json({
        success: false,
        error: 'Settings not found'
      });
    }

    // Get translations
    const translations = await getTranslationsByEntity('about-settings', settings._id);

    if (requestMultipleLangs) {
      const translationsObject = {};
      translations.forEach(t => {
        translationsObject[t.language] = {
          content: t.content
        };
      });

      return res.status(200).json({
        success: true,
        data: {
          id: settings._id,
          key: settings.key,
          translations: translationsObject,
          createdAt: settings.createdAt,
          updatedAt: settings.updatedAt
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
        id: settings._id,
        key: settings.key,
        content: translation?.content || '',
        createdAt: settings.createdAt,
        updatedAt: settings.updatedAt
      }
    });
  } catch (error) {
    console.error('Get Settings Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get settings'
    });
  }
};

/**
 * Get All Settings
 * GET /api/about/settings
 * Public
 */
export const getAllSettings = async (req, res) => {
  try {
    const requestedLang = req.get('Accept-Language') || 'en';
    const requestMultipleLangs = requestedLang.includes('|');

    const allSettings = await Settings.find({ isActive: true }).sort({ key: 1 });

    const settingsWithTranslations = await Promise.all(
      allSettings.map(async (settings) => {
        const translations = await getTranslationsByEntity('about-settings', settings._id);

        if (requestMultipleLangs) {
          const translationsObject = {};
          translations.forEach(t => {
            translationsObject[t.language] = {
              content: t.content
            };
          });

          return {
            id: settings._id,
            key: settings.key,
            translations: translationsObject
          };
        }

        // Single language
        const translation = translations.find(t => t.language === requestedLang) ||
                           translations.find(t => t.language === 'en') ||
                           translations[0];

        return {
          id: settings._id,
          key: settings.key,
          content: translation?.content || ''
        };
      })
    );

    res.status(200).json({
      success: true,
      data: settingsWithTranslations
    });
  } catch (error) {
    console.error('Get All Settings Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get settings'
    });
  }
};

// ==================== TEAM ENDPOINTS ====================

/**
 * Create Team Member
 * POST /api/about/team
 * Admin only
 */
export const createTeamMember = async (req, res) => {
  try {
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

    // Create team member
    const teamMember = await Team.create({
      image: imageUrl,
      linkedIn: req.body.linkedIn?.trim() || '',
      order: req.body.order || 0
    });

    // Save translations (name goes to title, description to description)
    if (name.en || description.en) {
      await createOrUpdateTranslation(
        'about-team',
        teamMember._id,
        'en',
        name.en || '',
        description.en || '',
        ''
      );
    }

    if (name.ar || description.ar) {
      await createOrUpdateTranslation(
        'about-team',
        teamMember._id,
        'ar',
        name.ar || '',
        description.ar || '',
        ''
      );
    }

    // Get translations for response
    const translations = await getTranslationsByEntity('about-team', teamMember._id);
    const translationsObject = {};
    translations.forEach(t => {
      translationsObject[t.language] = {
        name: t.title,
        description: t.description
      };
    });

    res.status(201).json({
      success: true,
      message: 'Team member created successfully',
      data: {
        id: teamMember._id,
        image: teamMember.image,
        linkedIn: teamMember.linkedIn,
        order: teamMember.order,
        translations: translationsObject,
        isActive: teamMember.isActive,
        createdAt: teamMember.createdAt,
        updatedAt: teamMember.updatedAt
      }
    });
  } catch (error) {
    console.error('Create Team Member Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create team member'
    });
  }
};

/**
 * Get All Team Members
 * GET /api/about/team
 * Public
 */
export const getAllTeamMembers = async (req, res) => {
  try {
    const requestedLang = req.get('Accept-Language') || 'en';
    const requestMultipleLangs = requestedLang.includes('|');

    const teamMembers = await Team.find({ isActive: true }).sort({ order: 1, createdAt: 1 });

    const membersWithTranslations = await Promise.all(
      teamMembers.map(async (member) => {
        const translations = await getTranslationsByEntity('about-team', member._id);

        if (requestMultipleLangs) {
          const translationsObject = {};
          translations.forEach(t => {
            translationsObject[t.language] = {
              name: t.title,
              description: t.description
            };
          });

          return {
            id: member._id,
            image: member.image,
            linkedIn: member.linkedIn,
            order: member.order,
            translations: translationsObject
          };
        }

        // Single language
        const translation = translations.find(t => t.language === requestedLang) ||
                           translations.find(t => t.language === 'en') ||
                           translations[0];

        return {
          id: member._id,
          name: translation?.title || '',
          description: translation?.description || '',
          image: member.image,
          linkedIn: member.linkedIn,
          order: member.order
        };
      })
    );

    res.status(200).json({
      success: true,
      data: membersWithTranslations
    });
  } catch (error) {
    console.error('Get Team Members Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get team members'
    });
  }
};

/**
 * Get Team Member by ID
 * GET /api/about/team/:id
 * Public
 */
export const getTeamMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const requestedLang = req.get('Accept-Language') || 'en';
    const requestMultipleLangs = requestedLang.includes('|');

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid team member ID'
      });
    }

    const member = await Team.findOne({ _id: id, isActive: true });

    if (!member) {
      return res.status(404).json({
        success: false,
        error: 'Team member not found'
      });
    }

    // Get translations
    const translations = await getTranslationsByEntity('about-team', member._id);

    if (requestMultipleLangs) {
      const translationsObject = {};
      translations.forEach(t => {
        translationsObject[t.language] = {
          name: t.title,
          description: t.description
        };
      });

      return res.status(200).json({
        success: true,
        data: {
          id: member._id,
          image: member.image,
          linkedIn: member.linkedIn,
          order: member.order,
          translations: translationsObject,
          createdAt: member.createdAt,
          updatedAt: member.updatedAt
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
        id: member._id,
        name: translation?.title || '',
        description: translation?.description || '',
        image: member.image,
        linkedIn: member.linkedIn,
        order: member.order,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt
      }
    });
  } catch (error) {
    console.error('Get Team Member Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get team member'
    });
  }
};

/**
 * Update Team Member
 * PUT /api/about/team/:id
 * Admin only
 */
export const updateTeamMember = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid team member ID'
      });
    }

    const member = await Team.findById(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        error: 'Team member not found'
      });
    }

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

    // Update translations
    if (name.en || description.en) {
      await createOrUpdateTranslation(
        'about-team',
        member._id,
        'en',
        name.en || '',
        description.en || '',
        ''
      );
    }

    if (name.ar || description.ar) {
      await createOrUpdateTranslation(
        'about-team',
        member._id,
        'ar',
        name.ar || '',
        description.ar || '',
        ''
      );
    }

    // Update other fields
    if (req.body.linkedIn !== undefined) member.linkedIn = req.body.linkedIn.trim();
    if (req.body.order !== undefined) member.order = req.body.order;

    // Upload new image if provided
    if (req.files?.image) {
      const imageFile = req.files.image[0];
      member.image = await bunnycdn.uploadImage(imageFile.buffer, imageFile.originalname, 'about/team');
    }

    if (req.body.isActive !== undefined) {
      member.isActive = req.body.isActive;
    }

    member.updatedAt = new Date();
    await member.save();

    // Get translations for response
    const translations = await getTranslationsByEntity('about-team', member._id);
    const translationsObject = {};
    translations.forEach(t => {
      translationsObject[t.language] = {
        name: t.title,
        description: t.description
      };
    });

    res.status(200).json({
      success: true,
      message: 'Team member updated successfully',
      data: {
        id: member._id,
        image: member.image,
        linkedIn: member.linkedIn,
        order: member.order,
        translations: translationsObject,
        isActive: member.isActive,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt
      }
    });
  } catch (error) {
    console.error('Update Team Member Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update team member'
    });
  }
};

/**
 * Delete Team Member
 * DELETE /api/about/team/:id
 * Admin only
 */
export const deleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid team member ID'
      });
    }

    const member = await Team.findById(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        error: 'Team member not found'
      });
    }

    // Delete translations
    await deleteTranslationsByEntity('about-team', member._id);

    // Delete member
    await Team.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Team member deleted successfully'
    });
  } catch (error) {
    console.error('Delete Team Member Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete team member'
    });
  }
};

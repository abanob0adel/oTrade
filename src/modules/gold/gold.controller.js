import axios from 'axios';
import GoldInfo from './gold.model.js';
import Translation from '../translations/translation.model.js';
import { createOrUpdateTranslation, getTranslationsByEntity } from '../translations/translation.service.js';
import bunnycdn from '../../utils/bunnycdn.js';

/**
 * Get live gold price from external API
 * GET /api/gold
 */
export const getGoldPrice = async (req, res) => {
  try {
    // Get requested language
    const requestedLang = req.get('Accept-Language') || 'en';

    // Fetch gold price from external API
    const response = await axios.get('https://api.gold-api.com/price/XAU', {
      timeout: 10000
    });

    console.log('Gold API Response:', JSON.stringify(response.data, null, 2));

    // Extract data from API response - handle different response formats
    let price, currency, updatedAt;
    
    if (response.data) {
      // Try different possible response structures
      if (response.data.price) {
        price = response.data.price;
        currency = response.data.currency || 'USD';
        updatedAt = response.data.updatedAt || response.data.timestamp || response.data.updated_at;
      } else if (response.data.data) {
        // Nested data structure
        price = response.data.data.price;
        currency = response.data.data.currency || 'USD';
        updatedAt = response.data.data.updatedAt || response.data.data.timestamp;
      } else if (typeof response.data === 'number') {
        // Direct price value
        price = response.data;
        currency = 'USD';
      }
    }

    // Validate response data
    if (!price) {
      console.error('Invalid API response structure:', response.data);
      return res.status(502).json({
        success: false,
        error: 'Invalid response from gold price API',
        debug: process.env.NODE_ENV === 'development' ? response.data : undefined
      });
    }

    // Get info from database
    const info = await GoldInfo.getInfo();

    // Get translation
    const translations = await getTranslationsByEntity('gold', info._id);
    const translation = translations.find(t => t.language === requestedLang) ||
                       translations.find(t => t.language === 'en') ||
                       translations[0];

    // Prepare formatted response
    const goldData = {
      success: true,
      data: {
        price: parseFloat(price).toFixed(2),
        currency: currency,
        lastUpdate: updatedAt || new Date().toISOString(),
        title: translation?.title || 'Gold Trading',
        description: translation?.description || '',
        coverImage: info.coverImage
      },
      timestamp: new Date().toISOString()
    };

    // Send response
    res.status(200).json(goldData);

  } catch (error) {
    console.error('Gold API Error:', error.message);
    if (error.response) {
      console.error('Error response data:', error.response.data);
    }

    // Handle different error types
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        success: false,
        error: 'Request timeout - Gold price API is not responding'
      });
    }

    if (error.response) {
      // API responded with error status
      return res.status(502).json({
        success: false,
        error: 'Failed to fetch gold price from external API',
        details: error.response.status
      });
    }

    if (error.request) {
      // Request made but no response received
      return res.status(503).json({
        success: false,
        error: 'Gold price API is currently unavailable'
      });
    }

    // Generic error
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching gold price'
    });
  }
};

/**
 * Get gold price with caching (optional - for better performance)
 * This can be used to reduce API calls
 */
let cachedGoldPrice = null;
let cacheTimestamp = null;
const CACHE_DURATION = 30000; // 30 seconds

export const getGoldPriceWithCache = async (req, res) => {
  try {
    const now = Date.now();
    const requestedLang = req.get('Accept-Language') || 'en';

    // Check if cache is valid
    if (cachedGoldPrice && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
      return res.status(200).json({
        ...cachedGoldPrice,
        cached: true,
        cacheAge: Math.floor((now - cacheTimestamp) / 1000)
      });
    }

    // Fetch fresh data
    const response = await axios.get('https://api.gold-api.com/price/XAU', {
      timeout: 10000
    });

    console.log('Gold API Response (cached):', JSON.stringify(response.data, null, 2));

    // Extract data from API response - handle different response formats
    let price, currency, updatedAt;
    
    if (response.data) {
      if (response.data.price) {
        price = response.data.price;
        currency = response.data.currency || 'USD';
        updatedAt = response.data.updatedAt || response.data.timestamp || response.data.updated_at;
      } else if (response.data.data) {
        price = response.data.data.price;
        currency = response.data.data.currency || 'USD';
        updatedAt = response.data.data.updatedAt || response.data.data.timestamp;
      } else if (typeof response.data === 'number') {
        price = response.data;
        currency = 'USD';
      }
    }

    if (!price) {
      console.error('Invalid API response structure:', response.data);
      return res.status(502).json({
        success: false,
        error: 'Invalid response from gold price API',
        debug: process.env.NODE_ENV === 'development' ? response.data : undefined
      });
    }

    // Get info from database
    const info = await GoldInfo.getInfo();

    // Get translation
    const translations = await getTranslationsByEntity('gold', info._id);
    const translation = translations.find(t => t.language === requestedLang) ||
                       translations.find(t => t.language === 'en') ||
                       translations[0];

    // Prepare response
    const goldData = {
      success: true,
      data: {
        price: parseFloat(price).toFixed(2),
        currency: currency,
        lastUpdate: updatedAt || new Date().toISOString(),
        title: translation?.title || 'Gold Trading',
        description: translation?.description || '',
        coverImage: info.coverImage
      },
      timestamp: new Date().toISOString(),
      cached: false
    };

    // Update cache
    cachedGoldPrice = goldData;
    cacheTimestamp = now;

    res.status(200).json(goldData);

  } catch (error) {
    console.error('Gold API Error:', error.message);
    if (error.response) {
      console.error('Error response data:', error.response.data);
    }

    // If cache exists, return it even if expired
    if (cachedGoldPrice) {
      return res.status(200).json({
        ...cachedGoldPrice,
        cached: true,
        stale: true,
        warning: 'Returning cached data due to API error'
      });
    }

    // Handle errors (same as above)
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        success: false,
        error: 'Request timeout - Gold price API is not responding'
      });
    }

    if (error.response) {
      return res.status(502).json({
        success: false,
        error: 'Failed to fetch gold price from external API',
        details: error.response.status
      });
    }

    if (error.request) {
      return res.status(503).json({
        success: false,
        error: 'Gold price API is currently unavailable'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching gold price'
    });
  }
};

/**
 * Get gold info (title, description, FAQs from translations) + Live Price
 * GET /api/gold/info
 */
export const getGoldInfo = async (req, res) => {
  try {
    // Get requested language(s)
    const requestedLang = req.get('Accept-Language') || 'en';
    const requestMultipleLangs = requestedLang.includes('|');

    // Get info from database
    const info = await GoldInfo.getInfo();

    // Get translations
    const translations = await getTranslationsByEntity('gold', info._id);

    // Fetch live gold price from external API
    let priceData = null;
    try {
      const response = await axios.get('https://api.gold-api.com/price/XAU', {
        timeout: 5000
      });

      if (response.data && response.data.price && response.data.currency) {
        priceData = {
          price: parseFloat(response.data.price).toFixed(2),
          currency: response.data.currency,
          lastUpdate: response.data.updatedAt || new Date().toISOString()
        };
      }
    } catch (priceError) {
      console.error('Failed to fetch gold price:', priceError.message);
    }

    // If requesting multiple languages (ar|en)
    if (requestMultipleLangs) {
      const translationsObject = {};
      translations.forEach(t => {
        translationsObject[t.language] = {
          title: t.title,
          description: t.description,
          content: t.content // FAQs stored in content as JSON
        };
      });

      return res.status(200).json({
        success: true,
        data: {
          translations: translationsObject,
          coverImage: info.coverImage,
          ...(priceData && { livePrice: priceData }),
          updatedAt: info.updatedAt
        }
      });
    }

    // Single language
    const translation = translations.find(t => t.language === requestedLang) ||
                       translations.find(t => t.language === 'en') ||
                       translations[0];

    // Parse FAQs from content (stored as JSON string)
    let faqs = [];
    if (translation && translation.content) {
      try {
        faqs = JSON.parse(translation.content);
      } catch (e) {
        faqs = [];
      }
    }

    res.status(200).json({
      success: true,
      data: {
        title: translation?.title || 'Gold Trading',
        description: translation?.description || '',
        coverImage: info.coverImage,
        faqs: faqs,
        ...(priceData && { livePrice: priceData }),
        updatedAt: info.updatedAt
      }
    });
  } catch (error) {
    console.error('Get Gold Info Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get gold information'
    });
  }
};

/**
 * Create/Update gold info (title, description, FAQs, coverImage)
 * POST /api/gold/info
 * Admin only
 * Supports FormData with bilingual content
 */
export const upsertGoldInfo = async (req, res) => {
  try {
    console.log('\n===== UPSERT GOLD INFO DEBUG =====');
    console.log('Body:', req.body);
    console.log('Files:', req.files);
    console.log('==================================\n');

    // Parse title, description, faqs (support both JSON and FormData)
    let title = {};
    let description = {};
    let faqs = {};

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

    // Support individual fields (title_en, title_ar, title[en], title[ar])
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

    // Parse FAQs (stored in content field as JSON)
    if (typeof req.body.faqs === 'string') {
      try {
        const parsedFaqs = JSON.parse(req.body.faqs);
        faqs = { en: parsedFaqs, ar: parsedFaqs }; // Same FAQs for both languages initially
      } catch (e) {
        faqs = {};
      }
    } else if (typeof req.body.faqs === 'object') {
      faqs = req.body.faqs;
    }

    if (req.body.faqs_en) {
      try {
        faqs.en = typeof req.body.faqs_en === 'string' ? JSON.parse(req.body.faqs_en) : req.body.faqs_en;
      } catch (e) {
        faqs.en = req.body.faqs_en;
      }
    }
    if (req.body.faqs_ar) {
      try {
        faqs.ar = typeof req.body.faqs_ar === 'string' ? JSON.parse(req.body.faqs_ar) : req.body.faqs_ar;
      } catch (e) {
        faqs.ar = req.body.faqs_ar;
      }
    }
    if (req.body['faqs[en]']) {
      try {
        faqs.en = typeof req.body['faqs[en]'] === 'string' ? JSON.parse(req.body['faqs[en]']) : req.body['faqs[en]'];
      } catch (e) {
        faqs.en = req.body['faqs[en]'];
      }
    }
    if (req.body['faqs[ar]']) {
      try {
        faqs.ar = typeof req.body['faqs[ar]'] === 'string' ? JSON.parse(req.body['faqs[ar]']) : req.body['faqs[ar]'];
      } catch (e) {
        faqs.ar = req.body['faqs[ar]'];
      }
    }

    // Get or create gold info
    let info = await GoldInfo.findOne();
    
    // Handle cover image upload
    let coverImageUrl = info?.coverImage || 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&q=80';
    
    // Check if file was uploaded
    if (req.files?.coverImage && req.files.coverImage[0]) {
      console.log('Uploading cover image to BunnyCDN...');
      const file = req.files.coverImage[0];
      coverImageUrl = await bunnycdn.uploadImage(file.buffer, file.originalname, 'gold');
      console.log('Cover image uploaded:', coverImageUrl);
    } else if (req.body.coverImage) {
      // Fallback to URL from body if no file uploaded
      coverImageUrl = req.body.coverImage;
    }
    
    if (!info) {
      info = await GoldInfo.create({
        coverImage: coverImageUrl
      });
    } else {
      // Update coverImage
      info.coverImage = coverImageUrl;
      info.updatedAt = new Date();
      await info.save();
    }

    // Save translations
    if (title.en || description.en || faqs.en) {
      await createOrUpdateTranslation(
        'gold',
        info._id,
        'en',
        title.en || 'Gold Trading',
        description.en || '',
        faqs.en ? JSON.stringify(faqs.en) : '[]'
      );
    }

    if (title.ar || description.ar || faqs.ar) {
      await createOrUpdateTranslation(
        'gold',
        info._id,
        'ar',
        title.ar || 'تداول الذهب',
        description.ar || '',
        faqs.ar ? JSON.stringify(faqs.ar) : '[]'
      );
    }

    // Get translations for response
    const translations = await getTranslationsByEntity('gold', info._id);
    const translationsObject = {};
    translations.forEach(t => {
      let parsedFaqs = [];
      try {
        parsedFaqs = JSON.parse(t.content);
      } catch (e) {
        parsedFaqs = [];
      }

      translationsObject[t.language] = {
        title: t.title,
        description: t.description,
        faqs: parsedFaqs
      };
    });

    res.status(200).json({
      success: true,
      message: 'Gold information updated successfully',
      data: {
        translations: translationsObject,
        coverImage: info.coverImage,
        updatedAt: info.updatedAt
      }
    });
  } catch (error) {
    console.error('Upsert Gold Info Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save gold information'
    });
  }
};

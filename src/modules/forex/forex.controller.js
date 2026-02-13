import axios from 'axios';
import ForexInfo from './forex.model.js';
import { createOrUpdateTranslation, getTranslationsByEntity } from '../translations/translation.service.js';
import bunnycdn from '../../utils/bunnycdn.js';

/**
 * Get live forex price from external API
 * GET /api/forex
 */
export const getForexPrice = async (req, res) => {
  try {
    // Get requested language
    const requestedLang = req.get('Accept-Language') || 'en';
    const requestMultipleLangs = requestedLang.includes('|');

    // Fetch EUR/USD forex rate from external API
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/EUR', {
      timeout: 10000
    });

    console.log('Forex API Response:', JSON.stringify(response.data, null, 2));

    // Extract data from API response
    let rates, baseCurrency, updatedAt;
    
    if (response.data) {
      if (response.data.rates) {
        rates = response.data.rates;
        baseCurrency = response.data.base || 'EUR';
        updatedAt = response.data.time_last_updated || response.data.date;
      }
    }

    // Validate response data
    if (!rates) {
      console.error('Invalid API response structure:', response.data);
      return res.status(502).json({
        success: false,
        error: 'Invalid response from forex API',
        debug: process.env.NODE_ENV === 'development' ? response.data : undefined
      });
    }

    // Get info from database
    const info = await ForexInfo.getInfo();

    // Get translations
    const translations = await getTranslationsByEntity('forex', info._id);

    // If requesting multiple languages (ar|en)
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
          base: baseCurrency,
          rates: rates,
          lastUpdate: updatedAt || new Date().toISOString(),
          translations: translationsObject,
          coverImage: info.coverImage
        },
        timestamp: new Date().toISOString()
      });
    }

    // Single language
    const translation = translations.find(t => t.language === requestedLang) ||
                       translations.find(t => t.language === 'en') ||
                       translations[0];

    // Prepare formatted response
    const forexData = {
      success: true,
      data: {
        base: baseCurrency,
        rates: rates,
        lastUpdate: updatedAt || new Date().toISOString(),
        title: translation?.title || 'Forex Trading',
        description: translation?.description || '',
        coverImage: info.coverImage
      },
      timestamp: new Date().toISOString()
    };

    // Send response
    res.status(200).json(forexData);

  } catch (error) {
    console.error('Forex API Error:', error.message);
    if (error.response) {
      console.error('Error response data:', error.response.data);
    }

    // Handle different error types
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        success: false,
        error: 'Request timeout - Forex API is not responding'
      });
    }

    if (error.response) {
      return res.status(502).json({
        success: false,
        error: 'Failed to fetch forex rate from external API',
        details: error.response.status
      });
    }

    if (error.request) {
      return res.status(503).json({
        success: false,
        error: 'Forex API is currently unavailable'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching forex rate'
    });
  }
};

/**
 * Get forex rate with caching (30 seconds)
 */
let cachedForexPrice = null;
let cacheTimestamp = null;
const CACHE_DURATION = 30000; // 30 seconds

export const getForexPriceWithCache = async (req, res) => {
  try {
    const now = Date.now();
    const requestedLang = req.get('Accept-Language') || 'en';
    const requestMultipleLangs = requestedLang.includes('|');

    // Check if cache is valid
    if (cachedForexPrice && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
      return res.status(200).json({
        ...cachedForexPrice,
        cached: true,
        cacheAge: Math.floor((now - cacheTimestamp) / 1000)
      });
    }

    // Fetch fresh data
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/EUR', {
      timeout: 10000
    });

    console.log('Forex API Response (cached):', JSON.stringify(response.data, null, 2));

    let rates, baseCurrency, updatedAt;
    
    if (response.data) {
      if (response.data.rates) {
        rates = response.data.rates;
        baseCurrency = response.data.base || 'EUR';
        updatedAt = response.data.time_last_updated || response.data.date;
      }
    }

    if (!rates) {
      console.error('Invalid API response structure:', response.data);
      return res.status(502).json({
        success: false,
        error: 'Invalid response from forex API',
        debug: process.env.NODE_ENV === 'development' ? response.data : undefined
      });
    }

    // Get info from database
    const info = await ForexInfo.getInfo();

    // Get translations
    const translations = await getTranslationsByEntity('forex', info._id);

    // If requesting multiple languages (ar|en)
    if (requestMultipleLangs) {
      const translationsObject = {};
      translations.forEach(t => {
        translationsObject[t.language] = {
          title: t.title,
          description: t.description
        };
      });

      const forexData = {
        success: true,
        data: {
          base: baseCurrency,
          rates: rates,
          lastUpdate: updatedAt || new Date().toISOString(),
          translations: translationsObject,
          coverImage: info.coverImage
        },
        timestamp: new Date().toISOString(),
        cached: false
      };

      // Update cache
      cachedForexPrice = forexData;
      cacheTimestamp = now;

      return res.status(200).json(forexData);
    }

    // Single language
    const translation = translations.find(t => t.language === requestedLang) ||
                       translations.find(t => t.language === 'en') ||
                       translations[0];

    // Prepare response
    const forexData = {
      success: true,
      data: {
        base: baseCurrency,
        rates: rates,
        lastUpdate: updatedAt || new Date().toISOString(),
        title: translation?.title || 'Forex Trading',
        description: translation?.description || '',
        coverImage: info.coverImage
      },
      timestamp: new Date().toISOString(),
      cached: false
    };

    // Update cache
    cachedForexPrice = forexData;
    cacheTimestamp = now;

    res.status(200).json(forexData);

  } catch (error) {
    console.error('Forex API Error:', error.message);
    if (error.response) {
      console.error('Error response data:', error.response.data);
    }

    // If cache exists, return it even if expired
    if (cachedForexPrice) {
      return res.status(200).json({
        ...cachedForexPrice,
        cached: true,
        stale: true,
        warning: 'Returning cached data due to API error'
      });
    }

    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        success: false,
        error: 'Request timeout - Forex API is not responding'
      });
    }

    if (error.response) {
      return res.status(502).json({
        success: false,
        error: 'Failed to fetch forex rate from external API',
        details: error.response.status
      });
    }

    if (error.request) {
      return res.status(503).json({
        success: false,
        error: 'Forex API is currently unavailable'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching forex rate'
    });
  }
};

/**
 * Get forex info (title, description, FAQs from translations) + Live Rate
 * GET /api/forex/info
 */
export const getForexInfo = async (req, res) => {
  try {
    // Get requested language(s)
    const requestedLang = req.get('Accept-Language') || 'en';
    const requestMultipleLangs = requestedLang.includes('|');

    // Get info from database
    const info = await ForexInfo.getInfo();

    // Get translations
    const translations = await getTranslationsByEntity('forex', info._id);

    // Fetch live forex rate from external API
    let rateData = null;
    try {
      const response = await axios.get('https://api.exchangerate-api.com/v4/latest/EUR', {
        timeout: 5000
      });

      if (response.data && response.data.rates && response.data.rates.USD) {
        rateData = {
          rate: parseFloat(response.data.rates.USD).toFixed(4),
          pair: 'EUR/USD',
          lastUpdate: response.data.time_last_updated || new Date().toISOString()
        };
      }
    } catch (rateError) {
      console.error('Failed to fetch forex rate:', rateError.message);
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
          ...(rateData && { liveRate: rateData }),
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
        title: translation?.title || 'Forex Trading',
        description: translation?.description || '',
        coverImage: info.coverImage,
        faqs: faqs,
        ...(rateData && { liveRate: rateData }),
        updatedAt: info.updatedAt
      }
    });
  } catch (error) {
    console.error('Get Forex Info Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get forex information'
    });
  }
};

/**
 * Create/Update forex info (title, description, FAQs, coverImage)
 * POST /api/forex/info
 * Admin only
 * Supports FormData with bilingual content
 */
export const upsertForexInfo = async (req, res) => {
  try {
    console.log('\n===== UPSERT FOREX INFO DEBUG =====');
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

    // Parse FAQs
    if (typeof req.body.faqs === 'string') {
      try {
        const parsedFaqs = JSON.parse(req.body.faqs);
        faqs = { en: parsedFaqs, ar: parsedFaqs };
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

    // Get or create forex info
    let info = await ForexInfo.findOne();
    
    // Handle cover image upload
    let coverImageUrl = info?.coverImage || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80';
    
    // Check if file was uploaded
    if (req.files?.coverImage && req.files.coverImage[0]) {
      console.log('Uploading cover image to BunnyCDN...');
      const file = req.files.coverImage[0];
      coverImageUrl = await bunnycdn.uploadImage(file.buffer, file.originalname, 'forex');
      console.log('Cover image uploaded:', coverImageUrl);
    } else if (req.body.coverImage) {
      coverImageUrl = req.body.coverImage;
    }
    
    if (!info) {
      info = await ForexInfo.create({
        coverImage: coverImageUrl
      });
    } else {
      info.coverImage = coverImageUrl;
      info.updatedAt = new Date();
      await info.save();
    }

    // Save translations
    if (title.en || description.en || faqs.en) {
      await createOrUpdateTranslation(
        'forex',
        info._id,
        'en',
        title.en || 'Forex Trading',
        description.en || '',
        faqs.en ? JSON.stringify(faqs.en) : '[]'
      );
    }

    if (title.ar || description.ar || faqs.ar) {
      await createOrUpdateTranslation(
        'forex',
        info._id,
        'ar',
        title.ar || 'تداول الفوريكس',
        description.ar || '',
        faqs.ar ? JSON.stringify(faqs.ar) : '[]'
      );
    }

    // Get translations for response
    const translations = await getTranslationsByEntity('forex', info._id);
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
      message: 'Forex information updated successfully',
      data: {
        translations: translationsObject,
        coverImage: info.coverImage,
        updatedAt: info.updatedAt
      }
    });
  } catch (error) {
    console.error('Upsert Forex Info Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save forex information'
    });
  }
};

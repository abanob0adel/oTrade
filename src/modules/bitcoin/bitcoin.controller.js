import axios from 'axios';
import BitcoinInfo from './bitcoin.model.js';
import { createOrUpdateTranslation, getTranslationsByEntity } from '../translations/translation.service.js';
import bunnycdn from '../../utils/bunnycdn.js';

/**
 * Get live bitcoin price from external API
 * GET /api/bitcoin
 */
export const getBitcoinPrice = async (req, res) => {
  try {
    // Get requested language
    const requestedLang = req.get('Accept-Language') || 'en';
    const requestMultipleLangs = requestedLang.includes('|');

    // Fetch Bitcoin price from external API (CoinGecko)
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_last_updated_at=true', {
      timeout: 10000
    });

    console.log('Bitcoin API Response:', JSON.stringify(response.data, null, 2));

    // Extract data from API response
    let price, currency, updatedAt;
    
    if (response.data && response.data.bitcoin) {
      price = response.data.bitcoin.usd;
      currency = 'USD';
      updatedAt = response.data.bitcoin.last_updated_at ? 
        new Date(response.data.bitcoin.last_updated_at * 1000).toISOString() : 
        new Date().toISOString();
    }

    // Validate response data
    if (!price) {
      console.error('Invalid API response structure:', response.data);
      return res.status(502).json({
        success: false,
        error: 'Invalid response from bitcoin price API',
        debug: process.env.NODE_ENV === 'development' ? response.data : undefined
      });
    }

    // Get info from database
    const info = await BitcoinInfo.getInfo();

    // Get translations
    const translations = await getTranslationsByEntity('bitcoin', info._id);

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
          price: parseFloat(price).toFixed(2),
          currency: currency,
          lastUpdate: updatedAt,
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
    const bitcoinData = {
      success: true,
      data: {
        price: parseFloat(price).toFixed(2),
        currency: currency,
        lastUpdate: updatedAt,
        title: translation?.title || 'Bitcoin Trading',
        description: translation?.description || '',
        coverImage: info.coverImage
      },
      timestamp: new Date().toISOString()
    };

    // Send response
    res.status(200).json(bitcoinData);

  } catch (error) {
    console.error('Bitcoin API Error:', error.message);
    if (error.response) {
      console.error('Error response data:', error.response.data);
    }

    // Handle different error types
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        success: false,
        error: 'Request timeout - Bitcoin API is not responding'
      });
    }

    if (error.response) {
      return res.status(502).json({
        success: false,
        error: 'Failed to fetch bitcoin price from external API',
        details: error.response.status
      });
    }

    if (error.request) {
      return res.status(503).json({
        success: false,
        error: 'Bitcoin API is currently unavailable'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching bitcoin price'
    });
  }
};

/**
 * Get bitcoin price with caching (30 seconds)
 */
let cachedBitcoinPrice = null;
let cacheTimestamp = null;
const CACHE_DURATION = 30000; // 30 seconds

export const getBitcoinPriceWithCache = async (req, res) => {
  try {
    const now = Date.now();
    const requestedLang = req.get('Accept-Language') || 'en';

    // Check if cache is valid
    if (cachedBitcoinPrice && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
      return res.status(200).json({
        ...cachedBitcoinPrice,
        cached: true,
        cacheAge: Math.floor((now - cacheTimestamp) / 1000)
      });
    }

    // Fetch fresh data
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_last_updated_at=true', {
      timeout: 10000
    });

    console.log('Bitcoin API Response (cached):', JSON.stringify(response.data, null, 2));

    let price, currency, updatedAt;
    
    if (response.data && response.data.bitcoin) {
      price = response.data.bitcoin.usd;
      currency = 'USD';
      updatedAt = response.data.bitcoin.last_updated_at ? 
        new Date(response.data.bitcoin.last_updated_at * 1000).toISOString() : 
        new Date().toISOString();
    }

    if (!price) {
      console.error('Invalid API response structure:', response.data);
      return res.status(502).json({
        success: false,
        error: 'Invalid response from bitcoin price API',
        debug: process.env.NODE_ENV === 'development' ? response.data : undefined
      });
    }

    // Get info from database
    const info = await BitcoinInfo.getInfo();

    // Get translation
    const translations = await getTranslationsByEntity('bitcoin', info._id);
    const translation = translations.find(t => t.language === requestedLang) ||
                       translations.find(t => t.language === 'en') ||
                       translations[0];

    // Prepare response
    const bitcoinData = {
      success: true,
      data: {
        price: parseFloat(price).toFixed(2),
        currency: currency,
        lastUpdate: updatedAt,
        title: translation?.title || 'Bitcoin Trading',
        description: translation?.description || '',
        coverImage: info.coverImage
      },
      timestamp: new Date().toISOString(),
      cached: false
    };

    // Update cache
    cachedBitcoinPrice = bitcoinData;
    cacheTimestamp = now;

    res.status(200).json(bitcoinData);

  } catch (error) {
    console.error('Bitcoin API Error:', error.message);
    if (error.response) {
      console.error('Error response data:', error.response.data);
    }

    // If cache exists, return it even if expired
    if (cachedBitcoinPrice) {
      return res.status(200).json({
        ...cachedBitcoinPrice,
        cached: true,
        stale: true,
        warning: 'Returning cached data due to API error'
      });
    }

    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        success: false,
        error: 'Request timeout - Bitcoin API is not responding'
      });
    }

    if (error.response) {
      return res.status(502).json({
        success: false,
        error: 'Failed to fetch bitcoin price from external API',
        details: error.response.status
      });
    }

    if (error.request) {
      return res.status(503).json({
        success: false,
        error: 'Bitcoin API is currently unavailable'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching bitcoin price'
    });
  }
};

/**
 * Get bitcoin info (title, description, FAQs from translations) + Live Price
 * GET /api/bitcoin/info
 */
export const getBitcoinInfo = async (req, res) => {
  try {
    // Get requested language(s)
    const requestedLang = req.get('Accept-Language') || 'en';
    const requestMultipleLangs = requestedLang.includes('|');

    // Get info from database
    const info = await BitcoinInfo.getInfo();

    // Get translations
    const translations = await getTranslationsByEntity('bitcoin', info._id);

    // Fetch live bitcoin price from external API
    let priceData = null;
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_last_updated_at=true', {
        timeout: 5000
      });

      if (response.data && response.data.bitcoin && response.data.bitcoin.usd) {
        priceData = {
          price: parseFloat(response.data.bitcoin.usd).toFixed(2),
          currency: 'USD',
          lastUpdate: response.data.bitcoin.last_updated_at ? 
            new Date(response.data.bitcoin.last_updated_at * 1000).toISOString() : 
            new Date().toISOString()
        };
      }
    } catch (priceError) {
      console.error('Failed to fetch bitcoin price:', priceError.message);
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
        title: translation?.title || 'Bitcoin Trading',
        description: translation?.description || '',
        coverImage: info.coverImage,
        faqs: faqs,
        ...(priceData && { livePrice: priceData }),
        updatedAt: info.updatedAt
      }
    });
  } catch (error) {
    console.error('Get Bitcoin Info Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get bitcoin information'
    });
  }
};

/**
 * Create/Update bitcoin info (title, description, FAQs, coverImage)
 * POST /api/bitcoin/info
 * Admin only
 * Supports FormData with bilingual content
 */
export const upsertBitcoinInfo = async (req, res) => {
  try {
    console.log('\n===== UPSERT BITCOIN INFO DEBUG =====');
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

    // Get or create bitcoin info
    let info = await BitcoinInfo.findOne();
    
    // Handle cover image upload
    let coverImageUrl = info?.coverImage || 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80';
    
    // Check if file was uploaded
    if (req.files?.coverImage && req.files.coverImage[0]) {
      console.log('Uploading cover image to BunnyCDN...');
      const file = req.files.coverImage[0];
      coverImageUrl = await bunnycdn.uploadImage(file.buffer, file.originalname, 'bitcoin');
      console.log('Cover image uploaded:', coverImageUrl);
    } else if (req.body.coverImage) {
      coverImageUrl = req.body.coverImage;
    }
    
    if (!info) {
      info = await BitcoinInfo.create({
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
        'bitcoin',
        info._id,
        'en',
        title.en || 'Bitcoin Trading',
        description.en || '',
        faqs.en ? JSON.stringify(faqs.en) : '[]'
      );
    }

    if (title.ar || description.ar || faqs.ar) {
      await createOrUpdateTranslation(
        'bitcoin',
        info._id,
        'ar',
        title.ar || 'تداول البيتكوين',
        description.ar || '',
        faqs.ar ? JSON.stringify(faqs.ar) : '[]'
      );
    }

    // Get translations for response
    const translations = await getTranslationsByEntity('bitcoin', info._id);
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
      message: 'Bitcoin information updated successfully',
      data: {
        translations: translationsObject,
        coverImage: info.coverImage,
        updatedAt: info.updatedAt
      }
    });
  } catch (error) {
    console.error('Upsert Bitcoin Info Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save bitcoin information'
    });
  }
};

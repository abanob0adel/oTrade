import axios from 'axios';
import GoldConfig from './gold.model.js';

/**
 * Get live gold price from external API
 * GET /api/gold
 */
export const getGoldPrice = async (req, res) => {
  try {
    // Fetch gold price from external API
    const response = await axios.get('https://api.gold-api.com/price/XAU', {
      timeout: 10000 // 10 seconds timeout
    });

    // Extract data from API response
    const { price, currency, updatedAt } = response.data;

    // Validate response data
    if (!price || !currency) {
      return res.status(502).json({
        success: false,
        error: 'Invalid response from gold price API'
      });
    }

    // Get config from database
    const config = await GoldConfig.getConfig();

    // Prepare formatted response
    const goldData = {
      success: true,
      data: {
        price: parseFloat(price).toFixed(2),
        currency: currency,
        lastUpdate: updatedAt || new Date().toISOString(),
        description: config.description,
        coverImage: config.coverImage
      },
      timestamp: new Date().toISOString()
    };

    // Send response
    res.status(200).json(goldData);

  } catch (error) {
    console.error('Gold API Error:', error.message);

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

    // Check if cache is valid
    if (cachedGoldPrice && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
      return res.status(200).json({
        ...cachedGoldPrice,
        cached: true,
        cacheAge: Math.floor((now - cacheTimestamp) / 1000) // seconds
      });
    }

    // Fetch fresh data
    const response = await axios.get('https://api.gold-api.com/price/XAU', {
      timeout: 10000
    });

    const { price, currency, updatedAt } = response.data;

    if (!price || !currency) {
      return res.status(502).json({
        success: false,
        error: 'Invalid response from gold price API'
      });
    }

    // Get config from database
    const config = await GoldConfig.getConfig();

    // Prepare response
    const goldData = {
      success: true,
      data: {
        price: parseFloat(price).toFixed(2),
        currency: currency,
        lastUpdate: updatedAt || new Date().toISOString(),
        description: config.description,
        coverImage: config.coverImage
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
 * Get gold config (description & coverImage)
 * GET /api/gold/config
 */
export const getGoldConfig = async (req, res) => {
  try {
    const config = await GoldConfig.getConfig();

    res.status(200).json({
      success: true,
      data: {
        description: config.description,
        coverImage: config.coverImage,
        isActive: config.isActive,
        updatedAt: config.updatedAt
      }
    });
  } catch (error) {
    console.error('Get Gold Config Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get gold configuration'
    });
  }
};

/**
 * Update gold config (description & coverImage)
 * PUT /api/gold/config
 * Admin only
 */
export const updateGoldConfig = async (req, res) => {
  try {
    const { description, coverImage } = req.body;

    // Validation
    if (!description && !coverImage) {
      return res.status(400).json({
        success: false,
        error: 'At least one field (description or coverImage) is required'
      });
    }

    // Get existing config
    const config = await GoldConfig.getConfig();

    // Update fields
    if (description) config.description = description;
    if (coverImage) config.coverImage = coverImage;
    config.updatedAt = new Date();

    await config.save();

    res.status(200).json({
      success: true,
      message: 'Gold configuration updated successfully',
      data: {
        description: config.description,
        coverImage: config.coverImage,
        updatedAt: config.updatedAt
      }
    });
  } catch (error) {
    console.error('Update Gold Config Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update gold configuration'
    });
  }
};

/**
 * Create/Reset gold config
 * POST /api/gold/config
 * Admin only
 */
export const createGoldConfig = async (req, res) => {
  try {
    const { description, coverImage } = req.body;

    // Validation
    if (!description || !coverImage) {
      return res.status(400).json({
        success: false,
        error: 'Both description and coverImage are required'
      });
    }

    // Delete existing config
    await GoldConfig.deleteMany({});

    // Create new config
    const config = await GoldConfig.create({
      description,
      coverImage
    });

    res.status(201).json({
      success: true,
      message: 'Gold configuration created successfully',
      data: {
        description: config.description,
        coverImage: config.coverImage,
        createdAt: config.createdAt
      }
    });
  } catch (error) {
    console.error('Create Gold Config Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create gold configuration'
    });
  }
};

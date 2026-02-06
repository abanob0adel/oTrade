import EconomicCalendarService from './economic-calendar.service.js';

/**
 * Controller for Economic Calendar API endpoints
 */

/**
 * Get economic calendar events with optional filters
 * Query parameters:
 * - startDate: Start date in YYYY-MM-DD format
 * - endDate: End date in YYYY-MM-DD format  
 * - country: Country filter (e.g., 'United States')
 * - importance: Importance level (High, Medium, Low)
 */
const getEconomicCalendar = async (req, res) => {
  try {
    // Extract query parameters
    const { startDate, endDate, country, importance } = req.query;

    // Validate query parameters
    if (startDate && !EconomicCalendarService.isValidDate(startDate)) {
      return res.status(400).json({
        error: 'Invalid startDate format. Expected YYYY-MM-DD format.'
      });
    }

    if (endDate && !EconomicCalendarService.isValidDate(endDate)) {
      return res.status(400).json({
        error: 'Invalid endDate format. Expected YYYY-MM-DD format.'
      });
    }

    if (importance && !EconomicCalendarService.isValidImportance(importance)) {
      return res.status(400).json({
        error: 'Invalid importance level. Expected High, Medium, or Low.'
      });
    }

    // Prepare filters object
    const filters = {};
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (country) filters.country = country;
    if (importance) filters.importance = importance;

    // Fetch calendar events from service
    const events = await EconomicCalendarService.getCalendarEvents(filters);

    // Return successful response
    res.status(200).json({
      success: true,
      data: events,
      count: events.length,
      filters: filters
    });

  } catch (error) {
    console.error('Error fetching economic calendar:', error.message);
    
    // Handle specific error types
    if (error.message.includes('API key is not configured')) {
      return res.status(500).json({
        error: 'Economic calendar service is not properly configured. API key is missing.',
        message: error.message
      });
    } else if (error.message.includes('API error')) {
      return res.status(500).json({
        error: 'External API error occurred while fetching calendar data.',
        message: error.message
      });
    } else if (error.message.includes('Network error')) {
      return res.status(503).json({
        error: 'Unable to connect to economic calendar service.',
        message: error.message
      });
    } else {
      return res.status(500).json({
        error: 'Internal server error occurred while fetching calendar data.',
        message: error.message
      });
    }
  }
};

/**
 * Health check endpoint for economic calendar service
 */
const healthCheck = (req, res) => {
  const apiKeyExists = !!process.env.TRADING_ECONOMICS_API_KEY;
  
  res.status(200).json({
    status: 'ok',
    service: 'Economic Calendar',
    configured: apiKeyExists,
    timestamp: new Date().toISOString()
  });
};

export { getEconomicCalendar, healthCheck };
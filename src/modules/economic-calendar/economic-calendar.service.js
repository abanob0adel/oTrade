import te from 'tradingeconomics';

/**
 * Service for fetching economic calendar events from Trading Economics API
 */
class EconomicCalendarService {
  constructor() {
    this.apiKey = process.env.TRADING_ECONOMICS_API_KEY;
    
    if (this.apiKey) {
      // Initialize the Trading Economics client with the API key
      te.login(this.apiKey);
    } else {
      console.warn('TRADING_ECONOMICS_API_KEY environment variable is not set');
    }
  }

  /**
   * Fetch economic calendar events with optional filters
   * @param {Object} filters - Optional filters for the API call
   * @param {string} filters.startDate - Start date in YYYY-MM-DD format
   * @param {string} filters.endDate - End date in YYYY-MM-DD format
   * @param {string} filters.country - Country filter (e.g., 'United States')
   * @param {string} filters.importance - Importance level (High, Medium, Low)
   * @returns {Promise<Array>} Array of normalized calendar events
   */
  async getCalendarEvents(filters = {}) {
    try {
      if (!this.apiKey) {
        throw new Error('Trading Economics API key is not configured');
      }

      let result;
      
      // Build parameters based on filters provided
      if (filters.country && filters.startDate && filters.endDate) {
        // Specific country with date range
        result = await te.getCalendar(filters.country, filters.startDate, filters.endDate);
      } else if (filters.country) {
        // Specific country only
        result = await te.getCalendar(filters.country);
      } else if (filters.startDate && filters.endDate) {
        // Date range only
        result = await te.getCalendar(null, filters.startDate, filters.endDate);
      } else {
        // All events
        result = await te.getCalendar();
      }

      // If result is not an array, convert it
      const eventData = Array.isArray(result) ? result : (result && result.data ? result.data : []);
      
      // Filter by importance if specified
      let filteredEvents = eventData;
      if (filters.importance) {
        filteredEvents = eventData.filter(event => 
          event && event.Importance && 
          event.Importance.toLowerCase() === filters.importance.toLowerCase()
        );
      }

      // Normalize the response data to match UI requirements
      const normalizedEvents = this.normalizeApiResponse(filteredEvents);

      return normalizedEvents;

    } catch (error) {
      // Handle specific error types from Trading Economics package
      if (error.message && error.message.includes('API')) {
        throw new Error(`Trading Economics API error: ${error.message}`);
      } else if (error.message && error.message.includes('Network')) {
        throw new Error('Network error: Unable to reach Trading Economics API');
      } else {
        throw new Error(`Request error: ${error.message}`);
      }
    }
  }

  /**
   * Normalize API response to match UI field requirements
   * @param {Array} apiData - Raw data from Trading Economics API
   * @returns {Array} Normalized array of calendar events
   */
  normalizeApiResponse(apiData) {
    if (!Array.isArray(apiData)) {
      return [];
    }

    return apiData.map(event => ({
      time: event.Date || null,
      country: event.Country || null,
      impact: event.Importance || null,
      event: event.Event || null,
      actual: event.Actual || null,
      forecast: event.Forecast || null,
      previous: event.Previous || null
    })).filter(event => 
      // Filter out events with no essential data
      event.time && event.event
    );
  }

  /**
   * Validate importance filter value
   * @param {string} importance - The importance level to validate
   * @returns {boolean} True if valid, false otherwise
   */
  isValidImportance(importance) {
    if (!importance) return true; // Allow undefined/null
    const validLevels = ['high', 'medium', 'low'];
    return validLevels.includes(importance.toLowerCase());
  }

  /**
   * Validate date format (YYYY-MM-DD)
   * @param {string} dateStr - Date string to validate
   * @returns {boolean} True if valid, false otherwise
   */
  isValidDate(dateStr) {
    if (!dateStr) return true; // Allow undefined/null
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) return false;
    
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date) && date.toISOString().split('T')[0] === dateStr;
  }
}

export default new EconomicCalendarService();
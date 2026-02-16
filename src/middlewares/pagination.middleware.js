/**
 * Pagination Middleware
 * 
 * Adds pagination support to any route
 * Default: 6 items per page
 * 
 * Usage in routes:
 * router.get('/items', pagination(), getItems);
 * 
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 6, max: 100)
 * 
 * Adds to req object:
 * - req.pagination.page: Current page number
 * - req.pagination.limit: Items per page
 * - req.pagination.skip: Number of items to skip
 * 
 * Helper function for response:
 * - req.paginatedResponse(data, total): Formats paginated response
 */

export const pagination = (options = {}) => {
  const defaultLimit = options.defaultLimit || 10;
  const maxLimit = options.maxLimit || 100;

  return (req, res, next) => {
    // Check if pagination is globally enabled
    const isPaginationEnabled = process.env.PAGINATION_ENABLED !== 'false';
    
    if (!isPaginationEnabled) {
      // Pagination is disabled, skip middleware
      console.log('ℹ️ Pagination is disabled globally');
      return next();
    }

    // Get page and limit from query parameters
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || defaultLimit;

    // Ensure page is at least 1
    const validPage = Math.max(1, page);

    // Ensure limit is within bounds
    limit = Math.min(Math.max(1, limit), maxLimit);

    // Calculate skip
    const skip = (validPage - 1) * limit;

    // Add pagination info to request
    req.pagination = {
      page: validPage,
      limit: limit,
      skip: skip
    };

    // Helper function to format paginated response
    req.paginatedResponse = (data, total) => {
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = validPage < totalPages;
      const hasPrevPage = validPage > 1;

      return {
        success: true,
        data: data,
        pagination: {
          currentPage: validPage,
          totalPages: totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: hasNextPage,
          hasPrevPage: hasPrevPage,
          nextPage: hasNextPage ? validPage + 1 : null,
          prevPage: hasPrevPage ? validPage - 1 : null
        }
      };
    };

    next();
  };
};

/**
 * Example usage in controller:
 * 
 * export const getItems = async (req, res) => {
 *   try {
 *     const { skip, limit } = req.pagination;
 *     
 *     // Get total count
 *     const total = await Item.countDocuments();
 *     
 *     // Get paginated data
 *     const items = await Item.find()
 *       .skip(skip)
 *       .limit(limit)
 *       .sort({ createdAt: -1 });
 *     
 *     // Send paginated response
 *     res.status(200).json(req.paginatedResponse(items, total));
 *   } catch (error) {
 *     res.status(500).json({ success: false, error: error.message });
 *   }
 * };
 */

export default pagination;

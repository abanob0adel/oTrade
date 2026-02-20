import Newsletter from './newsletter.model.js';

/**
 * Subscribe to newsletter
 * POST /api/newsletter
 * Public
 */
export const subscribeToNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Check if email already exists
    const existingSubscription = await Newsletter.findOne({ email: email.trim().toLowerCase() });
    
    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        error: 'This email is already subscribed to our newsletter'
      });
    }

    // Create new subscription
    const subscription = await Newsletter.create({
      email: email.trim().toLowerCase()
    });

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      data: {
        email: subscription.email,
        subscribedAt: subscription.createdAt
      }
    });
  } catch (error) {
    console.error('Newsletter Subscribe Error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: errors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'This email is already subscribed'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to subscribe to newsletter'
    });
  }
};

/**
 * Get all newsletter subscriptions
 * GET /api/newsletter
 * Admin only
 */
export const getAllSubscriptions = async (req, res) => {
  try {
    // Pagination support
    const skip = req.pagination?.skip || 0;
    const limit = req.pagination?.limit || 0;

    // Get total count
    const total = await Newsletter.countDocuments();

    // Get subscriptions with pagination
    let query = Newsletter.find().sort({ createdAt: -1 });
    
    if (limit > 0) {
      query = query.skip(skip).limit(limit);
    }

    const subscriptions = await query;

    // Send response with or without pagination
    if (req.paginatedResponse) {
      res.status(200).json(req.paginatedResponse(subscriptions, total));
    } else {
      res.status(200).json({
        success: true,
        data: subscriptions
      });
    }
  } catch (error) {
    console.error('Get Newsletter Subscriptions Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get newsletter subscriptions'
    });
  }
};

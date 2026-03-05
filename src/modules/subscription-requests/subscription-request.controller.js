import SubscriptionRequest from './subscription-request.model.js';
import Plan from '../plans/plan.model.js';
import User from '../users/user.model.js';
import Subscription from '../subscriptions/subscription.model.js';
import mongoose from 'mongoose';

/**
 * Create subscription request (User)
 * POST /api/subscription-requests
 */
export const createSubscriptionRequest = async (req, res) => {
  try {
    const { planId, duration } = req.body;
    const userId = req.user?._id || req.admin?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Validate plan
    if (!planId || !mongoose.Types.ObjectId.isValid(planId)) {
      return res.status(400).json({
        success: false,
        error: 'Valid plan ID is required'
      });
    }

    // Validate duration
    if (!duration || !['monthly', 'quarterly', 'semiAnnual', 'yearly'].includes(duration)) {
      return res.status(400).json({
        success: false,
        error: 'Valid duration is required (monthly, quarterly, semiAnnual, yearly)'
      });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found'
      });
    }

    // Check if the selected duration is enabled for this plan
    if (!plan.subscriptionOptions[duration]?.enabled) {
      return res.status(400).json({
        success: false,
        error: `${duration} subscription is not available for this plan`
      });
    }

    // Get the price for the selected duration
    const price = plan.subscriptionOptions[duration].price;

    // Check if user already has a pending request for this plan
    const existingRequest = await SubscriptionRequest.findOne({
      user: userId,
      plan: planId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        error: 'You already have a pending request for this plan'
      });
    }

    // Create subscription request
    const request = await SubscriptionRequest.create({
      user: userId,
      plan: planId,
      duration,
      price
    });

    // Populate for response
    await request.populate('plan');
    await request.populate('user', 'name email phone profileImage');

    res.status(201).json({
      success: true,
      message: 'Subscription request created successfully',
      data: {
        id: request._id,
        user: {
          id: request.user._id,
          name: request.user.name,
          email: request.user.email,
          phone: request.user.phone,
          profileImage: request.user.profileImage
        },
        plan: {
          id: request.plan._id,
          key: request.plan.key,
          translations: request.plan.translations
        },
        duration: request.duration,
        price: request.price,
        status: request.status,
        createdAt: request.createdAt
      }
    });
  } catch (error) {
    console.error('Create Subscription Request Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create subscription request'
    });
  }
};

/**
 * Get all subscription requests (Admin/Super Admin)
 * GET /api/subscription-requests
 */
export const getAllSubscriptionRequests = async (req, res) => {
  try {
    const { status } = req.query;
    
    // Build query
    const query = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.status = status;
    }

    // Get pagination
    const skip = req.pagination?.skip || 0;
    const limit = req.pagination?.limit || 10;

    // Get total count
    const total = await SubscriptionRequest.countDocuments(query);

    // Get requests
    const requests = await SubscriptionRequest.find(query)
      .populate('user', 'name email phone profileImage')
      .populate('plan')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const formattedRequests = requests.map(request => ({
      id: request._id,
      user: {
        id: request.user._id,
        name: request.user.name,
        email: request.user.email,
        phone: request.user.phone,
        profileImage: request.user.profileImage
      },
      plan: {
        id: request.plan._id,
        key: request.plan.key,
        translations: request.plan.translations
      },
      duration: request.duration,
      price: request.price,
      status: request.status,
      reviewedBy: request.reviewedBy ? {
        id: request.reviewedBy._id,
        name: request.reviewedBy.name,
        email: request.reviewedBy.email
      } : null,
      reviewedAt: request.reviewedAt,
      rejectionReason: request.rejectionReason,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt
    }));

    // Send response with pagination
    if (req.paginatedResponse) {
      res.status(200).json(req.paginatedResponse(formattedRequests, total));
    } else {
      res.status(200).json({
        success: true,
        data: formattedRequests,
        total
      });
    }
  } catch (error) {
    console.error('Get Subscription Requests Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get subscription requests'
    });
  }
};

/**
 * Get single subscription request (Admin/Super Admin)
 * GET /api/subscription-requests/:id
 */
export const getSubscriptionRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request ID'
      });
    }

    const request = await SubscriptionRequest.findById(id)
      .populate('user', 'name email phone profileImage')
      .populate('plan')
      .populate('reviewedBy', 'name email');

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Subscription request not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: request._id,
        user: {
          id: request.user._id,
          name: request.user.name,
          email: request.user.email,
          phone: request.user.phone,
          profileImage: request.user.profileImage
        },
        plan: {
          id: request.plan._id,
          key: request.plan.key,
          translations: request.plan.translations,
          subscriptionOptions: request.plan.subscriptionOptions
        },
        duration: request.duration,
        price: request.price,
        status: request.status,
        reviewedBy: request.reviewedBy ? {
          id: request.reviewedBy._id,
          name: request.reviewedBy.name,
          email: request.reviewedBy.email
        } : null,
        reviewedAt: request.reviewedAt,
        rejectionReason: request.rejectionReason,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt
      }
    });
  } catch (error) {
    console.error('Get Subscription Request Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get subscription request'
    });
  }
};

/**
 * Approve subscription request (Admin/Super Admin)
 * POST /api/subscription-requests/:id/approve
 */
export const approveSubscriptionRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request ID'
      });
    }

    const request = await SubscriptionRequest.findById(id)
      .populate('user')
      .populate('plan');

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Subscription request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `Request is already ${request.status}`
      });
    }

    // Use the duration from the request
    const duration = request.duration;
    
    // Map duration to type for subscription model
    let subscriptionType;
    if (duration === 'monthly' || duration === 'quarterly' || duration === 'semiAnnual') {
      subscriptionType = 'monthly';
    } else {
      subscriptionType = 'yearly';
    }

    // Calculate dates
    const startDate = new Date();
    let endDate = new Date();
    
    switch (duration) {
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'quarterly':
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case 'semiAnnual':
        endDate.setMonth(endDate.getMonth() + 6);
        break;
      case 'yearly':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }

    // Create or update subscription
    let subscription = await Subscription.findOne({ userId: request.user._id });
    
    if (subscription) {
      subscription.planId = request.plan._id;
      subscription.type = subscriptionType;
      subscription.status = 'active';
      subscription.startDate = startDate;
      subscription.endDate = endDate;
      await subscription.save();
    } else {
      subscription = await Subscription.create({
        userId: request.user._id,
        planId: request.plan._id,
        type: subscriptionType,
        status: 'active',
        startDate,
        endDate
      });
    }

    // Update user subscription status
    // Map plan key to valid subscriptionPlan enum
    const planKeyMapping = {
      'free': 'free',
      'pro': 'pro',
      'master': 'master',
      'otrade': 'otrade',
      'advanced_trading_strategy': 'master',
      'professional_trader': 'pro',
      'basic': 'free'
    };
    
    const planKey = request.plan.key;
    const mappedPlan = planKeyMapping[planKey] || 'free';
    
    request.user.subscriptionPlan = mappedPlan;
    request.user.subscriptionStatus = 'active';
    await request.user.save({ validateModifiedOnly: true });

    // Update request status
    request.status = 'approved';
    request.reviewedBy = req.admin?._id || req.user?._id;
    request.reviewedAt = new Date();
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Subscription request approved successfully',
      data: {
        requestId: request._id,
        userId: request.user._id,
        subscriptionId: subscription._id,
        duration: duration,
        status: 'approved'
      }
    });
  } catch (error) {
    console.error('Approve Subscription Request Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve subscription request'
    });
  }
};

/**
 * Reject subscription request (Admin/Super Admin)
 * POST /api/subscription-requests/:id/reject
 */
export const rejectSubscriptionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request ID'
      });
    }

    const request = await SubscriptionRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Subscription request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `Request is already ${request.status}`
      });
    }

    // Update request status
    request.status = 'rejected';
    request.reviewedBy = req.admin?._id || req.user?._id;
    request.reviewedAt = new Date();
    request.rejectionReason = reason || '';
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Subscription request rejected',
      data: {
        requestId: request._id,
        status: 'rejected'
      }
    });
  } catch (error) {
    console.error('Reject Subscription Request Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reject subscription request'
    });
  }
};

/**
 * Get my subscription requests (User)
 * GET /api/subscription-requests/my-requests
 */
export const getMySubscriptionRequests = async (req, res) => {
  try {
    const userId = req.user?._id || req.admin?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const requests = await SubscriptionRequest.find({ user: userId })
      .populate('plan')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    const formattedRequests = requests.map(request => ({
      id: request._id,
      plan: {
        id: request.plan._id,
        key: request.plan.key,
        translations: request.plan.translations
      },
      duration: request.duration,
      price: request.price,
      status: request.status,
      reviewedBy: request.reviewedBy ? {
        name: request.reviewedBy.name,
        email: request.reviewedBy.email
      } : null,
      reviewedAt: request.reviewedAt,
      rejectionReason: request.rejectionReason,
      createdAt: request.createdAt
    }));

    res.status(200).json({
      success: true,
      data: formattedRequests
    });
  } catch (error) {
    console.error('Get My Subscription Requests Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get subscription requests'
    });
  }
};

import User from './user.model.js';
import Newsletter from '../newsletter/newsletter.model.js';
import Subscription from '../subscriptions/subscription.model.js';
import Plan from '../plans/plan.model.js';
import mongoose from 'mongoose';

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionExpiry: user.subscriptionExpiry,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    // Get all users with populated plans
    const users = await User.find()
      .select('-password -resetPasswordToken -resetPasswordExpiry')
      .populate('subscribedPlans', 'name price duration')
      .populate('subscription.plan', 'name price duration')
      .sort({ createdAt: -1 });
    
    // Get newsletter subscriptions
    const newsletterEmails = await Newsletter.find().select('email');
    const newsletterEmailSet = new Set(newsletterEmails.map(n => n.email));
    
    // Get active subscriptions
    const activeSubscriptions = await Subscription.find({ status: 'active' })
      .select('userId type startDate endDate');
    
    // Create a map of user subscriptions
    const userSubscriptionsMap = {};
    activeSubscriptions.forEach(sub => {
      if (!userSubscriptionsMap[sub.userId.toString()]) {
        userSubscriptionsMap[sub.userId.toString()] = [];
      }
      userSubscriptionsMap[sub.userId.toString()].push({
        type: sub.type,
        startDate: sub.startDate,
        endDate: sub.endDate
      });
    });
    
    // Format users with additional info
    const formattedUsers = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      role: user.role,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionExpiry: user.subscriptionExpiry,
      subscribedPlans: user.subscribedPlans || [],
      activeSubscriptions: userSubscriptionsMap[user._id.toString()] || [],
      isNewsletterSubscribed: newsletterEmailSet.has(user.email),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));
    
    res.status(200).json({
      success: true,
      count: formattedUsers.length,
      users: formattedUsers
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error.' 
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid user ID.' });
    }
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    res.status(200).json({
      user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * Admin subscribes user to a plan
 * POST /api/user/:userId/subscribe
 * Admin only
 */
const adminSubscribeUserToPlan = async (req, res) => {
  try {
    const { userId } = req.params;
    const { planId, duration } = req.body;

    console.log('\n===== ADMIN SUBSCRIBE USER DEBUG =====');
    console.log('User ID:', userId);
    console.log('Plan ID:', planId);
    console.log('Duration:', duration);
    console.log('======================================\n');

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(planId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan ID'
      });
    }

    // Validate duration
    if (!duration || !['monthly', 'quarterly', 'semiAnnual', 'yearly'].includes(duration)) {
      return res.status(400).json({
        success: false,
        error: 'Duration must be one of: monthly, quarterly, semiAnnual, yearly'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if plan exists
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
    let subscription = await Subscription.findOne({ userId: userId });
    
    if (subscription) {
      subscription.planId = planId;
      subscription.type = subscriptionType;
      subscription.status = 'active';
      subscription.startDate = startDate;
      subscription.endDate = endDate;
      await subscription.save();
      console.log('Subscription updated:', subscription._id);
    } else {
      subscription = await Subscription.create({
        userId: userId,
        planId: planId,
        type: subscriptionType,
        status: 'active',
        startDate,
        endDate
      });
      console.log('Subscription created:', subscription._id);
    }

    // Update user subscription status
    // Only update subscriptionPlan if the plan key matches the enum
    const validPlans = ['free', 'pro', 'master', 'otrade'];
    const planKey = plan.key;
    
    console.log('Plan key:', planKey);
    
    // Only update if it's a valid enum value
    if (validPlans.includes(planKey)) {
      user.subscriptionPlan = planKey;
    }
    
    user.subscriptionStatus = 'active';
    await user.save({ validateModifiedOnly: true });
    
    console.log('User updated successfully');

    res.status(201).json({
      success: true,
      message: 'User subscribed to plan successfully',
      data: {
        subscription: {
          id: subscription._id,
          userId: subscription.userId,
          planId: subscription.planId,
          type: subscription.type,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          status: subscription.status,
          duration: duration
        },
        plan: {
          id: plan._id,
          key: plan.key,
          translations: plan.translations,
          price: plan.subscriptionOptions[duration]?.price
        },
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          subscriptionStatus: user.subscriptionStatus
        }
      }
    });
  } catch (error) {
    console.error('Admin Subscribe User Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to subscribe user to plan'
    });
  }
};

export { getProfile, getAllUsers, getUserById, adminSubscribeUserToPlan };
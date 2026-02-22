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
    if (!duration || !['monthly', 'yearly'].includes(duration)) {
      return res.status(400).json({
        success: false,
        error: 'Duration must be either "monthly" or "yearly"'
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

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    if (duration === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Create subscription
    const subscription = await Subscription.create({
      userId: userId,
      type: duration,
      startDate,
      endDate,
      status: 'active'
    });

    // Update user's subscribedPlans if not already included
    if (!user.subscribedPlans.includes(planId)) {
      user.subscribedPlans.push(planId);
    }

    // Map plan key to subscriptionPlan enum
    let subscriptionPlanType = 'free';
    
    // Use plan.key instead of plan.name (which doesn't exist)
    const planKey = plan.key ? plan.key.toLowerCase() : '';
    const planTitleEn = plan.translations?.en?.title ? plan.translations.en.title.toLowerCase() : '';
    
    console.log('Plan key:', plan.key);
    console.log('Plan title (EN):', plan.translations?.en?.title);
    
    // Try to match by key first, then by title
    const searchText = planKey || planTitleEn;
    
    if (searchText.includes('pro')) {
      subscriptionPlanType = 'pro';
    } else if (searchText.includes('master')) {
      subscriptionPlanType = 'master';
    } else if (searchText.includes('otrade')) {
      subscriptionPlanType = 'otrade';
    }
    
    console.log('Mapped subscriptionPlan:', subscriptionPlanType);

    // Update user subscription info
    user.subscription = {
      plan: planId,
      duration,
      startDate,
      endDate
    };
    user.subscriptionPlan = subscriptionPlanType;
    user.subscriptionStatus = 'active';
    user.subscriptionExpiry = endDate;

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User subscribed to plan successfully',
      data: {
        subscription: {
          id: subscription._id,
          userId: subscription.userId,
          type: subscription.type,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          status: subscription.status
        },
        plan: {
          id: plan._id,
          key: plan.key,
          title: {
            en: plan.translations?.en?.title,
            ar: plan.translations?.ar?.title
          }
        },
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          subscriptionPlan: user.subscriptionPlan,
          subscriptionStatus: user.subscriptionStatus,
          subscriptionExpiry: user.subscriptionExpiry
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
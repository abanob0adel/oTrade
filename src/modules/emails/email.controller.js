import { Resend } from 'resend';
import User from '../users/user.model.js';
import Subscription from '../subscriptions/subscription.model.js';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send bulk email
 * POST /api/emails/send
 * Admin only
 */
export const sendBulkEmail = async (req, res) => {
  try {
    console.log('\n===== SEND BULK EMAIL DEBUG =====');
    console.log('Body:', req.body);
    console.log('=================================\n');

    const { subject, htmlContent, recipientType, selectedUserIds } = req.body;

    // Validate required fields
    if (!subject || !htmlContent) {
      return res.status(400).json({
        success: false,
        error: 'Subject and HTML content are required'
      });
    }

    if (!recipientType) {
      return res.status(400).json({
        success: false,
        error: 'Recipient type is required (all, subscribed, unsubscribed, selected)'
      });
    }

    let recipients = [];

    // Get recipients based on type
    switch (recipientType) {
      case 'all':
        // Get all users
        recipients = await User.find({}, 'email name');
        break;

      case 'subscribed':
        // Get users with active subscriptions
        const activeSubscriptions = await Subscription.find({ 
          status: 'active',
          endDate: { $gte: new Date() }
        }).distinct('userId');
        
        recipients = await User.find({ 
          _id: { $in: activeSubscriptions }
        }, 'email name');
        break;

      case 'unsubscribed':
        // Get users without active subscriptions
        // This includes:
        // 1. Users who never had a subscription
        // 2. Users with expired subscriptions
        const subscribedUserIds = await Subscription.find({ 
          status: 'active',
          endDate: { $gte: new Date() }
        }).distinct('userId');
        
        // Get all users who are NOT in the subscribed list
        recipients = await User.find({ 
          _id: { $nin: subscribedUserIds }
        }, 'email name');
        
        console.log(`Found ${subscribedUserIds.length} subscribed users`);
        console.log(`Found ${recipients.length} unsubscribed users`);
        break;

      case 'selected':
        // Get specific users by IDs
        if (!selectedUserIds || !Array.isArray(selectedUserIds) || selectedUserIds.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Selected user IDs are required when recipientType is "selected"'
          });
        }

        recipients = await User.find({ 
          _id: { $in: selectedUserIds }
        }, 'email name');
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid recipient type. Must be: all, subscribed, unsubscribed, or selected'
        });
    }

    if (recipients.length === 0) {
      console.log('⚠️ No recipients found. Debug info:');
      console.log('- Recipient type:', recipientType);
      
      if (recipientType === 'unsubscribed') {
        const totalUsers = await User.countDocuments();
        const activeSubsCount = await Subscription.countDocuments({ 
          status: 'active',
          endDate: { $gte: new Date() }
        });
        console.log('- Total users in DB:', totalUsers);
        console.log('- Active subscriptions:', activeSubsCount);
        console.log('- Expected unsubscribed:', totalUsers - activeSubsCount);
      }
      
      return res.status(404).json({
        success: false,
        error: 'No recipients found for the selected criteria'
      });
    }

    console.log(`Found ${recipients.length} recipients`);

    // Filter for testing mode (only send to verified email in Resend test mode)
    const isTestMode = process.env.RESEND_TEST_MODE === 'true';
    const verifiedEmail = process.env.RESEND_VERIFIED_EMAIL || 'kirellossamy8@gmail.com';
    
    if (isTestMode) {
      const originalCount = recipients.length;
      recipients = recipients.filter(user => user.email === verifiedEmail);
      console.log(`⚠️ Test mode enabled. Filtered from ${originalCount} to ${recipients.length} verified recipients`);
    }

    // Prepare email list and validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailList = recipients
      .map(user => user.email)
      .filter(email => {
        if (!email || typeof email !== 'string') {
          console.warn('⚠️ Skipping invalid email (empty or not string):', email);
          return false;
        }
        const trimmedEmail = email.trim();
        if (!emailRegex.test(trimmedEmail)) {
          console.warn('⚠️ Skipping invalid email format:', trimmedEmail);
          return false;
        }
        return true;
      })
      .map(email => email.trim().toLowerCase());

    if (emailList.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid email addresses found in recipients'
      });
    }

    console.log(`Valid emails after filtering: ${emailList.length} out of ${recipients.length}`);

    // Send email using Resend
    // Note: Resend has a limit on batch sending, so we might need to chunk
    const BATCH_SIZE = 50; // Resend's batch limit
    const batches = [];
    
    for (let i = 0; i < emailList.length; i += BATCH_SIZE) {
      batches.push(emailList.slice(i, i + BATCH_SIZE));
    }

    console.log(`Sending ${batches.length} batches...`);

    const results = [];
    const errors = [];

    for (let i = 0; i < batches.length; i++) {
      try {
        console.log(`📧 Sending batch ${i + 1}/${batches.length} with ${batches[i].length} emails...`);
        console.log(`Recipients: ${batches[i].join(', ')}`);
        
        const { data, error } = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'OTrade <onboarding@resend.dev>',
          to: batches[i],
          subject: subject,
          html: htmlContent
        });

        if (error) {
          console.error(`❌ Batch ${i + 1} error:`, error);
          errors.push({ batch: i + 1, error });
        } else {
          console.log(`✅ Batch ${i + 1} sent successfully!`);
          console.log(`Email ID: ${data.id}`);
          console.log(`Check status at: https://resend.com/emails/${data.id}`);
          results.push({ batch: i + 1, data });
        }
      } catch (error) {
        console.error(`❌ Batch ${i + 1} exception:`, error);
        errors.push({ batch: i + 1, error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `Email sent to ${emailList.length} valid recipients in ${batches.length} batches`,
      data: {
        totalRecipients: recipients.length,
        validEmails: emailList.length,
        invalidEmails: recipients.length - emailList.length,
        totalBatches: batches.length,
        successfulBatches: results.length,
        failedBatches: errors.length,
        results,
        errors: errors.length > 0 ? errors : undefined
      },
      note: 'Emails sent successfully. If recipients are not receiving emails, check: 1) Spam/Junk folders, 2) DNS records (SPF, DKIM, DMARC) are configured at https://resend.com/domains, 3) Email status at https://resend.com/emails'
    });

  } catch (error) {
    console.error('Send Bulk Email Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send bulk email',
      details: error.message
    });
  }
};

/**
 * Get recipient count by type
 * POST /api/emails/recipients/count
 * Admin only
 */
export const getRecipientCount = async (req, res) => {
  try {
    const { recipientType, selectedUserIds } = req.body;

    if (!recipientType) {
      return res.status(400).json({
        success: false,
        error: 'Recipient type is required'
      });
    }

    let count = 0;

    switch (recipientType) {
      case 'all':
        count = await User.countDocuments();
        break;

      case 'subscribed':
        const activeSubscriptions = await Subscription.find({ 
          status: 'active',
          endDate: { $gte: new Date() }
        }).distinct('userId');
        
        count = activeSubscriptions.length;
        break;

      case 'unsubscribed':
        const subscribedUserIds = await Subscription.find({ 
          status: 'active',
          endDate: { $gte: new Date() }
        }).distinct('userId');
        
        count = await User.countDocuments({ 
          _id: { $nin: subscribedUserIds }
        });
        break;

      case 'selected':
        if (!selectedUserIds || !Array.isArray(selectedUserIds)) {
          return res.status(400).json({
            success: false,
            error: 'Selected user IDs are required'
          });
        }
        count = selectedUserIds.length;
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid recipient type'
        });
    }

    res.status(200).json({
      success: true,
      data: {
        recipientType,
        count
      }
    });

  } catch (error) {
    console.error('Get Recipient Count Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recipient count'
    });
  }
};

/**
 * Get all users for selection
 * GET /api/emails/users
 * Admin only
 */
export const getAllUsersForEmail = async (req, res) => {
  try {
    const users = await User.find({}, 'name email subscriptionStatus')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: users
    });

  } catch (error) {
    console.error('Get All Users Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get users'
    });
  }
};

import { Resend } from 'resend';

/**
 * 📧 Email Service
 * Sends emails using Resend
 */

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * 📧 Send password reset email
 * @param {string} to - Recipient email
 * @param {string} resetCode - 4-digit password reset code
 * @param {string} userName - User's name
 */
export const sendPasswordResetEmail = async (to, resetCode, userName) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️  Resend API key not configured. Emails will not be sent.');
    console.log('📧 Reset code:', resetCode);
    return false;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background: #ffffff;
          border-radius: 8px;
          padding: 40px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 32px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        h1 {
          color: #1f2937;
          font-size: 24px;
          margin-bottom: 20px;
        }
        .content {
          margin-bottom: 30px;
        }
        .code-box {
          background: #f3f4f6;
          border: 2px solid #2563eb;
          border-radius: 8px;
          padding: 30px;
          text-align: center;
          margin: 30px 0;
        }
        .code {
          font-size: 48px;
          font-weight: bold;
          color: #2563eb;
          letter-spacing: 8px;
          font-family: 'Courier New', monospace;
        }
        .info-box {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 14px;
          color: #6b7280;
          text-align: center;
        }
        .warning {
          color: #dc2626;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🔐 OTrade</div>
        </div>
        
        <h1>Password Reset Request</h1>
        
        <div class="content">
          <p>Hello ${userName || 'there'},</p>
          
          <p>We received a request to reset your password for your OTrade account. Use the code below to reset your password:</p>
          
          <div class="code-box">
            <div class="code">${resetCode}</div>
          </div>
          
          <div class="info-box">
            <p style="margin: 0;"><strong>⏰ This code will expire in 10 minutes</strong></p>
          </div>
          
          <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
          
          <p class="warning">⚠️ For security reasons, never share this code with anyone.</p>
        </div>
        
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>&copy; ${new Date().getFullYear()} OTrade. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    console.log(`📧 Sending password reset code to: ${to}`);
    
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'OTrade <noreply@otrade.ae>',
      to: [to],
      subject: 'Password Reset Code - OTrade',
      html: htmlContent
    });

    if (error) {
      console.error('❌ Resend error:', error);
      throw new Error('Failed to send password reset email');
    }

    console.log('✅ Email sent successfully:', data?.id);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    throw new Error('Failed to send password reset email');
  }
};

/**
 * 📧 Send welcome email
 * @param {string} to - Recipient email
 * @param {string} userName - User's name
 */
export const sendWelcomeEmail = async (to, userName) => {
  if (!process.env.RESEND_API_KEY) {
    console.log('📧 Resend API key not configured. Welcome email not sent.');
    return false;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background: #ffffff;
          border-radius: 8px;
          padding: 40px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .logo {
          font-size: 32px;
          font-weight: bold;
          color: #2563eb;
          text-align: center;
          margin-bottom: 30px;
        }
        h1 {
          color: #1f2937;
          font-size: 24px;
        }
        .button {
          display: inline-block;
          padding: 14px 32px;
          background: #2563eb;
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">🎉 OTrade</div>
        <h1>Welcome to OTrade!</h1>
        <p>Hello ${userName},</p>
        <p>Thank you for joining OTrade! We're excited to have you on board.</p>
        <p>You can now access all our trading resources and start your journey to becoming a better trader.</p>
        <div style="text-align: center;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="button">Go to Dashboard</a>
        </div>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Happy trading!</p>
        <p style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; text-align: center;">
          &copy; ${new Date().getFullYear()} OTrade. All rights reserved.
        </p>
      </div>
    </body>
    </html>
  `;

  try {
    console.log(`📧 Sending welcome email to: ${to}`);
    
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'OTrade <noreply@otrade.ae>',
      to: [to],
      subject: 'Welcome to OTrade! 🎉',
      html: htmlContent
    });

    if (error) {
      console.error('❌ Resend error:', error);
      return false;
    }

    console.log('✅ Welcome email sent successfully:', data?.id);
    return true;
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error.message);
    return false; // Don't throw error for welcome email
  }
};

export default {
  sendPasswordResetEmail,
  sendWelcomeEmail
};

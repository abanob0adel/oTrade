/**
 * Email Template Utilities
 * Adds professional footer with unsubscribe link to prevent spam
 */

/**
 * Wrap email content with professional template
 * @param {string} content - HTML content
 * @param {object} options - Template options
 * @returns {string} - Complete HTML email
 */
export const wrapEmailTemplate = (content, options = {}) => {
  const {
    preheader = '',
    unsubscribeUrl = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/unsubscribe` : 'https://otrade.ae/unsubscribe',
    companyName = 'OTrade',
    companyAddress = 'United Arab Emirates',
    showUnsubscribe = true
  } = options;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  ${preheader ? `<meta name="description" content="${preheader}">` : ''}
  <title>${companyName}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #f4f4f4;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .email-header {
      background-color: #2563eb;
      padding: 20px;
      text-align: center;
    }
    .email-header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 24px;
    }
    .email-body {
      padding: 30px 20px;
    }
    .email-footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #6c757d;
      border-top: 1px solid #dee2e6;
    }
    .email-footer a {
      color: #2563eb;
      text-decoration: none;
    }
    .email-footer a:hover {
      text-decoration: underline;
    }
    .unsubscribe-link {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #dee2e6;
    }
    @media only screen and (max-width: 600px) {
      .email-body {
        padding: 20px 15px;
      }
    }
  </style>
</head>
<body>
  ${preheader ? `<div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</div>` : ''}
  
  <div class="email-container">
    <div class="email-body">
      ${content}
    </div>
    
    <div class="email-footer">
      <p style="margin: 0 0 10px 0;">
        <strong>${companyName}</strong><br>
        ${companyAddress}
      </p>
      
      <p style="margin: 10px 0;">
        You're receiving this email because you have an account with ${companyName}.
      </p>
      
      ${showUnsubscribe ? `
      <div class="unsubscribe-link">
        <p style="margin: 0;">
          Don't want to receive these emails? 
          <a href="${unsubscribeUrl}" style="color: #2563eb;">Unsubscribe</a>
        </p>
      </div>
      ` : ''}
      
      <p style="margin: 15px 0 0 0; font-size: 11px; color: #999;">
        &copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
};

/**
 * Add unsubscribe footer to existing HTML
 * @param {string} htmlContent - Existing HTML content
 * @param {string} unsubscribeUrl - Unsubscribe URL
 * @returns {string} - HTML with footer
 */
export const addUnsubscribeFooter = (htmlContent, unsubscribeUrl) => {
  const footer = `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280;">
      <p style="margin: 10px 0;">
        You're receiving this email because you have an account with OTrade.
      </p>
      <p style="margin: 10px 0;">
        Don't want to receive these emails? 
        <a href="${unsubscribeUrl || 'https://otrade.ae/unsubscribe'}" style="color: #2563eb; text-decoration: none;">Unsubscribe</a>
      </p>
      <p style="margin: 15px 0 0 0; font-size: 11px; color: #999;">
        &copy; ${new Date().getFullYear()} OTrade. All rights reserved.
      </p>
    </div>
  `;

  // Check if HTML already has closing body tag
  if (htmlContent.includes('</body>')) {
    return htmlContent.replace('</body>', `${footer}</body>`);
  } else if (htmlContent.includes('</html>')) {
    return htmlContent.replace('</html>', `${footer}</html>`);
  } else {
    // Just append footer
    return htmlContent + footer;
  }
};

/**
 * Validate email content for spam triggers
 * @param {string} subject - Email subject
 * @param {string} content - Email content
 * @returns {object} - Validation result with warnings
 */
export const validateEmailContent = (subject, content) => {
  const warnings = [];
  const spamWords = [
    'free', 'winner', 'cash', 'prize', 'urgent', 'act now', 
    'limited time', 'click here', 'buy now', 'order now',
    'guarantee', 'no risk', '100%', 'money back'
  ];

  // Check subject
  const subjectLower = subject.toLowerCase();
  const foundSpamWords = spamWords.filter(word => subjectLower.includes(word));
  
  if (foundSpamWords.length > 0) {
    warnings.push(`Subject contains potential spam words: ${foundSpamWords.join(', ')}`);
  }

  if (subject.includes('!!!') || subject.includes('???')) {
    warnings.push('Subject contains excessive punctuation');
  }

  if (subject === subject.toUpperCase() && subject.length > 5) {
    warnings.push('Subject is all caps');
  }

  // Check content
  const contentLower = content.toLowerCase();
  const contentSpamWords = spamWords.filter(word => contentLower.includes(word));
  
  if (contentSpamWords.length > 3) {
    warnings.push(`Content contains multiple spam trigger words: ${contentSpamWords.slice(0, 5).join(', ')}`);
  }

  // Check for unsubscribe link
  if (!content.includes('unsubscribe') && !content.includes('Unsubscribe')) {
    warnings.push('Content missing unsubscribe link (recommended for bulk emails)');
  }

  return {
    isValid: warnings.length === 0,
    warnings,
    score: Math.max(0, 100 - (warnings.length * 20))
  };
};

export default {
  wrapEmailTemplate,
  addUnsubscribeFooter,
  validateEmailContent
};

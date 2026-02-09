# 📧 Email Setup Guide - Gmail Configuration

## 🎯 Overview

This guide will help you configure Gmail to send password reset emails from your application.

---

## 📝 Step-by-Step Setup

### Step 1: Enable 2-Step Verification

1. Go to your Google Account: https://myaccount.google.com/security
2. Find "2-Step Verification" section
3. Click "Get Started" and follow the instructions
4. Complete the 2-Step Verification setup

**Why?** App Passwords are only available when 2-Step Verification is enabled.

---

### Step 2: Generate App Password

1. Go to: https://myaccount.google.com/apppasswords
2. You may need to sign in again
3. Under "Select app", choose **"Mail"**
4. Under "Select device", choose **"Other (Custom name)"**
5. Enter a name like: **"OTrade Backend"**
6. Click **"Generate"**
7. Google will show you a 16-character password like: `abcd efgh ijkl mnop`
8. **Copy this password** (you won't see it again!)

---

### Step 3: Update .env File

Open your `.env` file and update these values:

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
EMAIL_FROM_NAME=OTrade
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**Important Notes:**
- `EMAIL_USER`: Your full Gmail address (e.g., `john@gmail.com`)
- `EMAIL_PASSWORD`: The 16-character App Password (remove spaces)
- `EMAIL_FROM_NAME`: The name that appears in emails
- `FRONTEND_URL`: Your frontend URL (for reset links)

---

### Step 4: Test Email Sending

Restart your backend server:

```bash
npm start
```

Test forgot password endpoint:

```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

Check your console logs for:
```
📧 Sending password reset email to: test@example.com
✅ Email sent successfully: <message-id>
```

---

## 🔍 Troubleshooting

### Problem: "Invalid login: 535-5.7.8 Username and Password not accepted"

**Solution:**
- Make sure you're using the **App Password**, not your regular Gmail password
- Remove any spaces from the App Password
- Verify 2-Step Verification is enabled

### Problem: "Less secure app access"

**Solution:**
- This is outdated. Use App Passwords instead (as described above)
- App Passwords are the secure way to authenticate

### Problem: Email not received

**Check:**
1. ✅ Spam/Junk folder
2. ✅ Console logs for errors
3. ✅ Email address is correct
4. ✅ Gmail account has sending limits (500 emails/day for free accounts)

### Problem: "Application-specific password required"

**Solution:**
- You need to generate an App Password (Step 2 above)
- Regular Gmail password won't work

---

## 📧 Email Templates

### Password Reset Email

The system sends a professional HTML email with:
- ✅ Reset password button
- ✅ Clickable link (if button doesn't work)
- ✅ 1-hour expiration notice
- ✅ Security warning
- ✅ Professional design

### Welcome Email

Sent automatically when user registers:
- ✅ Welcome message
- ✅ Dashboard link
- ✅ Professional branding

---

## 🔒 Security Best Practices

### Do's ✅
- ✅ Use App Passwords (never regular password)
- ✅ Keep App Password in `.env` file
- ✅ Add `.env` to `.gitignore`
- ✅ Use different App Passwords for different apps
- ✅ Revoke App Passwords you're not using

### Don'ts ❌
- ❌ Never commit `.env` to Git
- ❌ Never share your App Password
- ❌ Never use regular Gmail password in code
- ❌ Never hardcode credentials

---

## 🌐 Alternative Email Services

### Using Other Email Services

The system supports other email services too:

#### Outlook/Hotmail
```env
EMAIL_SERVICE=hotmail
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

#### Yahoo
```env
EMAIL_SERVICE=yahoo
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-password
```

#### Custom SMTP
```env
EMAIL_HOST=smtp.your-domain.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@your-domain.com
EMAIL_PASSWORD=your-password
```

---

## 📊 Gmail Sending Limits

### Free Gmail Account
- **500 emails per day**
- **500 recipients per email**
- Limit resets at midnight Pacific Time

### Google Workspace (Paid)
- **2,000 emails per day**
- **2,000 recipients per email**
- Better for production use

---

## 🧪 Testing

### Test in Development

The system automatically logs reset tokens in development mode:

```javascript
// Console output
🔐 Password reset URL: http://localhost:3000/reset-password/abc123...
```

You can use this URL directly without checking email.

### Test in Production

In production, tokens are only sent via email (not logged).

---

## 📝 Example .env Configuration

```env
# Complete Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=otrade.support@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
EMAIL_FROM_NAME=OTrade Support
FRONTEND_URL=https://otrade.com
NODE_ENV=production
```

---

## ✅ Verification Checklist

Before going to production:

- [ ] 2-Step Verification enabled on Gmail
- [ ] App Password generated
- [ ] `.env` file updated with correct credentials
- [ ] `.env` added to `.gitignore`
- [ ] Test email sent successfully
- [ ] Email received in inbox (not spam)
- [ ] Reset link works correctly
- [ ] Email templates look professional
- [ ] Sending limits understood

---

## 🆘 Need Help?

### Common Issues

1. **"Username and Password not accepted"**
   - Use App Password, not regular password
   - Remove spaces from App Password

2. **"Less secure app access"**
   - Use App Passwords (modern method)
   - Don't enable "Less secure app access"

3. **Email goes to spam**
   - Add SPF/DKIM records (for custom domains)
   - Use professional email content
   - Avoid spam trigger words

4. **Rate limit exceeded**
   - Gmail free: 500 emails/day
   - Upgrade to Google Workspace for more

---

## 📞 Support Resources

- **Gmail Help:** https://support.google.com/mail
- **App Passwords:** https://support.google.com/accounts/answer/185833
- **Nodemailer Docs:** https://nodemailer.com/about/

---

**✅ Once configured, your password reset emails will be sent automatically!**

# ⚡ Email Setup - Quick Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Gmail App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Select: **Mail** → **Other (Custom name)**
3. Enter name: **OTrade Backend**
4. Click **Generate**
5. Copy the 16-character password

### Step 2: Update .env

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
EMAIL_FROM_NAME=OTrade
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Step 3: Restart Server

```bash
npm start
```

### Step 4: Test

```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

---

## ✅ What You Get

- ✅ Professional HTML emails
- ✅ Password reset with clickable button
- ✅ Welcome emails for new users
- ✅ 1-hour token expiration
- ✅ Security warnings

---

## 🔍 Troubleshooting

**Email not sent?**
- Check console for errors
- Verify App Password (no spaces)
- Check spam folder

**"Invalid login"?**
- Use App Password, not regular password
- Enable 2-Step Verification first

---

**Full guide:** `EMAIL_SETUP_GUIDE.md`

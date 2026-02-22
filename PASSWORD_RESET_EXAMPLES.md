# Password Reset System - Postman Examples

## 📋 Overview

نظام إعادة تعيين كلمة المرور باستخدام كود مكون من 4 أرقام يُرسل عبر البريد الإلكتروني.

**Base URL:** `/api/auth`

---

## 🔄 Password Reset Flow

### Step 1: Request Reset Code
المستخدم يطلب كود إعادة التعيين عن طريق إدخال البريد الإلكتروني.

### Step 2: Receive Code via Email
يتم إرسال كود مكون من 4 أرقام إلى البريد الإلكتروني (صالح لمدة 10 دقائق).

### Step 3: Reset Password
المستخدم يدخل الكود وكلمة المرور الجديدة.

---

## 1. Request Password Reset Code

### Endpoint
```
POST http://localhost:3000/api/auth/forgot-password
```

### Headers
```
Content-Type: application/json
```

### Body (JSON)
```json
{
  "email": "user@example.com"
}
```

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Password reset code sent to your email",
  "resetCode": "1234"
}
```

**Note:** الـ `resetCode` يظهر فقط في development mode للتجربة.

### Response (Email Not Found - 200)
```json
{
  "success": true,
  "message": "If your email is registered, you will receive a password reset code"
}
```

**Note:** لأسباب أمنية، نفس الرسالة تُرسل سواء كان البريد موجود أو لا.

### Response (Validation Error - 400)
```json
{
  "success": false,
  "error": "Email is required"
}
```

---

## 2. Reset Password with Code

### Endpoint
```
POST http://localhost:3000/api/auth/reset-password
```

### Headers
```
Content-Type: application/json
```

### Body (JSON)
```json
{
  "code": "1234",
  "password": "newPassword123"
}
```

### Parameters
- `code`: الكود المكون من 4 أرقام المُرسل عبر البريد الإلكتروني
- `password`: كلمة المرور الجديدة (6 أحرف على الأقل)

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Password reset successful. You can now login with your new password"
}
```

### Response (Invalid/Expired Code - 400)
```json
{
  "success": false,
  "error": "Invalid or expired reset code"
}
```

### Response (Validation Errors - 400)
```json
{
  "success": false,
  "error": "Code and new password are required"
}
```

```json
{
  "success": false,
  "error": "Password must be at least 6 characters"
}
```

---

## 📧 Email Template

عند طلب إعادة تعيين كلمة المرور، يتلقى المستخدم بريد إلكتروني يحتوي على:

- **Subject:** Password Reset Code - OTrade
- **Content:**
  - رسالة ترحيب باسم المستخدم
  - الكود المكون من 4 أرقام في صندوق بارز
  - تنبيه بأن الكود صالح لمدة 10 دقائق
  - تحذير أمني بعدم مشاركة الكود

### Email Example
```
🔐 OTrade

Password Reset Request

Hello Ahmed,

We received a request to reset your password for your OTrade account. 
Use the code below to reset your password:

┌─────────────────┐
│     1 2 3 4     │
└─────────────────┘

⏰ This code will expire in 10 minutes

If you didn't request a password reset, you can safely ignore this email.

⚠️ For security reasons, never share this code with anyone.
```

---

## 📝 Complete Workflow Example

### Step 1: User Requests Reset Code
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmed@example.com"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset code sent to your email"
}
```

### Step 2: User Checks Email
المستخدم يفتح البريد الإلكتروني ويجد الكود: `1234`

### Step 3: User Resets Password
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "code": "1234",
    "password": "myNewPassword123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successful. You can now login with your new password"
}
```

### Step 4: User Logs In with New Password
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmed@example.com",
    "password": "myNewPassword123"
  }'
```

---

## 🔒 Security Features

### Code Generation
- كود عشوائي مكون من 4 أرقام (1000-9999)
- يتم توليده باستخدام `Math.random()` لضمان العشوائية

### Code Expiry
- الكود صالح لمدة 10 دقائق فقط
- بعد انتهاء الصلاحية، يجب طلب كود جديد

### Code Storage
- الكود يُحفظ مباشرة في قاعدة البيانات (plain text)
- يتم حذف الكود تلقائياً بعد استخدامه بنجاح

### Email Privacy
- لا يتم الكشف عن وجود البريد الإلكتروني في قاعدة البيانات
- نفس الرسالة تُرسل سواء كان البريد موجود أو لا

### Password Requirements
- 6 أحرف على الأقل
- يتم تشفير كلمة المرور باستخدام bcrypt

---

## 🎯 Testing Checklist

### Forgot Password
- [ ] Request code with valid email
- [ ] Request code with non-existent email (should return same message)
- [ ] Request code without email (should fail)
- [ ] Verify email is sent with 4-digit code
- [ ] Verify code expires after 10 minutes

### Reset Password
- [ ] Reset with valid code and new password
- [ ] Try with invalid code (should fail)
- [ ] Try with expired code (should fail)
- [ ] Try with password less than 6 characters (should fail)
- [ ] Try without code or password (should fail)
- [ ] Verify old password no longer works
- [ ] Verify new password works for login

### Security
- [ ] Code is random and unique
- [ ] Code expires after 10 minutes
- [ ] Code is deleted after successful use
- [ ] Cannot reuse the same code
- [ ] Email doesn't reveal if account exists

---

## 💡 Use Cases

### 1. User Forgot Password
```
POST /api/auth/forgot-password
Body: { "email": "user@example.com" }
```

### 2. User Enters Wrong Code
```
POST /api/auth/reset-password
Body: { "code": "9999", "password": "newPass123" }
Response: "Invalid or expired reset code"
```

### 3. Code Expired (After 10 Minutes)
```
POST /api/auth/reset-password
Body: { "code": "1234", "password": "newPass123" }
Response: "Invalid or expired reset code"
```

### 4. Request New Code
```
POST /api/auth/forgot-password
Body: { "email": "user@example.com" }
Note: Old code becomes invalid, new code is generated
```

---

## 🚀 Quick Start (Postman Collection)

### Collection Variables
```
base_url: http://localhost:3000
```

### Request 1: Forgot Password
```
POST {{base_url}}/api/auth/forgot-password
Content-Type: application/json

{
  "email": "{{user_email}}"
}
```

### Request 2: Reset Password
```
POST {{base_url}}/api/auth/reset-password
Content-Type: application/json

{
  "code": "{{reset_code}}",
  "password": "{{new_password}}"
}
```

---

## 📊 Database Schema

### User Model - Reset Fields
```javascript
{
  resetPasswordCode: {
    type: String,
    select: false  // Not returned in queries by default
  },
  resetPasswordExpiry: {
    type: Date,
    select: false
  }
}
```

### Index
```javascript
userSchema.index({ resetPasswordCode: 1 });
```

---

## 🔧 Configuration

### Environment Variables
```env
# Email Service (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM_NAME=OTrade

# Frontend URL (for email templates)
FRONTEND_URL=http://localhost:3000

# Environment
NODE_ENV=development  # Shows reset code in response for testing
```

---

## 📱 Frontend Integration

### Step 1: Forgot Password Screen
```javascript
// User enters email
const response = await fetch('/api/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: userEmail })
});

// Show message: "Check your email for reset code"
```

### Step 2: Enter Code Screen
```javascript
// User enters 4-digit code and new password
const response = await fetch('/api/auth/reset-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    code: resetCode,
    password: newPassword 
  })
});

// Redirect to login page
```

---

## ⚠️ Important Notes

1. **Code Expiry:** الكود صالح لمدة 10 دقائق فقط
2. **One-Time Use:** الكود يُستخدم مرة واحدة فقط
3. **Development Mode:** في development، الكود يظهر في الـ response للتجربة
4. **Production Mode:** في production، الكود يُرسل فقط عبر البريد الإلكتروني
5. **Email Service:** تأكد من إعداد Gmail App Password بشكل صحيح
6. **Security:** لا تشارك الكود مع أي شخص

---

## 🐛 Troubleshooting

### Email Not Received
- تحقق من إعدادات Gmail App Password
- تحقق من spam folder
- تحقق من الـ console logs للأخطاء

### Invalid Code Error
- تأكد من إدخال الكود بشكل صحيح (4 أرقام)
- تحقق من عدم انتهاء صلاحية الكود (10 دقائق)
- جرب طلب كود جديد

### Password Too Short
- كلمة المرور يجب أن تكون 6 أحرف على الأقل

---

## 📈 Future Enhancements

- [ ] Rate limiting لمنع spam
- [ ] إضافة captcha
- [ ] SMS verification كبديل للبريد الإلكتروني
- [ ] تسجيل محاولات إعادة التعيين الفاشلة
- [ ] إشعار المستخدم عند تغيير كلمة المرور بنجاح
